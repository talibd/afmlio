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
import { hashPassword, verifyPassword } from "@/lib/server/password"

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
})

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const input = loginSchema.parse(await request.json())
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1)

    // Always perform a password derivation so unknown emails do not have a
    // noticeably cheaper response path.
    const passwordHash = user?.passwordHash ?? (await hashPassword("invalid-password"))
    const validPassword = await verifyPassword(input.password, passwordHash)

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpError(
        429,
        "Too many sign-in attempts. Try again later.",
        "ACCOUNT_TEMPORARILY_LOCKED"
      )
    }

    if (!user || !validPassword) {
      if (user) {
        const failedLoginAttempts = user.failedLoginAttempts + 1
        await db
          .update(users)
          .set({
            failedLoginAttempts,
            lockedUntil:
              failedLoginAttempts >= MAX_ATTEMPTS
                ? new Date(Date.now() + LOCK_DURATION_MS)
                : null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id))
      }
      throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS")
    }

    await db
      .update(users)
      .set({ failedLoginAttempts: 0, lockedUntil: null, updatedAt: new Date() })
      .where(eq(users.id, user.id))

    const response = NextResponse.json({
      user: { id: user.id, email: user.email },
    })
    await createSession(user.id, response)
    return response
  } catch (error) {
    return toErrorResponse(error)
  }
}
