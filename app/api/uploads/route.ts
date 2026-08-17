import type { NextRequest } from "next/server"
import { and, eq } from "drizzle-orm"

import { mediaAssets } from "@/db/schema"
import { requireUser } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import { assertSameOrigin, HttpError, toErrorResponse } from "@/lib/server/http"
import { assertOwnerCanAccessKey, deleteObject } from "@/lib/storage/r2"

export const runtime = "nodejs"

export async function DELETE(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const user = await requireUser(request)
    const body = (await request.json()) as Record<string, unknown>
    assertOwnerCanAccessKey(user.id, body.key)
    const [asset] = await db
      .select({ key: mediaAssets.key })
      .from(mediaAssets)
      .where(
        and(eq(mediaAssets.key, body.key), eq(mediaAssets.userId, user.id))
      )
      .limit(1)
    if (!asset) {
      throw new HttpError(404, "Object not found.", "OBJECT_NOT_FOUND")
    }
    await deleteObject(body.key)
    await db
      .delete(mediaAssets)
      .where(
        and(eq(mediaAssets.key, body.key), eq(mediaAssets.userId, user.id))
      )
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new HttpError(400, "Request body must be valid JSON.", "INVALID_JSON")
      )
    }
    if (error instanceof Error && error.message === "Object not found.") {
      return toErrorResponse(
        new HttpError(404, error.message, "OBJECT_NOT_FOUND")
      )
    }
    return toErrorResponse(error)
  }
}
