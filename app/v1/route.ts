import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Begins AI API v1",
    status: "operational",
    version: "1.0.0",
    endpoints: {
      chat: "POST /v1/chat",
      test: "GET /v1/test",
    },
    documentation: "https://begins.site/docs",
    timestamp: new Date().toISOString(),
  })
}
