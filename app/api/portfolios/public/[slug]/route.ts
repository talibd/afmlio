import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { portfolios } from "@/db/schema"
import { db } from "@/lib/server/db"
import { HttpError, toErrorResponse } from "@/lib/server/http"

type Context = { params: Promise<{ slug: string }> }

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { slug } = await context.params
    const [record] = await db
      .select({
        slug: portfolios.slug,
        name: portfolios.name,
        template: portfolios.template,
        publishedSnapshot: portfolios.publishedSnapshot,
        publishedAt: portfolios.publishedAt,
        updatedAt: portfolios.updatedAt,
      })
      .from(portfolios)
      .where(
        and(eq(portfolios.slug, slug), eq(portfolios.status, "published"))
      )
      .limit(1)
    if (!record?.publishedSnapshot) {
      throw new HttpError(404, "Portfolio not found", "NOT_FOUND")
    }
    return NextResponse.json({ portfolio: record })
  } catch (error) {
    return toErrorResponse(error)
  }
}
