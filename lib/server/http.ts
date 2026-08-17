import "server-only"

import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string
  ) {
    super(message)
  }
}

export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin")
  if (!origin) return

  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    throw new HttpError(403, "Invalid request origin", "INVALID_ORIGIN")
  }

  const forwardedHost = request.headers.get("x-forwarded-host")
  const host = forwardedHost ?? request.headers.get("host")
  if (!host || originHost !== host) {
    throw new HttpError(403, "Request origin is not allowed", "INVALID_ORIGIN")
  }
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    )
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "The request data is invalid",
          issues: error.issues,
        },
      },
      { status: 400 }
    )
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON",
        },
      },
      { status: 400 }
    )
  }

  console.error("Unhandled API error", error)
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
    { status: 500 }
  )
}
