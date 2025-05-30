import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Simple admin authentication (use proper auth in production)
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  // Use a simple hardcoded admin key for now
  const adminKey = "begins_admin_key_123456"

  return authHeader === `Bearer ${adminKey}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user statistics
    const { data: userStats } = await supabase.from("users").select("plan, created_at")

    // Get usage statistics for today
    const today = new Date().toISOString().split("T")[0]
    const { data: usageStats } = await supabase
      .from("api_usage")
      .select("tokens_used, created_at")
      .gte("created_at", `${today}T00:00:00.000Z`)

    // Calculate metrics
    const totalUsers = userStats?.length || 0
    const usersByPlan =
      userStats?.reduce(
        (acc, user) => {
          acc[user.plan] = (acc[user.plan] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    const totalRequestsToday = usageStats?.length || 0
    const totalTokensToday = usageStats?.reduce((sum, usage) => sum + usage.tokens_used, 0) || 0

    return NextResponse.json({
      users: {
        total: totalUsers,
        by_plan: usersByPlan,
      },
      usage: {
        requests_today: totalRequestsToday,
        tokens_today: totalTokensToday,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
