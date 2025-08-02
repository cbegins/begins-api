import { supabaseAdmin } from "./supabase"

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  company_description?: string
  industry?: string
  website?: string
  created_at: string
  updated_at: string
}

export async function getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
  const { data, error } = await supabaseAdmin.from("company_profiles").select("*").eq("user_id", userId).maybeSingle()

  if (error) {
    console.error("Error fetching company profile:", error)
    return null
  }

  return data
}

export async function createCompanyProfile(
  userId: string,
  profile: Omit<CompanyProfile, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<CompanyProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("company_profiles")
    .insert({
      user_id: userId,
      ...profile,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating company profile:", error)
    return null
  }

  return data
}

export async function updateCompanyProfile(
  userId: string,
  profile: Partial<Omit<CompanyProfile, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<CompanyProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("company_profiles")
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating company profile:", error)
    return null
  }

  return data
}

export async function updateUserCompanyContext(userId: string, context: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("users")
    .update({
      company_context: context,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("Error updating user company context:", error)
    return false
  }

  return true
}

export async function getUserCompanyContext(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.from("users").select("company_context").eq("id", userId).maybeSingle()

  if (error) {
    console.error("Error fetching user company context:", error)
    return null
  }

  return data?.company_context || null
}
