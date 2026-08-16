"use client"

import * as React from "react"
import { Code2, Paperclip, Plus, Upload, User, X } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const MAX_BYTES = 500 * 1024 * 1024

type FileAsset = {
  id: string
  kind: "image" | "video" | "file"
  url: string
  name: string
  size: number
}

type LinkAsset = {
  id: string
  href: string
  host: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function kindFromFile(file: File): FileAsset["kind"] | null {
  if (file.size > MAX_BYTES) return null
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  if (file.type === "application/pdf") return "file"
  return null
}

function parsePasted(raw: string): Omit<LinkAsset, "id"> | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const iframeSrc = trimmed.match(/src\s*=\s*["']([^"']+)["']/i)?.[1]
  const candidate = iframeSrc ?? trimmed
  try {
    const url = new URL(
      /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`,
    )
    return {
      href: url.href,
      host: url.hostname.replace(/^www\./, ""),
    }
  } catch {
    return null
  }
}

function faviconSrc(host: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`
}

export function MediaList() {
  const [files, setFiles] = React.useState<FileAsset[]>([])
  const [links, setLinks] = React.useState<LinkAsset[]>([])
  const [dragging, setDragging] = React.useState(false)
  const [paste, setPaste] = React.useState("")
  const filesRef = React.useRef(files)
  React.useEffect(() => {
    filesRef.current = files
  }, [files])

  React.useEffect(() => {
    return () => {
      for (const file of filesRef.current) URL.revokeObjectURL(file.url)
    }
  }, [])

  function persistMedia(nextFiles: FileAsset[], nextLinks: LinkAsset[]) {
    try {
      localStorage.setItem(
        "afm:onboarding:media",
        JSON.stringify({
          stills: nextFiles.filter((f) => f.kind === "image").map((f) => f.url),
          clips: nextFiles.filter((f) => f.kind === "video").map((f) => f.url),
          filmLink: nextLinks[0]?.href,
        }),
      )
    } catch {
      /* quota */
    }
  }

  function addFiles(list: FileList | File[] | null) {
    if (!list) return
    const next: FileAsset[] = []
    for (const file of list) {
      const kind = kindFromFile(file)
      if (!kind) continue
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${next.length}`,
        kind,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      })
    }
    if (!next.length) return
    setFiles((current) => {
      const merged = [...current, ...next]
      persistMedia(merged, links)
      return merged
    })
  }

  function addLink() {
    const parsed = parsePasted(paste)
    if (!parsed) return
    setLinks((current) => {
      if (current.some((item) => item.href === parsed.href)) return current
      const merged = [...current, { id: parsed.href, ...parsed }]
      persistMedia(files, merged)
      return merged
    })
    setPaste("")
  }

  function removeFile(id: string) {
    setFiles((current) => {
      const asset = current.find((item) => item.id === id)
      if (asset) URL.revokeObjectURL(asset.url)
      return current.filter((item) => item.id !== id)
    })
  }

  const inputId = "onboarding-project-assets"

  return (
    <div className="flex flex-col gap-3 font-sans">
      <input
        id={inputId}
        type="file"
        accept="image/*,video/*,application/pdf"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files)
          event.target.value = ""
        }}
      />

      {files.length === 0 ? (
        <label
          htmlFor={inputId}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            if (event.currentTarget.contains(event.relatedTarget as Node)) return
            setDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            addFiles(event.dataTransfer.files)
          }}
          className={cn(
            "flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center",
            dragging ? "border-foreground/40 bg-card" : "border-border bg-card",
          )}
        >
          <Upload className="size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <span className="mt-3 text-sm font-medium tracking-tight">
            Drag and drop or browse files
          </span>
          <span className="mt-1 text-xs text-muted-foreground">Maximum 500 MB file size</span>
        </label>
      ) : (
        <ul className="grid grid-cols-4 gap-2">
          {files.map((asset) => (
            <li key={asset.id} className="relative min-w-0">
              <span className="block overflow-hidden rounded-xl bg-card">
                {asset.kind === "video" ? (
                  <video
                    src={asset.url}
                    className="aspect-square w-full object-cover"
                    muted
                    playsInline
                  />
                ) : asset.kind === "image" ? (
                  // ponytail: object URLs for local preview only
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <span className="flex aspect-square items-center justify-center text-muted-foreground">
                    <Paperclip className="size-5" strokeWidth={1.5} aria-hidden />
                  </span>
                )}
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {formatSize(asset.size)}
                </span>
              </span>
              <button
                type="button"
                className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground"
                onClick={() => removeFile(asset.id)}
                aria-label={`Remove ${asset.name}`}
              >
                <X className="size-3" strokeWidth={2} />
              </button>
            </li>
          ))}
          <li>
            <label
              htmlFor={inputId}
              className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border bg-card text-muted-foreground"
            >
              <Plus className="size-6" strokeWidth={1.75} aria-hidden />
              <span className="sr-only">Add files</span>
            </label>
          </li>
        </ul>
      )}

      <div className="flex justify-center">
        <div
          className="flex gap-2"
          aria-label="Supported: YouTube, Vimeo, and iframe embeds"
        >
          <Avatar size="sm">
            <AvatarImage
              src={faviconSrc("youtube.com")}
              alt="YouTube"
              className="object-contain p-1"
            />
            <AvatarFallback>YT</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarImage src={faviconSrc("vimeo.com")} alt="Vimeo" />
            <AvatarFallback>VI</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback>
              <Code2 className="size-3" strokeWidth={1.75} aria-hidden />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          addLink()
        }}
      >
        <Input
          value={paste}
          onChange={(event) => setPaste(event.target.value)}
          type="text"
          placeholder="Paste a link or iframe"
          aria-label="Paste a link or iframe"
        />
        <Button type="submit" className="h-11 px-4 font-normal">
          Add
        </Button>
      </form>

      {links.length > 0 ? (
        <ul className="flex flex-wrap justify-center gap-2">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 max-w-[14rem] items-center gap-1.5 rounded-lg border bg-secondary py-1 pr-1 pl-3 text-xs text-muted-foreground"
              >
                {/* favicon host is user-pasted */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={faviconSrc(link.host)}
                  alt=""
                  width={14}
                  height={14}
                  className="size-3.5 rounded-sm"
                />
                <span className="min-w-0 truncate">{link.host}</span>
                <button
                  type="button"
                  className="flex size-5 items-center justify-center rounded-full text-muted-foreground"
                  onClick={(event) => {
                    event.preventDefault()
                    setLinks((current) => current.filter((item) => item.id !== link.id))
                  }}
                  aria-label={`Remove ${link.host}`}
                >
                  <X className="size-3" strokeWidth={2} />
                </button>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function HeadshotField({
  value,
  onChange,
}: {
  value?: string
  onChange?: (dataUrl: string | undefined) => void
} = {}) {
  const [uploaded, setUploaded] = React.useState<{ url: string; name: string } | undefined>()
  const preview = uploaded ?? (value ? { url: value, name: "Saved headshot" } : undefined)

  React.useEffect(() => {
    return () => {
      if (uploaded && uploaded.url.startsWith("blob:")) {
        URL.revokeObjectURL(uploaded.url)
      }
    }
  }, [uploaded])

  return (
    <label
      htmlFor="onboarding-headshot"
      className="group flex cursor-pointer items-end gap-4 font-sans"
    >
      <input
        id="onboarding-headshot"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => {
            const url = String(reader.result)
            setUploaded({ url, name: file.name })
            onChange?.(url)
          }
          reader.readAsDataURL(file)
        }}
      />
      <span
        className={cn(
          "relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-inset",
          preview
            ? "bg-card ring-border"
            : "bg-primary/10 ring-primary/20 group-hover:bg-primary/15",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.url} alt="" className="size-full object-cover" />
        ) : (
          <User className="size-6 text-primary/45" strokeWidth={1.25} aria-hidden />
        )}
      </span>
      <span className="min-w-0 pb-1">
        <span className="block text-sm font-medium tracking-tight">
          Profile photo
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {preview?.name ?? "Optional. Sits beside your name."}
        </span>
      </span>
    </label>
  )
}
