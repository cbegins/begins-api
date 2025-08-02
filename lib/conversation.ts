import { supabaseAdmin } from "./supabase"

export interface ConversationMessage {
  id: string
  user_id: string
  conversation_id: string
  message: string
  role: "user" | "assistant"
  created_at: string
  metadata?: Record<string, any>
}

export async function getConversationHistory(
  userId: string,
  conversationId: string,
  limit = 20,
): Promise<ConversationMessage[]> {
  const { data, error } = await supabaseAdmin
    .from("conversation_history")
    .select("*")
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error fetching conversation history:", error)
    return []
  }

  return data || []
}

export async function addMessageToConversation(
  userId: string,
  conversationId: string,
  message: string,
  role: "user" | "assistant",
  metadata?: Record<string, any>,
): Promise<ConversationMessage | null> {
  const { data, error } = await supabaseAdmin
    .from("conversation_history")
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      message,
      role,
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding message to conversation:", error)
    return null
  }

  return data
}

export async function createNewConversation(): Promise<string> {
  return crypto.randomUUID()
}

export async function getUserConversations(userId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("conversation_history")
    .select("conversation_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user conversations:", error)
    return []
  }

  // Extract unique conversation IDs
  const uniqueConversations = new Set(data.map((item) => item.conversation_id))
  return Array.from(uniqueConversations)
}

export async function deleteConversation(userId: string, conversationId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("conversation_history")
    .delete()
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)

  if (error) {
    console.error("Error deleting conversation:", error)
    return false
  }

  return true
}
