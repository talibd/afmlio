import type { NextRequest } from "next/server"
import { timingSafeEqual } from "node:crypto"

import { requireUser } from "@/lib/server/auth"
import { HttpError, toErrorResponse } from "@/lib/server/http"
import {
  assertOwnerCanAccessKey,
  signLocalUpload,
  writeLocalObject,
} from "@/lib/storage/r2"
import { storageDriver } from "@/lib/storage/r2-env"
import {
  normalizeContentType,
  UploadPolicyError,
  validateUpload,
} from "@/lib/storage/upload-policy"

export const runtime = "nodejs"

/**
 * Development stand-in for the presigned R2 PUT. Same contract as Cloudflare:
 * the URL from /api/uploads/authorize carries a short-lived signature, the
 * browser PUTs the raw bytes, and /api/uploads/complete verifies afterwards.
 * storageDriver() never returns "local" in production, so this is a 404 there.
 */
export async function PUT(request: NextRequest) {
  try {
    if (storageDriver() !== "local") {
      throw new HttpError(404, "Not found.", "NOT_FOUND")
    }
    const user = await requireUser(request)

    const key = request.nextUrl.searchParams.get("key") ?? ""
    const exp = Number(request.nextUrl.searchParams.get("exp") ?? "")
    const sig = request.nextUrl.searchParams.get("sig") ?? ""
    if (!key || !Number.isFinite(exp) || !sig) {
      throw new HttpError(400, "Invalid upload URL.", "INVALID_UPLOAD_URL")
    }
    if (exp < Date.now()) {
      throw new HttpError(403, "The upload URL has expired.", "UPLOAD_URL_EXPIRED")
    }
    const expected = Buffer.from(signLocalUpload(key, exp))
    const supplied = Buffer.from(sig)
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
      throw new HttpError(403, "Invalid upload signature.", "INVALID_UPLOAD_SIGNATURE")
    }
    assertOwnerCanAccessKey(user.id, key)

    const contentType = normalizeContentType(
      request.headers.get("content-type") ?? ""
    )
    // ponytail: whole body in memory — fine for a dev driver; R2 handles prod.
    const bytes = Buffer.from(await request.arrayBuffer())
    validateUpload({ contentType, size: bytes.length })

    await writeLocalObject(key, bytes, contentType)
    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof UploadPolicyError) {
      return toErrorResponse(new HttpError(422, error.message, "UPLOAD_REJECTED"))
    }
    if (error instanceof Error && error.message === "Object not found.") {
      return toErrorResponse(new HttpError(404, error.message, "OBJECT_NOT_FOUND"))
    }
    return toErrorResponse(error)
  }
}
