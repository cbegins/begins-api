import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { supabaseAdmin } from "@/lib/supabase"
import { checkRateLimit, getCachedGeminiResponse, cacheGeminiResponse } from "@/lib/redis"
import { AI_CONFIG, MODEL_DISPLAY_NAME } from "@/config/models"

// Production-ready API keys from environment
const API_KEYS = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(
  Boolean,
) as string[]

// Rate limiting configuration
const RATE_LIMITS = {
  free: { requests: 100, window: 24 * 60 * 60 * 1000 },
  pro: { requests: 2000, window: 7 * 24 * 60 * 60 * 1000 },
  unlimited: { requests: 6000, window: 60 * 60 * 1000 },
  admin: { requests: 999999, window: 60 * 60 * 1000 },
}

// Key usage tracking
const keyUsageStore = new Map<string, { requests: number; lastReset: number }>()

// Pre-initialize models for faster response
const modelCache = new Map<string, any>()

function getModel(apiKey: string) {
  if (!modelCache.has(apiKey)) {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: AI_CONFIG.MODEL_NAME,
      generationConfig: {
        maxOutputTokens: AI_CONFIG.MAX_OUTPUT_TOKENS,
        temperature: AI_CONFIG.TEMPERATURE,
        topP: AI_CONFIG.TOP_P,
        topK: AI_CONFIG.TOP_K,
      },
    })
    modelCache.set(apiKey, model)
  }
  return modelCache.get(apiKey)
}

async function validateApiKey(apiKey: string) {
  try {
    if (!apiKey || !apiKey.startsWith("begins_")) {
      return null
    }

    const { data: user, error } = await supabaseAdmin.from("users").select("*").eq("api_key", apiKey).single()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error("API key validation error:", error)
    return null
  }
}

async function checkUserRateLimit(userId: string, apiKey: string, plan: string) {
  try {
    const limit = RATE_LIMITS[plan as keyof typeof RATE_LIMITS] || RATE_LIMITS.free
    const key = `ratelimit:${apiKey}`

    return await checkRateLimit(key, limit.requests, limit.window)
  } catch (error) {
    console.error("Rate limit check error:", error)
    // Return success to avoid blocking on Redis errors
    return { success: true, remaining: 100, resetTime: Date.now() + 86400000 }
  }
}

function selectApiKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error("No API keys configured")
  }

  // Simple round-robin for speed
  const now = Date.now()
  const index = Math.floor(now / 1000) % API_KEYS.length
  return API_KEYS[index]
}

