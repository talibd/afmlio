import { NextRequest, NextResponse } from "next/server"

import { destroySession } from "@/lib/server/auth"
import { assertSameOrigin, toErrorResponse } from "@/lib/server/http"

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const response = NextResponse.json({ ok: true })
    await destroySession(request, response)
    return response
  } catch (error) {
    return toErrorResponse(error)
  }
}
