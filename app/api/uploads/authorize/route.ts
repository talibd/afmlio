import type { NextRequest } from "next/server"
import { and, eq } from "drizzle-orm"

import { portfolios } from "@/db/schema"
import { requireUser } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import { assertSameOrigin, HttpError, toErrorResponse } from "@/lib/server/http"
import { createObjectKey, createPresignedUpload } from "@/lib/storage/r2"
import { createUploadTicket } from "@/lib/storage/upload-ticket"
import { UploadPolicyError, validateUpload } from "@/lib/storage/upload-policy"

export const runtime = "nodejs"

const UPLOAD_URL_TTL_SECONDS = 5 * 60
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const user = await requireUser(request)
    const body = (await request.json()) as Record<string, unknown>
    const portfolioId = body.portfolioId ?? null
    if (
      portfolioId !== null &&
      (typeof portfolioId !== "string" || !UUID_PATTERN.test(portfolioId))
    ) {
      throw new HttpError(
        400,
        "Portfolio ID must be a valid UUID.",
        "INVALID_PORTFOLIO_ID"
      )
    }
    if (portfolioId) {
      const [portfolio] = await db
        .select({ id: portfolios.id })
        .from(portfolios)
        .where(
          and(eq(portfolios.id, portfolioId), eq(portfolios.userId, user.id))
        )
        .limit(1)
      if (!portfolio) {
        throw new HttpError(404, "Portfolio not found.", "PORTFOLIO_NOT_FOUND")
      }
    }
    const upload = validateUpload({
      contentType: body.contentType,
      size: body.size,
    })
    const key = createObjectKey(user.id, upload.extension)
    const expiresAt = Date.now() + UPLOAD_URL_TTL_SECONDS * 1000
    const uploadUrl = await createPresignedUpload({
      key,
      contentType: upload.contentType,
      size: upload.size,
      expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
    })
    const ticket = createUploadTicket({
      ownerId: user.id,
      portfolioId,
      key,
      contentType: upload.contentType,
      size: upload.size,
      kind: upload.kind,
      expiresAt,
    })

    return Response.json({
      key,
      uploadUrl,
      ticket,
      expiresAt: new Date(expiresAt).toISOString(),
      headers: { "Content-Type": upload.contentType },
    })
  } catch (error) {
    if (error instanceof UploadPolicyError) {
      return toErrorResponse(
        new HttpError(400, error.message, "INVALID_UPLOAD")
      )
    }
    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new HttpError(400, "Request body must be valid JSON.", "INVALID_JSON")
      )
    }
    return toErrorResponse(error)
  }
}
