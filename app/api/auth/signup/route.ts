import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { users } from "@/db/schema"
import { createSession } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import {
  assertSameOrigin,
  HttpError,
  toErrorResponse,
} from "@/lib/server/http"
import { hashPassword } from "@/lib/server/password"

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
})

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error && typeof error === "object" && "code" in error && error.code === "23505"
  )
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const input = signupSchema.parse(await request.json())
    const userId = randomUUID()

    try {
      await db.insert(users).values({
        id: userId,
        email: input.email,
        passwordHash: await hashPassword(input.password),
      })
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new HttpError(
          409,
          "An account with this email already exists",
          "EMAIL_TAKEN"
        )
      }
      throw error
    }

    const response = NextResponse.json(
      { user: { id: userId, email: input.email } },
      { status: 201 }
    )
    try {
      await createSession(userId, response)
    } catch (error) {
      // Avoid stranding an unusable account if session persistence fails after
      // the user row was created.
      await db.delete(users).where(eq(users.id, userId))
      throw error
    }
    return response
  } catch (error) {
    return toErrorResponse(error)
  }
}
