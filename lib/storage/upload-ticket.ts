import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

import { uploadTicketSecret } from "@/lib/storage/r2-env"
import type { UploadContentType, UploadKind } from "@/lib/storage/upload-policy"

export type UploadTicketPayload = {
  ownerId: string
  portfolioId: string | null
  key: string
  contentType: UploadContentType
  size: number
  kind: UploadKind
  expiresAt: number
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url")
}

function sign(payload: string) {
  return createHmac("sha256", uploadTicketSecret())
    .update(payload)
    .digest("base64url")
}

export function createUploadTicket(payload: UploadTicketPayload) {
  const encodedPayload = encode(JSON.stringify(payload))
  return `${encodedPayload}.${sign(encodedPayload)}`
}

export function verifyUploadTicket(ticket: unknown): UploadTicketPayload {
  if (typeof ticket !== "string" || ticket.length > 4096) {
    throw new Error("Invalid upload ticket.")
  }

  const [encodedPayload, suppliedSignature, extra] = ticket.split(".")
  if (!encodedPayload || !suppliedSignature || extra) {
    throw new Error("Invalid upload ticket.")
  }

  const expectedSignature = sign(encodedPayload)
  const supplied = Buffer.from(suppliedSignature)
  const expected = Buffer.from(expectedSignature)
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    throw new Error("Invalid upload ticket.")
  }

  let payload: UploadTicketPayload
  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    )
  } catch {
    throw new Error("Invalid upload ticket.")
  }

  if (
    !payload ||
    typeof payload.ownerId !== "string" ||
    (payload.portfolioId !== null && typeof payload.portfolioId !== "string") ||
    typeof payload.key !== "string" ||
    typeof payload.contentType !== "string" ||
    typeof payload.size !== "number" ||
    (payload.kind !== "image" && payload.kind !== "video") ||
    typeof payload.expiresAt !== "number" ||
    payload.expiresAt < Date.now()
  ) {
    throw new Error("Upload ticket is invalid or expired.")
  }

  return payload
}
