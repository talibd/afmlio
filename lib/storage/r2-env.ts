import "server-only"

type R2Environment = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicBaseUrl: string
  uploadTicketSecret: string
}

let cachedEnvironment: R2Environment | undefined

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value)
    throw new Error(`Missing required server environment variable: ${name}`)
  return value
}

const R2_ENV_NAMES = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
] as const

/**
 * Where uploaded bytes go. "local" writes to public/uploads for development
 * without Cloudflare credentials; production always requires real R2.
 */
export function storageDriver(): "r2" | "local" {
  const explicit = process.env.STORAGE_DRIVER?.trim().toLowerCase()
  if (explicit === "local") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("STORAGE_DRIVER=local is a development-only mode.")
    }
    return "local"
  }
  if (explicit === "r2") return "r2"
  if (R2_ENV_NAMES.every((name) => process.env[name]?.trim())) return "r2"
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cloudflare R2 is not configured for production.")
  }
  return "local"
}

/** Ticket signing must work in local mode, where R2 env may be absent. */
export function uploadTicketSecret(): string {
  const fromEnv = process.env.UPLOAD_TICKET_SECRET?.trim()
  if (fromEnv) {
    if (fromEnv.length < 32) {
      throw new Error("UPLOAD_TICKET_SECRET must contain at least 32 characters.")
    }
    return fromEnv
  }
  if (storageDriver() === "local") {
    // Dev-only fallback; storageDriver() has already refused local in production.
    return "afm-local-development-upload-ticket-secret"
  }
  return getR2Environment().uploadTicketSecret
}

export function getR2Environment(): R2Environment {
  if (cachedEnvironment) return cachedEnvironment

  const publicBaseUrl = required("R2_PUBLIC_BASE_URL").replace(/\/+$/, "")
  let parsedPublicUrl: URL
  try {
    parsedPublicUrl = new URL(publicBaseUrl)
  } catch {
    throw new Error("R2_PUBLIC_BASE_URL must be an absolute HTTPS URL.")
  }

  if (parsedPublicUrl.protocol !== "https:") {
    throw new Error("R2_PUBLIC_BASE_URL must use HTTPS.")
  }

  const uploadTicketSecret = required("UPLOAD_TICKET_SECRET")
  if (uploadTicketSecret.length < 32) {
    throw new Error("UPLOAD_TICKET_SECRET must contain at least 32 characters.")
  }

  cachedEnvironment = {
    accountId: required("R2_ACCOUNT_ID"),
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    bucketName: required("R2_BUCKET_NAME"),
    publicBaseUrl,
    uploadTicketSecret,
  }
  return cachedEnvironment
}
