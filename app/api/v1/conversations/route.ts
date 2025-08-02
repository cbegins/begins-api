import { type NextRequest, NextResponse } from "next/server"
import { getUserConversations, getConversationHistory, deleteConversation } from "@/lib/conversation"
import { supabaseAdmin } from "@/lib/supabase"

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

export async function GET(request: NextRequest) {
  try {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
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

    // Get conversation ID from query params
    const url = new URL(request.url)
    const conversationId = url.searchParams.get("conversation_id")

    if (conversationId) {
      // Get specific conversation history
      const messages = await getConversationHistory(user.id, conversationId)
      return NextResponse.json({ conversation_id: conversationId, messages }, { headers: corsHeaders })
    } else {
      // Get all user conversations
      const conversations = await getUserConversations(user.id)
      return NextResponse.json({ conversations }, { headers: corsHeaders })
    }
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
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

    // Get conversation ID from query params
    const url = new URL(request.url)
    const conversationId = url.searchParams.get("conversation_id")

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required", code: "INVALID_REQUEST" },
        { status: 400, headers: corsHeaders },
      )
    }

    // Delete conversation
    const success = await deleteConversation(user.id, conversationId)

    if (success) {
      return NextResponse.json({ message: "Conversation deleted successfully" }, { headers: corsHeaders })
    } else {
      return NextResponse.json(
        { error: "Failed to delete conversation", code: "DELETE_FAILED" },
        { status: 500, headers: corsHeaders },
      )
    }
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
