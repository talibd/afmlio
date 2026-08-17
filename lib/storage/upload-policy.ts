const MIB = 1024 * 1024

export const IMAGE_UPLOAD_MAX_BYTES = 15 * MIB
export const VIDEO_UPLOAD_MAX_BYTES = 500 * MIB

const UPLOAD_TYPES = {
  "image/jpeg": {
    kind: "image",
    extension: "jpg",
    maxBytes: IMAGE_UPLOAD_MAX_BYTES,
  },
  "image/png": {
    kind: "image",
    extension: "png",
    maxBytes: IMAGE_UPLOAD_MAX_BYTES,
  },
  "image/webp": {
    kind: "image",
    extension: "webp",
    maxBytes: IMAGE_UPLOAD_MAX_BYTES,
  },
  "image/gif": {
    kind: "image",
    extension: "gif",
    maxBytes: IMAGE_UPLOAD_MAX_BYTES,
  },
  "image/avif": {
    kind: "image",
    extension: "avif",
    maxBytes: IMAGE_UPLOAD_MAX_BYTES,
  },
  "video/mp4": {
    kind: "video",
    extension: "mp4",
    maxBytes: VIDEO_UPLOAD_MAX_BYTES,
  },
  "video/webm": {
    kind: "video",
    extension: "webm",
    maxBytes: VIDEO_UPLOAD_MAX_BYTES,
  },
  "video/quicktime": {
    kind: "video",
    extension: "mov",
    maxBytes: VIDEO_UPLOAD_MAX_BYTES,
  },
} as const

export type UploadContentType = keyof typeof UPLOAD_TYPES
export type UploadKind = (typeof UPLOAD_TYPES)[UploadContentType]["kind"]

export class UploadPolicyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UploadPolicyError"
  }
}

export function normalizeContentType(value: string) {
  return value.split(";", 1)[0]?.trim().toLowerCase() ?? ""
}

export function validateUpload(input: { contentType: unknown; size: unknown }) {
  if (typeof input.contentType !== "string") {
    throw new UploadPolicyError("A valid content type is required.")
  }

  const contentType = normalizeContentType(input.contentType)
  if (!(contentType in UPLOAD_TYPES)) {
    throw new UploadPolicyError(
      "Unsupported file type. Upload a JPEG, PNG, WebP, GIF, AVIF, MP4, WebM, or MOV file."
    )
  }

  if (
    typeof input.size !== "number" ||
    !Number.isSafeInteger(input.size) ||
    input.size <= 0
  ) {
    throw new UploadPolicyError("File size must be a positive integer.")
  }

  const policy = UPLOAD_TYPES[contentType as UploadContentType]
  if (input.size > policy.maxBytes) {
    const maxMb = policy.maxBytes / MIB
    throw new UploadPolicyError(
      `${policy.kind === "image" ? "Images" : "Videos"} must be ${maxMb} MB or smaller.`
    )
  }

  return {
    contentType: contentType as UploadContentType,
    size: input.size,
    kind: policy.kind,
    extension: policy.extension,
  }
}
