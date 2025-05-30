import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Begins API v1 Test Endpoint",
    status: "operational",
    timestamp: new Date().toISOString(),
  })
}

export async function POST() {
  return NextResponse.json({
    message: "POST method working",
    status: "operational",
    timestamp: new Date().toISOString(),
  })
}
