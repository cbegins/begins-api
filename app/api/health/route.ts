import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import redis from "@/lib/redis"
import { getSystemHealth } from "@/lib/monitoring"

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    gemini_keys: false,
    timestamp: new Date().toISOString(),
  }

  // Check database connection
  try {
    const { data, error } = await supabaseAdmin.from("users").select("count").limit(1)

    checks.database = !error
  } catch (error) {
    console.error("Database health check failed:", error)
  }

  // Check Redis connection
  try {
    await redis.ping()
    checks.redis = true
  } catch (error) {
    console.error("Redis health check failed:", error)
  }

  // Check Gemini API keys
  const apiKeys = [process.env.GEMINI_API_KEY_1, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter(
    Boolean,
  )

  checks.gemini_keys = apiKeys.length > 0

  const systemHealth = getSystemHealth()
  const allHealthy = Object.values(checks).every((check) => check === true)

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      checks,
      metrics: systemHealth,
    },
    {
      status: allHealthy ? 200 : 503,
    },
  )
}
