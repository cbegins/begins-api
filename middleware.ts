import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle direct API calls to /v1/* by redirecting to /api/v1/*
  if (pathname.startsWith("/v1/")) {
    const apiPath = pathname.replace("/v1/", "/api/v1/")
    return NextResponse.rewrite(new URL(apiPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/v1/:path*"],
}
