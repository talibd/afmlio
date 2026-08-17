import { NextRequest, NextResponse } from "next/server"

import { getOptionalUser } from "@/lib/server/auth"
import { toErrorResponse } from "@/lib/server/http"

export async function GET(request: NextRequest) {
  try {
    const user = await getOptionalUser(request)
    return NextResponse.json({ user })
  } catch (error) {
    return toErrorResponse(error)
  }
}
