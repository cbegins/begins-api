import { type NextRequest, NextResponse } from "next/server"
import { getUserByApiKey } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    const user = await getUserByApiKey(apiKey)

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    return NextResponse.json({
      api_key: user.api_key,
      plan: user.plan,
      requests_used: user.requests_used,
      requests_limit: user.requests_limit,
      created_at: user.created_at,
    })
  } catch (error) {
    console.error("User stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
