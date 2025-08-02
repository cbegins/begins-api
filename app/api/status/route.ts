import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getSystemHealth } from "@/lib/monitoring"

export async function GET() {
  try {
    // Get basic stats
    const { data: userCount } = await supabaseAdmin.from("users").select("*", { count: "exact", head: true })

    const { data: todayUsage } = await supabaseAdmin
      .from("api_usage")
      .select("tokens_used")
      .gte("created_at", new Date().toISOString().split("T")[0] + "T00:00:00.000Z")

    const totalRequests = todayUsage?.length || 0
    const totalTokens = todayUsage?.reduce((sum, usage) => sum + usage.tokens_used, 0) || 0

    const systemHealth = getSystemHealth()

    return NextResponse.json({
      status: "operational",
      uptime: process.uptime(),
      stats: {
        total_users: userCount || 0,
        requests_today: totalRequests,
        tokens_today: totalTokens,
        requests_per_minute: systemHealth.requests_per_minute,
        avg_response_time: systemHealth.avg_response_time_ms,
        error_rate: systemHealth.error_rate_percent,
      },
      services: {
        api: systemHealth.status,
        database: "operational",
        cache: "operational",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Status check failed:", error)
    return NextResponse.json(
      {
        status: "degraded",
        error: "Failed to fetch system status",
      },
      { status: 500 },
    )
  }
}
