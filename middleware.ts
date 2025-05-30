import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle api.begins.site domain
  if (request.headers.get("host")?.includes("api.begins.site")) {
    // If the path doesn't start with /v1, redirect to /v1
    if (!pathname.startsWith("/v1")) {
      return NextResponse.redirect(new URL("/v1", request.url))
    }

    // Otherwise, continue with the request
    return NextResponse.next()
  }

  // For other domains, continue normally
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
