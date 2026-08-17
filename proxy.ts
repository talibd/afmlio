import { NextRequest, NextResponse } from "next/server"

const protectedPrefixes = ["/dashboard", "/edit", "/onboarding"]
const SESSION_COOKIE = "afm_session"

export function proxy(request: NextRequest) {
  const protectedRoute = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  )
  if (!protectedRoute || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next()
  }

  const login = new URL("/login", request.url)
  login.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  )
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ["/dashboard/:path*", "/edit/:path*", "/onboarding/:path*"],
}
