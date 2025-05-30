import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getUserByEmail, createUser } from "@/lib/supabase"
import redis from "@/lib/redis"

function generateApiKey(): string {
  const prefix = "begins_"
  const randomPart = randomBytes(16).toString("hex")
  return prefix + randomPart
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async function checkIPLimit(ip: string): Promise<boolean> {
  const key = `ip_limit:${ip}`
  const count = await redis.get(key)

  if (count && Number.parseInt(count as string) >= 1) {
    return false // IP has already generated an API key
  }

  return true
}

async function setIPLimit(ip: string): Promise<void> {
  const key = `ip_limit:${ip}`
  await redis.setex(key, 86400, "1") // 24 hours expiry
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Get IP address
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || request.ip || "unknown"

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({
        api_key: existingUser.api_key,
        plan: existingUser.plan,
        requests_limit: existingUser.requests_limit,
        created_at: existingUser.created_at,
        message: "Existing API key returned",
        documentation: "https://begins.site/docs",
      })
    }

    // Check IP limit for new users
    const canCreateKey = await checkIPLimit(ip)
    if (!canCreateKey) {
      return NextResponse.json(
        {
          error:
            "Only one API key can be generated per IP address per day. Please try again tomorrow or contact support if you need multiple keys.",
        },
        { status: 429 },
      )
    }

    // Generate new API key
    const apiKey = generateApiKey()

    // Create user in database
    const user = await createUser(email, apiKey)

    if (!user) {
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }

    // Set IP limit
    await setIPLimit(ip)

    return NextResponse.json({
      api_key: user.api_key,
      plan: user.plan,
      requests_limit: user.requests_limit,
      created_at: user.created_at,
      message: "API key generated successfully",
      documentation: "https://begins.site/docs",
    })
  } catch (error) {
    console.error("Key generation error:", error)
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Begins API Key Service",
    endpoint: "POST /api/keys/generate",
    required_fields: ["email"],
  })
}
