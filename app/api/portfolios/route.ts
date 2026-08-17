import { randomUUID } from "node:crypto"
import { desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { portfolios } from "@/db/schema"
import { requireUser } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import {
  assertSameOrigin,
  HttpError,
  toErrorResponse,
} from "@/lib/server/http"
import {
  portfolioCreateSchema,
  slugify,
} from "@/lib/server/portfolio-validation"

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error && typeof error === "object" && "code" in error && error.code === "23505"
  )
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const records = await db
      .select({
        id: portfolios.id,
        slug: portfolios.slug,
        name: portfolios.name,
        template: portfolios.template,
        status: portfolios.status,
        publishedAt: portfolios.publishedAt,
        createdAt: portfolios.createdAt,
        updatedAt: portfolios.updatedAt,
      })
      .from(portfolios)
      .where(eq(portfolios.userId, user.id))
      .orderBy(desc(portfolios.updatedAt))
    return NextResponse.json({ portfolios: records })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const user = await requireUser(request)
    const input = portfolioCreateSchema.parse(await request.json())
    const onboarding = input.onboarding ?? {}
    const onboardingName =
      typeof onboarding.studioName === "string" ? onboarding.studioName : undefined
    const name =
      (input.name ?? onboardingName ?? "").trim() || "Untitled portfolio"
    const baseSlug = input.slug ?? slugify(name)
    const draftSnapshot =
      input.draftSnapshot ??
      ({ template: "frame", onboarding } satisfies Record<string, unknown>)

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug.slice(0, 57)}-${randomUUID().slice(0, 6)}`
      try {
        const [record] = await db
          .insert(portfolios)
          .values({
            id: randomUUID(),
            userId: user.id,
            slug,
            name,
            template: "frame",
            draftSnapshot,
          })
          .returning()
        return NextResponse.json({ portfolio: record }, { status: 201 })
      } catch (error) {
        if (isUniqueViolation(error)) continue
        throw error
      }
    }
    throw new HttpError(409, "Could not create a unique portfolio URL", "SLUG_TAKEN")
  } catch (error) {
    return toErrorResponse(error)
  }
}
