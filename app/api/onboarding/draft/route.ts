import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { users } from "@/db/schema"
import { requireUser } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import {
  assertSameOrigin,
  HttpError,
  toErrorResponse,
} from "@/lib/server/http"
import { jsonObjectSchema } from "@/lib/server/portfolio-validation"

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const [record] = await db
      .select({ onboardingDraft: users.onboardingDraft })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
    if (!record) throw new HttpError(404, "User not found", "NOT_FOUND")
    return NextResponse.json({ onboarding: record.onboardingDraft })
  } catch (error) {
    return toErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const user = await requireUser(request)
    const onboarding = jsonObjectSchema.parse(await request.json())
    await db
      .update(users)
      .set({ onboardingDraft: onboarding, updatedAt: new Date() })
      .where(eq(users.id, user.id))
    return NextResponse.json({ onboarding })
  } catch (error) {
    return toErrorResponse(error)
  }
}