// Simplified logging - fire and forget
async function logApiUsageAsync(
  userId: string,
  apiKey: string,
  endpoint: string,
  tokensUsed: number,
  responseTime: number,
  statusCode: number,
  promptLength: number,
  responseLength: number,
  request: NextRequest,
) {
  // Use setTimeout instead of setImmediate for Edge Runtime compatibility
  setTimeout(async () => {
    try {
      const ipAddress = request.headers.get("x-forwarded-for") || request.ip || "unknown"
      const userAgent = request.headers.get("user-agent") || "unknown"

      // First, get current user data
      const { data: currentUser } = await supabaseAdmin.from("users").select("requests_used").eq("id", userId).single()

      if (currentUser) {
        // Log API usage and update user requests in parallel
        await Promise.all([
          supabaseAdmin.from("api_usage").insert({
            user_id: userId,
            api_key: apiKey,
            endpoint,
            tokens_used: tokensUsed,
            response_time: responseTime,
            status_code: statusCode,
            ip_address: ipAddress,
            user_agent: userAgent,
            prompt_length: promptLength,
            response_length: responseLength,
          }),
          // Update user request count
          supabaseAdmin
            .from("users")
            .update({
              requests_used: currentUser.requests_used + 1,
              updated_at: new Date().toISOString(),
              last_request_at: new Date().toISOString(),
            })
            .eq("id", userId),
        ])
      }
    } catch (error) {
      console.error("Background logging error:", error)
    }
  }, 0)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    }

    // Extract API key
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header", code: "INVALID_AUTH" },
        { status: 401, headers: corsHeaders },
      )
    }

    const apiKey = authHeader.substring(7)

    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body", code: "INVALID_JSON" },
        { status: 400, headers: corsHeaders },
      )
    }

    // Validate user
    const user = await validateApiKey(apiKey)
    if (!user) {
      return NextResponse.json({ error: "Invalid API key", code: "INVALID_KEY" }, { status: 401, headers: corsHeaders })
    }

    const { message, max_tokens = AI_CONFIG.MAX_OUTPUT_TOKENS, temperature = AI_CONFIG.TEMPERATURE } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string", code: "INVALID_MESSAGE" },
        { status: 400, headers: corsHeaders },
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long (max 2,000 characters)", code: "MESSAGE_TOO_LONG" },
        { status: 400, headers: corsHeaders },
      )
    }

    // Check rate limits and cache in parallel
    const [rateLimitResult, cachedResponse] = await Promise.all([
      checkUserRateLimit(user.id, apiKey, user.plan),
      getCachedGeminiResponse(message).catch(() => null), // Don't fail on cache errors
    ])

    if (!rateLimitResult.success) {
      logApiUsageAsync(user.id, apiKey, "/v1/chat", 0, Date.now() - startTime, 429, 0, 0, request)

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          code: "RATE_LIMITED",
          limit: RATE_LIMITS[user.plan as keyof typeof RATE_LIMITS].requests,
          remaining: rateLimitResult.remaining,
          reset_at: new Date(rateLimitResult.resetTime).toISOString(),
        },
        { status: 429, headers: corsHeaders },
      )
    }

    if (cachedResponse) {
      const responseTime = Date.now() - startTime
      logApiUsageAsync(
        user.id,
        apiKey,
        "/v1/chat",
        Math.ceil(cachedResponse.length / 4),
        responseTime,
        200,
        message.length,
        cachedResponse.length,
        request,
      )

      return NextResponse.json(
        {
          response: cachedResponse,
          tokens_used: Math.ceil(cachedResponse.length / 4),
          model: MODEL_DISPLAY_NAME,
          timestamp: new Date().toISOString(),
          user_plan: user.plan,
          cached: true,
          remaining_requests: rateLimitResult.remaining,
        },
        { headers: corsHeaders },
      )
    }

    // Get pre-initialized model
    const selectedKey = selectApiKey()
    const model = getModel(selectedKey)

    // Generate with aggressive timeout
    const generatePromise = model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), AI_CONFIG.TIMEOUT_MS),
    )

    let result
    try {
      result = await Promise.race([generatePromise, timeoutPromise])
    } catch (error: any) {
      console.error("Generation error:", error)

      if (error.message?.includes("timeout")) {
        return NextResponse.json(
          { error: "Request timeout - please try again", code: "TIMEOUT" },
          { status: 408, headers: corsHeaders },
        )
      }

      return NextResponse.json(
        { error: "AI service temporarily unavailable", code: "SERVICE_ERROR" },
        { status: 503, headers: corsHeaders },
      )
    }

    let text
    try {
      const response = await result.response
      text = response.text()

      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from AI")
      }
    } catch (error) {
      console.error("Response parsing error:", error)
      return NextResponse.json(
        { error: "Failed to process AI response", code: "RESPONSE_ERROR" },
        { status: 500, headers: corsHeaders },
      )
    }

    // Cache and log in background
    cacheGeminiResponse(message, text, 1800).catch(console.error)
    const responseTime = Date.now() - startTime
    const tokensUsed = Math.ceil(text.length / 4)
    logApiUsageAsync(user.id, apiKey, "/v1/chat", tokensUsed, responseTime, 200, message.length, text.length, request)

    return NextResponse.json(
      {
        response: text,
        tokens_used: tokensUsed,
        model: MODEL_DISPLAY_NAME,
        timestamp: new Date().toISOString(),
        user_plan: user.plan,
        cached: false,
        remaining_requests: rateLimitResult.remaining,
      },
      { headers: corsHeaders },
    )
  } catch (error: any) {
    console.error("API Error:", error)
    const responseTime = Date.now() - startTime

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    }

    // Always return valid JSON
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

export async function GET() {
  return NextResponse.json({
    message: "Begins AI API v1",
    status: "operational",
    endpoints: {
      chat: "POST /v1/chat",
    },
    documentation: "https://begins.site/docs",
    available_keys: API_KEYS.length,
  })
}
