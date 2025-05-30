import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { supabaseAdmin } from "@/lib/supabase"
import { checkRateLimit, getCachedGeminiResponse, cacheGeminiResponse } from "@/lib/redis"

// Production-ready API keys from environment
const API_KEYS = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(
  Boolean,
) as string[]

// Rate limiting configuration
const RATE_LIMITS = {
  free: { requests: 100, window: 24 * 60 * 60 * 1000 }, // 100 requests per day
  pro: { requests: 2000, window: 7 * 24 * 60 * 60 * 1000 }, // 2000 requests per week
  unlimited: { requests: 6000, window: 60 * 60 * 1000 }, // 6000 requests per hour
  admin: { requests: 999999, window: 60 * 60 * 1000 }, // Unlimited for admin
}

// Key usage tracking
const keyUsageStore = new Map<string, { requests: number; lastReset: number }>()

async function validateApiKey(apiKey: string) {
  if (!apiKey || !apiKey.startsWith("begins_")) {
    return null
  }

  // Get user from database
  const { data: user, error } = await supabaseAdmin.from("users").select("*").eq("api_key", apiKey).single()

  if (error || !user) {
    console.error("Error validating API key:", error)
    return null
  }

  return user
}

async function checkUserRateLimit(userId: string, apiKey: string, plan: string) {
  const limit = RATE_LIMITS[plan as keyof typeof RATE_LIMITS] || RATE_LIMITS.free
  const key = `ratelimit:${apiKey}`

  return await checkRateLimit(key, limit.requests, limit.window)
}

function selectApiKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error("No API keys configured")
  }

  // Smart key selection based on usage
  let selectedKey = API_KEYS[0]
  let minUsage = Number.POSITIVE_INFINITY

  for (const key of API_KEYS) {
    const usage = keyUsageStore.get(key)
    const currentUsage = usage ? usage.requests : 0

    if (currentUsage < minUsage) {
      minUsage = currentUsage
      selectedKey = key
    }
  }

  // Track usage
  const currentUsage = keyUsageStore.get(selectedKey) || { requests: 0, lastReset: Date.now() }
  currentUsage.requests += 1
  keyUsageStore.set(selectedKey, currentUsage)

  return selectedKey
}

async function logApiUsage(
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
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || request.ip || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await supabaseAdmin.from("api_usage").insert({
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
    })

    // Update user's request count - Fixed the SQL function call
    const { data: currentUser } = await supabaseAdmin.from("users").select("requests_used").eq("id", userId).single()

    if (currentUser) {
      await supabaseAdmin
        .from("users")
        .update({
          requests_used: currentUser.requests_used + 1,
          updated_at: new Date().toISOString(),
          last_request_at: new Date().toISOString(),
        })
        .eq("id", userId)
    }
  } catch (error) {
    console.error("Error logging API usage:", error)
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }

    // Extract API key from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header", code: "INVALID_AUTH" },
        { status: 401, headers: corsHeaders },
      )
    }

    const apiKey = authHeader.substring(7)
    const user = await validateApiKey(apiKey)

    if (!user) {
      return NextResponse.json({ error: "Invalid API key", code: "INVALID_KEY" }, { status: 401, headers: corsHeaders })
    }

    // Check rate limits
    const rateLimitResult = await checkUserRateLimit(user.id, apiKey, user.plan)

    if (!rateLimitResult.success) {
      await logApiUsage(user.id, apiKey, "/v1/chat", 0, Date.now() - startTime, 429, 0, 0, request)

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

    // Parse request body
    const body = await request.json()
    const { message, max_tokens = 1000, temperature = 0.7 } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string", code: "INVALID_MESSAGE" },
        { status: 400, headers: corsHeaders },
      )
    }

    if (message.length > 10000) {
      return NextResponse.json(
        { error: "Message too long (max 10,000 characters)", code: "MESSAGE_TOO_LONG" },
        { status: 400, headers: corsHeaders },
      )
    }

    // Check cache first
    const cachedResponse = await getCachedGeminiResponse(message)
    if (cachedResponse) {
      const responseTime = Date.now() - startTime

      await logApiUsage(
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
          model: "gemma-3-27b-it",
          timestamp: new Date().toISOString(),
          user_plan: user.plan,
          cached: true,
          remaining_requests: rateLimitResult.remaining,
        },
        { headers: corsHeaders },
      )
    }

    // Select and use API key
    const selectedKey = selectApiKey()
    const genAI = new GoogleGenerativeAI(selectedKey)

    // Use the correct model name - gemini-1.5-flash is available
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" })

    // Generate response with timeout
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 30000))

    const generatePromise = model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
      generationConfig: {
        maxOutputTokens: Math.min(max_tokens, 2048),
        temperature: Math.max(0, Math.min(1, temperature)),
      },
    })

    const result = await Promise.race([generatePromise, timeoutPromise])
    const response = await (result as any).response
    const text = response.text()

    // Cache the response
    await cacheGeminiResponse(message, text, 3600)

    const responseTime = Date.now() - startTime
    const tokensUsed = Math.ceil(text.length / 4)

    // Log usage
    await logApiUsage(user.id, apiKey, "/v1/chat", tokensUsed, responseTime, 200, message.length, text.length, request)

    // Return formatted response
    return NextResponse.json(
      {
        response: text,
        tokens_used: tokensUsed,
        model: "gemma-3-27b-it", // We'll still show this model name to the user
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

    // Try to log the error
    try {
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const apiKey = authHeader.substring(7)
        const user = await validateApiKey(apiKey)

        if (user) {
          await logApiUsage(user.id, apiKey, "/v1/chat", 0, responseTime, 500, 0, 0, request)
        }
      }
    } catch (logError) {
      console.error("Error logging API error:", logError)
    }

    // Handle specific API errors
    if (error.message?.includes("quota")) {
      return NextResponse.json({ error: "Service temporarily unavailable", code: "QUOTA_EXCEEDED" }, { status: 503 })
    }

    if (error.message?.includes("timeout")) {
      return NextResponse.json({ error: "Request timeout", code: "TIMEOUT" }, { status: 408 })
    }

    if (error.message?.includes("not found") || error.message?.includes("404")) {
      return NextResponse.json({ error: "Model temporarily unavailable", code: "MODEL_UNAVAILABLE" }, { status: 503 })
    }

    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
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
