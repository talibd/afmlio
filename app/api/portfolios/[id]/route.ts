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
import { portfolioPatchSchema } from "@/lib/server/portfolio-validation"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: Context) {
  try {
    const user = await requireUser(request)
    const { id } = await context.params
    const [record] = await db
      .select()
      .from(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, user.id)))
      .limit(1)
    if (!record) throw new HttpError(404, "Portfolio not found", "NOT_FOUND")
    return NextResponse.json({ portfolio: record })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    assertSameOrigin(request)
    const user = await requireUser(request)
    const { id } = await context.params
    const input = portfolioPatchSchema.parse(await request.json())
    let record
    try {
      ;[record] = await db
        .update(portfolios)
        .set({ ...input, updatedAt: new Date() })
        .where(and(eq(portfolios.id, id), eq(portfolios.userId, user.id)))
        .returning()
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new HttpError(409, "This portfolio URL is already in use", "SLUG_TAKEN")
      }
      throw error
    }
    if (!record) throw new HttpError(404, "Portfolio not found", "NOT_FOUND")
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
      .delete(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, user.id)))
      .returning({ id: portfolios.id })
    if (!record) throw new HttpError(404, "Portfolio not found", "NOT_FOUND")
    return NextResponse.json({ ok: true })
  } catch (error) {
    return toErrorResponse(error)
  }
}
