import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY_1
    if (!apiKey) {
      return NextResponse.json({ error: "No API key configured" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // Try to list available models
    try {
      const models = await genAI.listModels()
      return NextResponse.json({
        available_models: models.map((model) => ({
          name: model.name,
          displayName: model.displayName,
          description: model.description,
          supportedGenerationMethods: model.supportedGenerationMethods,
        })),
      })
    } catch (error) {
      // If listModels fails, return common model names
      return NextResponse.json({
        common_models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-pro", "gemini-pro-vision"],
        note: "These are commonly available models. Actual availability may vary.",
      })
    }
  } catch (error: any) {
    console.error("Models API Error:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}
