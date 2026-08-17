import "server-only"

import { createHash, randomBytes, randomUUID } from "node:crypto"
import { and, eq, gt } from "drizzle-orm"
import type { NextRequest, NextResponse } from "next/server"

import { sessions, users } from "@/db/schema"
import { db } from "@/lib/server/db"
import { HttpError } from "@/lib/server/http"

export const SESSION_COOKIE = "afm_session"
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30

export type AuthUser = { id: string; email: string }

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function createSession(
  userId: string,
  response: NextResponse
): Promise<void> {
  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000)
  await db.insert(sessions).values({
    id: randomUUID(),
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    priority: "high",
  })
}

export async function getOptionalUser(
  request: NextRequest
): Promise<AuthUser | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null

  const [record] = await db
    .select({ id: users.id, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1)
  return record ?? null
}

export async function requireUser(request: NextRequest): Promise<AuthUser> {
  const user = await getOptionalUser(request)
  if (!user) throw new HttpError(401, "Authentication required", "UNAUTHORIZED")
  return user
}

export async function destroySession(
  request: NextRequest,
  response: NextResponse
): Promise<void> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)))
  }
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}
