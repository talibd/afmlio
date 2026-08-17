import "server-only"

import { createHash, createHmac, randomUUID } from "node:crypto"
import { mkdir, rm, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { getR2Environment, storageDriver, uploadTicketSecret } from "@/lib/storage/r2-env"
import type { UploadContentType } from "@/lib/storage/upload-policy"

/* ------------------------------------------------------------------------ *
 * Local driver (development only). Same authorize → PUT → complete flow and
 * the same signatures, but bytes land in public/uploads so the app can be
 * exercised without Cloudflare credentials. storageDriver() refuses "local"
 * in production.
 * ------------------------------------------------------------------------ */

const LOCAL_ROOT = path.join(process.cwd(), "public", "uploads")

export function resolveLocalObjectPath(key: string) {
  const resolved = path.resolve(LOCAL_ROOT, key)
  if (!resolved.startsWith(path.resolve(LOCAL_ROOT) + path.sep)) {
    throw new Error("Object not found.")
  }
  return resolved
}

export function signLocalUpload(key: string, expiresAtMs: number) {
  return createHmac("sha256", uploadTicketSecret())
    .update(`${key}|${expiresAtMs}`)
    .digest("base64url")
}

class LocalObjectMissingError extends Error {
  name = "NotFound"
}

let cachedClient: S3Client | undefined

function getClient() {
  if (cachedClient) return cachedClient
  const environment = getR2Environment()
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${environment.accountId}.r2.cloudflarestorage.com`,
    // R2 does not require the SDK's automatic CRC32 query parameters, and a
    // presigner cannot checksum bytes that the browser has not sent yet.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: environment.accessKeyId,
      secretAccessKey: environment.secretAccessKey,
    },
  })
  return cachedClient
}

export function ownerStoragePrefix(ownerId: string) {
  const ownerHash = createHash("sha256")
    .update(ownerId)
    .digest("hex")
    .slice(0, 32)
  return `users/${ownerHash}/`
}

export function createObjectKey(ownerId: string, extension: string) {
  return `${ownerStoragePrefix(ownerId)}${randomUUID()}.${extension}`
}

export function assertOwnerCanAccessKey(
  ownerId: string,
  key: unknown
): asserts key is string {
  if (
    typeof key !== "string" ||
    key.length > 256 ||
    !key.startsWith(ownerStoragePrefix(ownerId)) ||
    key.includes("..") ||
    key.includes("\\")
  ) {
    throw new Error("Object not found.")
  }
}

export async function createPresignedUpload(input: {
  key: string
  contentType: UploadContentType
  size: number
  expiresInSeconds: number
}) {
  if (storageDriver() === "local") {
    const expiresAt = Date.now() + input.expiresInSeconds * 1000
    const query = new URLSearchParams({
      key: input.key,
      exp: String(expiresAt),
      sig: signLocalUpload(input.key, expiresAt),
    })
    return `/api/uploads/local?${query.toString()}`
  }
  const environment = getR2Environment()
  const command = new PutObjectCommand({
    Bucket: environment.bucketName,
    Key: input.key,
    ContentType: input.contentType,
    ContentLength: input.size,
  })

  return getSignedUrl(getClient(), command, {
    expiresIn: input.expiresInSeconds,
  })
}

export async function inspectObject(key: string) {
  if (storageDriver() === "local") {
    try {
      const filePath = resolveLocalObjectPath(key)
      const [fileStat, meta] = await Promise.all([
        stat(filePath),
        readFile(`${filePath}.meta.json`, "utf8").then(
          (raw) => JSON.parse(raw) as { contentType?: string }
        ),
      ])
      return { ContentLength: fileStat.size, ContentType: meta.contentType }
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
        throw new LocalObjectMissingError("Object not found.")
      }
      throw error
    }
  }
  const environment = getR2Environment()
  return getClient().send(
    new HeadObjectCommand({ Bucket: environment.bucketName, Key: key })
  )
}

/** PUT handler support: persist bytes plus a content-type sidecar. */
export async function writeLocalObject(
  key: string,
  bytes: Buffer,
  contentType: string
) {
  const filePath = resolveLocalObjectPath(key)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, bytes)
  await writeFile(
    `${filePath}.meta.json`,
    JSON.stringify({ contentType, size: bytes.length })
  )
}

export function isMissingObjectError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const candidate = error as {
    name?: unknown
    $metadata?: { httpStatusCode?: unknown }
  }
  return (
    candidate.name === "NotFound" ||
    candidate.name === "NoSuchKey" ||
    candidate.$metadata?.httpStatusCode === 404
  )
}

export async function deleteObject(key: string) {
  if (storageDriver() === "local") {
    const filePath = resolveLocalObjectPath(key)
    await rm(filePath, { force: true })
    await rm(`${filePath}.meta.json`, { force: true })
    return
  }
  const environment = getR2Environment()
  await getClient().send(
    new DeleteObjectCommand({ Bucket: environment.bucketName, Key: key })
  )
}

export function publicObjectUrl(key: string) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/")
  if (storageDriver() === "local") {
    return `/uploads/${encodedKey}`
  }
  return `${getR2Environment().publicBaseUrl}/${encodedKey}`
}
