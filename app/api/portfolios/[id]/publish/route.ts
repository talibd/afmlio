import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { portfolios } from "@/db/schema"
import { requireUser } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import {
  assertSameOrigin,
  HttpError,
  toErrorResponse,
} from "@/lib/server/http"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: Context) {
  try {
    assertSameOrigin(request)
    const user = await requireUser(request)
    const { id } = await context.params
    const [existing] = await db
      .select({ draftSnapshot: portfolios.draftSnapshot })
      .from(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, user.id)))
      .limit(1)
    if (!existing) throw new HttpError(404, "Portfolio not found", "NOT_FOUND")

    const now = new Date()
    const [record] = await db
      .update(portfolios)
      .set({
        status: "published",
        publishedSnapshot: existing.draftSnapshot,
        publishedAt: now,
        updatedAt: now,
      })
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, user.id)))
      .returning()
    return NextResponse.json({ portfolio: record })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    assertSameOrigin(request)
    const user = await requireUser(request)
    const { id } = await context.params
    const [record] = await db
      .update(portfolios)
      .set({ status: "draft", publishedAt: null, updatedAt: new Date() })
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, user.id)))
      .returning()
    if (!record) throw new HttpError(404, "Portfolio not found", "NOT_FOUND")
    return NextResponse.json({ portfolio: record })
  } catch (error) {
    return toErrorResponse(error)
  }
}
