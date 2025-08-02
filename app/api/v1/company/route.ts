import { type NextRequest, NextResponse } from "next/server"
import { createCompanyProfile, getCompanyProfile, updateCompanyProfile, updateUserCompanyContext } from "@/lib/company"
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
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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

    // Get company profile
    const profile = await getCompanyProfile(user.id)

    return NextResponse.json(
      {
        profile: profile || null,
        company_context: user.company_context || null,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error fetching company profile:", error)
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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

    // Parse request body
    const body = await request.json()
    const { company_name, company_description, industry, website, company_context } = body

    if (!company_name) {
      return NextResponse.json(
        { error: "Company name is required", code: "INVALID_REQUEST" },
        { status: 400, headers: corsHeaders },
      )
    }

    // Check if profile already exists
    const existingProfile = await getCompanyProfile(user.id)

    let profile
    if (existingProfile) {
      // Update existing profile
      profile = await updateCompanyProfile(user.id, {
        company_name,
        company_description,
        industry,
        website,
      })
    } else {
      // Create new profile
      profile = await createCompanyProfile(user.id, {
        company_name,
        company_description,
        industry,
        website,
      })
    }

    // Update company context if provided
    if (company_context) {
      await updateUserCompanyContext(user.id, company_context)
    }

    return NextResponse.json(
      {
        profile,
        company_context: company_context || user.company_context,
        message: existingProfile ? "Company profile updated" : "Company profile created",
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error creating/updating company profile:", error)
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
