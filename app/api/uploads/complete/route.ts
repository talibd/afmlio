import type { NextRequest } from "next/server"
import { randomUUID } from "node:crypto"
import { and, eq } from "drizzle-orm"

import { mediaAssets } from "@/db/schema"
import { requireUser } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import { assertSameOrigin, HttpError, toErrorResponse } from "@/lib/server/http"
import {
  deleteObject,
  inspectObject,
  isMissingObjectError,
  publicObjectUrl,
} from "@/lib/storage/r2"
import { verifyUploadTicket } from "@/lib/storage/upload-ticket"
import { normalizeContentType } from "@/lib/storage/upload-policy"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const user = await requireUser(request)
    const body = (await request.json()) as Record<string, unknown>
    const ticket = verifyUploadTicket(body.ticket)

    if (ticket.ownerId !== user.id) {
      throw new HttpError(404, "Object not found.", "OBJECT_NOT_FOUND")
    }

    const object = await inspectObject(ticket.key)
    const actualType = normalizeContentType(object.ContentType ?? "")
    if (
      object.ContentLength !== ticket.size ||
      actualType !== ticket.contentType
    ) {
      await deleteObject(ticket.key)
      throw new HttpError(
        422,
        "Uploaded object did not match the authorized file.",
        "UPLOAD_MISMATCH"
      )
    }

    const url = publicObjectUrl(ticket.key)
    await db
      .insert(mediaAssets)
      .values({
        id: randomUUID(),
        userId: user.id,
        portfolioId: ticket.portfolioId,
        key: ticket.key,
        url,
        kind: ticket.kind,
        contentType: ticket.contentType,
        size: ticket.size,
        status: "ready",
      })
      .onConflictDoNothing({ target: mediaAssets.key })

    const [asset] = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(
        and(eq(mediaAssets.key, ticket.key), eq(mediaAssets.userId, user.id))
      )
      .limit(1)
    if (!asset) {
      throw new HttpError(
        409,
        "The upload could not be registered.",
        "UPLOAD_REGISTRATION_FAILED"
      )
    }

    return Response.json({
      id: asset.id,
      key: ticket.key,
      url,
      contentType: ticket.contentType,
      size: ticket.size,
      kind: ticket.kind,
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new HttpError(400, "Request body must be valid JSON.", "INVALID_JSON")
      )
    }
    if (error instanceof Error && /ticket/i.test(error.message)) {
      return toErrorResponse(
        new HttpError(400, error.message, "INVALID_UPLOAD_TICKET")
      )
    }
    if (isMissingObjectError(error)) {
      return toErrorResponse(
        new HttpError(
          409,
          "The upload has not completed yet.",
          "UPLOAD_INCOMPLETE"
        )
      )
    }
    return toErrorResponse(error)
  }
}
