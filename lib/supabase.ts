import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // For server-side operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // For client-side operations

// Server-side Supabase client (with admin privileges)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Client-side Supabase client (with limited privileges)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  api_key: string
  plan: "free" | "pro" | "unlimited" | "admin"
  requests_used: number
  requests_limit: number
  created_at: string
  updated_at: string
  last_request_at?: string
  stripe_customer_id?: string
  subscription_status?: string
}

export interface ApiUsage {
  id: string
  user_id: string
  api_key: string
  endpoint: string
  tokens_used: number
  response_time: number
  status_code: number
  created_at: string
  ip_address?: string
  user_agent?: string
  prompt_length?: number
  response_length?: number
}

// Database functions
export async function getUserByApiKey(apiKey: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("api_key", apiKey).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned" which is expected
    console.error("Error fetching user by email:", error)
  }

  return data || null
}

export async function createUser(email: string, apiKey: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      email,
      api_key: apiKey,
      plan: "free",
      requests_used: 0,
      requests_limit: 100,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return data
}

export async function incrementUserUsage(userId: string, tokensUsed: number): Promise<void> {
  // Get current usage first
  const { data: currentUser } = await supabaseAdmin.from("users").select("requests_used").eq("id", userId).single()

  if (currentUser) {
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        requests_used: currentUser.requests_used + 1,
        updated_at: new Date().toISOString(),
        last_request_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user usage:", error)
    }
  }
}

export async function logApiUsage(usage: Omit<ApiUsage, "id" | "created_at">): Promise<void> {
  const { error } = await supabaseAdmin.from("api_usage").insert({
    ...usage,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error logging API usage:", error)
  }
}

export async function getDailyStats(): Promise<{ users: number; requests: number; tokens: number }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get new users today
  const { count: newUsers } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString())

  // Get requests today
  const { data: usageData } = await supabaseAdmin
    .from("api_usage")
    .select("tokens_used")
    .gte("created_at", today.toISOString())

  const requests = usageData?.length || 0
  const tokens = usageData?.reduce((sum, item) => sum + (item.tokens_used || 0), 0) || 0

  return {
    users: newUsers || 0,
    requests,
    tokens,
  }
}
