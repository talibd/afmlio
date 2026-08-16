"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

import {
  BLOCK_CATALOG,
  blockLabel,
  createBlock,
  resetBlock,
} from "@/lib/blocks"
import { type FolioBlock, type Portfolio } from "@/lib/demo"
import { persistImageFile } from "@/lib/image-utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const actionClass =
  "flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-sidebar-ring"

const fieldLabelClass = "text-xs font-medium text-sidebar-foreground/70"

const CORE_BLOCK_TYPES = new Set<FolioBlock["type"]>([
  "featured",
  "still",
  "skills",
  "about",
  "contact",
])

function parsePipe(item: string, partsCount = 2): string[] {
  const parts = item.split("|")
  while (parts.length < partsCount) {
    parts.push("")
  }
  return parts
}

function ImageField({
  id,
  value,
  mediaKind,
  alt,
  onChange,
  onKindChange,
  onAltChange,
  label = "Image",
}: {
  id: string
  value?: string
  mediaKind?: "image" | "video"
  alt?: string
  onChange: (url: string) => void
  onKindChange?: (kind: "image" | "video") => void
  onAltChange?: (alt: string) => void
  label?: string
}) {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const isUploadedMedia = value?.startsWith("data:") ?? false
  const isVideo =
    mediaKind === "video" ||
    value?.startsWith("data:video/") ||
    /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(value ?? "")

  async function handleFile(file: File | undefined) {
    if (!file) return
    const video = file.type.startsWith("video/")
    const dataUrl = video
      ? file.size <= 3_000_000
        ? await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = () => resolve("")
            reader.readAsDataURL(file)
          })
        : ""
      : await persistImageFile(file)
    if (dataUrl) {
      onChange(dataUrl)
      onKindChange?.(video ? "video" : "image")
      toast.success(video ? "Video uploaded" : "Image uploaded")
    } else {
      toast.error(
        video
          ? "Video too large. Choose a file under 3 MB."
          : "Image too large. Try a smaller file."
      )
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className={fieldLabelClass} htmlFor={`${id}-file`}>
        {label}
      </label>
      <input
        id={`${id}-file`}
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />
      {!value ? (
        <div className="flex gap-1.5">
          <Input
            id={`${id}-url`}
            value=""
            placeholder="Paste an image or video URL"
            className="h-8 flex-1 rounded-md bg-background px-2.5 text-xs"
            onChange={(e) => {
              onChange(e.target.value)
              onKindChange?.(
                /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(e.target.value)
                  ? "video"
                  : "image"
              )
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2 text-xs font-normal"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="size-3" />
            Upload
          </Button>
        </div>
      ) : null}
      {value ? (
        <div className="relative mt-0.5 aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {isVideo ? (
            <video
              src={value}
              aria-label={alt || "Block video preview"}
              className="size-full object-cover"
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={alt || "Block preview"}
              className="size-full object-cover"
            />
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="bg-background/90"
              onClick={() => fileRef.current?.click()}
              aria-label="Replace media"
              title="Replace media"
            >
              <Upload className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="bg-background/90 text-destructive hover:text-destructive"
              onClick={() => {
                onChange("")
                onKindChange?.("image")
              }}
              aria-label="Remove media"
              title="Remove media"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : null}
      {value && !isUploadedMedia ? (
        <Input
          id={`${id}-url`}
          value={value}
          aria-label={`${label} URL`}
          className="h-7 rounded-md bg-background px-2.5 text-xs text-muted-foreground"
          onChange={(e) => {
            onChange(e.target.value)
            onKindChange?.(
              /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(e.target.value)
                ? "video"
                : "image"
            )
          }}
        />
      ) : null}
      {onAltChange ? (
        <div className="flex flex-col gap-1">
          <label className={fieldLabelClass} htmlFor={`${id}-alt`}>
            Media description
          </label>
          <Input
            id={`${id}-alt`}
            value={alt ?? ""}
            placeholder="Describe the image"
            className="h-10 rounded-lg bg-background px-3 text-sm"
            onChange={(e) => onAltChange(e.target.value)}
          />
        </div>
      ) : null}
    </div>
  )
}

function SkillsListEditor({
  items,
  onChange,
}: {
  items: string[]
  onChange: (items: string[]) => void
}) {
  const [bulkInput, setBulkInput] = React.useState("")

  function updateItem(idx: number, val: string) {
    const next = [...items]
    next[idx] = val
    onChange(next)
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= items.length) return
    const next = [...items]
    const [item] = next.splice(idx, 1)
    next.splice(nextIdx, 0, item)
    onChange(next)
  }

  function addItem() {
    onChange([...items, "New Skill"])
  }

  function handleBulkAdd() {
    if (!bulkInput.trim()) return
    const newItems = bulkInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (newItems.length) {
      onChange([...items, ...newItems])
      setBulkInput("")
      toast.success(`Added ${newItems.length} item(s)`)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <Input
              value={item}
              placeholder="Skill / item name"
              className="h-7 flex-1 rounded-md bg-background px-2 text-xs"
              onChange={(e) => updateItem(idx, e.target.value)}
            />
            <button
              type="button"
              aria-label="Move up"
              disabled={idx === 0}
              className="flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-25"
              onClick={() => moveItem(idx, -1)}
            >
              <ArrowUp className="size-3" />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={idx === items.length - 1}
              className="flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-25"
              onClick={() => moveItem(idx, 1)}
            >
              <ArrowDown className="size-3" />
            </button>
            <button
              type="button"
              aria-label="Delete item"
              className="flex size-7 shrink-0 items-center justify-center rounded text-destructive/80 hover:text-destructive"
              onClick={() => removeItem(idx)}
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 flex-1 gap-1 text-xs font-normal"
          onClick={addItem}
        >
          <Plus className="size-3" />
          Add item
        </Button>
      </div>
      <div className="flex gap-1 border-t border-border/40 pt-1">
        <Input
          value={bulkInput}
          placeholder="Bulk add (comma-separated)..."
          className="h-7 flex-1 rounded-md bg-background px-2 text-xs"
          onChange={(e) => setBulkInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleBulkAdd()
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!bulkInput.trim()}
          className="h-7 px-2 text-xs font-normal"
          onClick={handleBulkAdd}
        >
          Add
        </Button>
      </div>
    </div>
  )
}

function FeaturesListEditor({
  items,
  onChange,
}: {
  items: string[]
  onChange: (items: string[]) => void
}) {
  function updateItem(idx: number, title: string, description: string) {
    const next = [...items]
    next[idx] = `${title}|${description}`
    onChange(next)
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= items.length) return
    const next = [...items]
    const [item] = next.splice(idx, 1)
    next.splice(nextIdx, 0, item)
    onChange(next)
  }

  function addItem() {
    onChange([...items, "New Feature|Description of feature or service"])
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, idx) => {
        const [title, description] = parsePipe(item, 2)
        return (
          <div
            key={idx}
            className="flex flex-col gap-1.5 rounded-md border border-border/50 bg-background/60 p-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Item #{idx + 1}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={idx === 0}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-25"
                  onClick={() => moveItem(idx, -1)}
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={idx === items.length - 1}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-25"
                  onClick={() => moveItem(idx, 1)}
                >
                  <ArrowDown className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Delete item"
                  className="flex size-6 items-center justify-center rounded text-destructive/80 hover:text-destructive"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
            <Input
              value={title}
              placeholder="Title"
              className="h-7 rounded bg-background px-2 text-xs"
              onChange={(e) => updateItem(idx, e.target.value, description)}
            />
            <Textarea
              value={description}
              placeholder="Description"
              rows={2}
              className="min-h-12 rounded bg-background p-1.5 text-xs"
              onChange={(e) => updateItem(idx, title, e.target.value)}
            />
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 w-full gap-1 text-xs font-normal"
        onClick={addItem}
      >
        <Plus className="size-3" />
        Add Item
      </Button>
    </div>
  )
}

function ReviewsListEditor({
  items,
  onChange,
}: {
  items: string[]
  onChange: (items: string[]) => void
}) {
  function updateItem(
    idx: number,
    quote: string,
    author: string,
    role: string,
    avatar: string
  ) {
    const next = [...items]
    next[idx] = `${quote}|${author}|${role}|${avatar}`
    onChange(next)
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= items.length) return
    const next = [...items]
    const [item] = next.splice(idx, 1)
    next.splice(nextIdx, 0, item)
    onChange(next)
  }

  function addItem() {
    onChange([
      ...items,
      "An exceptional talent with visionary design instincts.|Sarah Jenkins|Creative Director|",
    ])
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, idx) => {
        const [quote, author, role, avatar] = parsePipe(item, 4)
        return (
          <div
            key={idx}
            className="flex flex-col gap-1.5 rounded-md border border-border/50 bg-background/60 p-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Review #{idx + 1}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={idx === 0}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-25"
                  onClick={() => moveItem(idx, -1)}
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={idx === items.length - 1}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-25"
                  onClick={() => moveItem(idx, 1)}
                >
                  <ArrowDown className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Delete review"
                  className="flex size-6 items-center justify-center rounded text-destructive/80 hover:text-destructive"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
            <Textarea
              value={quote}
              placeholder="Testimonial quote..."
              rows={2}
              className="min-h-12 rounded bg-background p-1.5 text-xs"
              onChange={(e) =>
                updateItem(idx, e.target.value, author, role, avatar)
              }
            />
            <div className="grid grid-cols-2 gap-1">
              <Input
                value={author}
                placeholder="Author name"
                className="h-7 rounded bg-background px-2 text-xs"
                onChange={(e) =>
                  updateItem(idx, quote, e.target.value, role, avatar)
                }
              />
              <Input
                value={role}
                placeholder="Role / Company"
                className="h-7 rounded bg-background px-2 text-xs"
                onChange={(e) =>
                  updateItem(idx, quote, author, e.target.value, avatar)
                }
              />
            </div>
            <Input
              value={avatar}
              placeholder="Avatar image URL (optional)"
              className="h-7 rounded bg-background px-2 text-xs"
              onChange={(e) =>
                updateItem(idx, quote, author, role, e.target.value)
              }
            />
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 w-full gap-1 text-xs font-normal"
        onClick={addItem}
      >
        <Plus className="size-3" />
        Add Review
      </Button>
    </div>
  )
}

function FaqListEditor({
  items,
  onChange,
}: {
  items: string[]
  onChange: (items: string[]) => void
}) {
  function updateItem(idx: number, question: string, answer: string) {
    const next = [...items]
    next[idx] = `${question}|${answer}`
    onChange(next)
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx))
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const nextIdx = idx + dir
    if (nextIdx < 0 || nextIdx >= items.length) return
    const next = [...items]
    const [item] = next.splice(idx, 1)
    next.splice(nextIdx, 0, item)
    onChange(next)
  }

  function addItem() {
    onChange([
      ...items,
      "What is your current availability?|I am available for select freelance and contract projects starting next month.",
    ])
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, idx) => {
        const [question, answer] = parsePipe(item, 2)
        return (
          <div
            key={idx}
            className="flex flex-col gap-1.5 rounded-md border border-border/50 bg-background/60 p-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Question #{idx + 1}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={idx === 0}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-25"
                  onClick={() => moveItem(idx, -1)}
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={idx === items.length - 1}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-25"
                  onClick={() => moveItem(idx, 1)}
                >
                  <ArrowDown className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Delete question"
                  className="flex size-6 items-center justify-center rounded text-destructive/80 hover:text-destructive"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
            <Input
              value={question}
              placeholder="Question"
              className="h-7 rounded bg-background px-2 text-xs font-medium"
              onChange={(e) => updateItem(idx, e.target.value, answer)}
            />
            <Textarea
              value={answer}
              placeholder="Answer..."
              rows={2}
              className="min-h-12 rounded bg-background p-1.5 text-xs"
              onChange={(e) => updateItem(idx, question, e.target.value)}
            />
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 w-full gap-1 text-xs font-normal"
        onClick={addItem}
      >
        <Plus className="size-3" />
        Add Question
      </Button>
    </div>
  )
}

function BlockForm({
  block,
  onChange,
}: {
  block: FolioBlock
  onChange: (patch: Partial<FolioBlock>) => void
}) {
  const type = block.type
  const fieldId = (name: string) => `${block.id}-${name}`

  const showEyebrow = [
    "hero",
    "about",
    "featured",
    "still",
    "cta",
    "contact",
    "features",
    "why",
    "reviews",
    "faq",
  ].includes(type)

  const showBody = type !== "skills" && type !== "partners"

  const showImage = ["hero", "about", "featured", "still", "features"].includes(
    type
  )

  const showCta1 = [
    "hero",
    "about",
    "featured",
    "still",
    "cta",
    "contact",
    "footer",
  ].includes(type)

  const showCta2 = ["hero", "cta", "contact"].includes(type)

  const showItems = [
    "skills",
    "partners",
    "features",
    "why",
    "reviews",
    "faq",
  ].includes(type)

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* 1. Heading Field */}
      <div className="flex flex-col gap-1">
        <label className={fieldLabelClass} htmlFor={fieldId("heading")}>
          {type === "hero"
            ? "Headline / Title"
            : type === "about"
              ? "About Heading"
              : type === "featured" || type === "still"
                ? "Project Title"
                : type === "cta" || type === "contact"
                  ? "CTA Headline"
                  : type === "footer"
                    ? "Footer Brand / Title"
                    : "Section Heading"}
        </label>
        <Input
          id={fieldId("heading")}
          value={block.heading ?? ""}
          placeholder="Heading text..."
          className="h-10 rounded-lg bg-background px-3 text-sm"
          onChange={(e) => onChange({ heading: e.target.value })}
        />
      </div>

      {/* 2. Eyebrow Field */}
      {showEyebrow ? (
        <div className="flex flex-col gap-1">
          <label className={fieldLabelClass} htmlFor={fieldId("eyebrow")}>
            {type === "hero"
              ? "Status line"
              : type === "featured" || type === "still"
                ? "Category / Discipline"
                : "Short label"}
          </label>
          <Input
            id={fieldId("eyebrow")}
            value={block.eyebrow ?? ""}
            placeholder={
              type === "hero"
                ? "e.g. Available for Q4 · Film Director"
                : type === "featured"
                  ? "e.g. Narrative Short Film"
                  : "Eyebrow text..."
            }
            className="h-10 rounded-lg bg-background px-3 text-sm"
            onChange={(e) => onChange({ eyebrow: e.target.value })}
          />
        </div>
      ) : null}

      {/* 3. Body Field */}
      {showBody ? (
        <div className="flex flex-col gap-1">
          <label className={fieldLabelClass} htmlFor={fieldId("body")}>
            {type === "hero"
              ? "Bio / Subtitle"
              : type === "about"
                ? "Full Bio / Statement"
                : type === "featured" || type === "still"
                  ? "Project Narrative / Description"
                  : "Body Copy"}
          </label>
          <Textarea
            id={fieldId("body")}
            value={block.body ?? ""}
            rows={type === "about" ? 4 : 2}
            placeholder="Write description or body text..."
            className="min-h-24 rounded-lg bg-background p-3 text-sm leading-relaxed"
            onChange={(e) => onChange({ body: e.target.value })}
          />
        </div>
      ) : null}

      {/* 4. Image URL + Uploader */}
      {showImage ? (
        <ImageField
          id={fieldId("image")}
          label={
            type === "about"
              ? "Portrait / Studio Photo"
              : type === "featured" || type === "still"
                ? "Project media"
                : "Image"
          }
          value={block.image}
          mediaKind={block.mediaKind}
          alt={block.imageAlt}
          onChange={(image) => onChange({ image })}
          onKindChange={(mediaKind) => onChange({ mediaKind })}
          onAltChange={(imageAlt) => onChange({ imageAlt })}
        />
      ) : null}

      {showCta1 || showCta2 ? (
        <details className="group border-t border-sidebar-border pt-3">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-lg px-1 text-sm font-medium tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring [&::-webkit-details-marker]:hidden">
            Links and actions
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-col gap-4 pt-3">
            {showCta1 ? (
              <div className="flex flex-col gap-2">
                <label
                  className={fieldLabelClass}
                  htmlFor={fieldId("cta-label")}
                >
                  Primary action
                </label>
                <Input
                  id={fieldId("cta-label")}
                  value={block.cta ?? ""}
                  placeholder="Button text"
                  className="h-10 rounded-lg bg-background px-3 text-sm"
                  onChange={(e) => onChange({ cta: e.target.value })}
                />
                <label
                  className={fieldLabelClass}
                  htmlFor={fieldId("cta-link")}
                >
                  Destination
                </label>
                <Input
                  id={fieldId("cta-link")}
                  value={block.ctaHref ?? ""}
                  placeholder="https://… or #contact"
                  className="h-10 rounded-lg bg-background px-3 text-sm"
                  onChange={(e) => onChange({ ctaHref: e.target.value })}
                />
              </div>
            ) : null}
            {showCta2 ? (
              <div className="flex flex-col gap-2 border-t border-sidebar-border pt-4">
                <label
                  className={fieldLabelClass}
                  htmlFor={fieldId("cta2-label")}
                >
                  Secondary action
                </label>
                <Input
                  id={fieldId("cta2-label")}
                  value={block.cta2 ?? ""}
                  placeholder="Button text"
                  className="h-10 rounded-lg bg-background px-3 text-sm"
                  onChange={(e) => onChange({ cta2: e.target.value })}
                />
                <label
                  className={fieldLabelClass}
                  htmlFor={fieldId("cta2-link")}
                >
                  Destination
                </label>
                <Input
                  id={fieldId("cta2-link")}
                  value={block.cta2Href ?? ""}
                  placeholder="https://… or #work"
                  className="h-10 rounded-lg bg-background px-3 text-sm"
                  onChange={(e) => onChange({ cta2Href: e.target.value })}
                />
              </div>
            ) : null}
          </div>
        </details>
      ) : null}

      {/* 7. Structured Items List Editor */}
      {showItems ? (
        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelClass}>
            {type === "skills"
              ? "Skills List"
              : type === "partners"
                ? "Partners / Collaborators"
                : type === "features"
                  ? "Feature Items"
                  : type === "why"
                    ? "Key Points / Why Us"
                    : type === "reviews"
                      ? "Testimonials / Reviews"
                      : type === "faq"
                        ? "Questions & Answers"
                        : "List Items"}
          </label>
          {type === "skills" || type === "partners" ? (
            <SkillsListEditor
              items={block.items ?? []}
              onChange={(items) => onChange({ items })}
            />
          ) : type === "features" || type === "why" ? (
            <FeaturesListEditor
              items={block.items ?? []}
              onChange={(items) => onChange({ items })}
            />
          ) : type === "reviews" ? (
            <ReviewsListEditor
              items={block.items ?? []}
              onChange={(items) => onChange({ items })}
            />
          ) : type === "faq" ? (
            <FaqListEditor
              items={block.items ?? []}
              onChange={(items) => onChange({ items })}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function BlockSidebar({
  draft,
  selectedId,
  onSelect,
  onBlocks,
}: {
  draft: Portfolio
  selectedId?: string
  inspectKind?: unknown
  onSelect: (id: string) => void
  onInspect?: unknown
  onBlocks: (blocks: FolioBlock[]) => void
}) {
  const blocks = draft.blocks ?? []
  const activeBlock =
    blocks.find((block) => block.id === selectedId) ?? blocks[0]

  function move(id: string, dir: -1 | 1) {
    const index = blocks.findIndex((block) => block.id === id)
    if (index === -1) return
    const next = index + dir
    if (next < 0 || next >= blocks.length) return
    const copy = [...blocks]
    const [item] = copy.splice(index, 1)
    copy.splice(next, 0, item)
    onBlocks(copy)
  }

  function duplicate(id: string) {
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    const copy = {
      ...block,
      id: `${block.type}-${Math.random().toString(36).slice(2, 8)}`,
    }
    const index = blocks.findIndex((b) => b.id === id)
    const next = [...blocks]
    next.splice(index + 1, 0, copy)
    onBlocks(next)
    onSelect(copy.id)
  }

  function remove(id: string) {
    if (blocks.length <= 1) return
    const index = blocks.findIndex((block) => block.id === id)
    const next = blocks.filter((block) => block.id !== id)
    onBlocks(next)
    if (id === activeBlock?.id) {
      onSelect(next[Math.min(index, next.length - 1)]?.id ?? "")
    }
  }

  function toggleHidden(id: string) {
    onBlocks(blocks.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b)))
  }

  function reset(id: string) {
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    onBlocks(
      blocks.map((b) =>
        b.id === id ? resetBlock(block, draft, draft.template) : b
      )
    )
  }

  function updateBlock(id: string, patch: Partial<FolioBlock>) {
    onBlocks(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col pb-3">
      <section className="shrink-0" aria-labelledby="page-outline-heading">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p
              id="page-outline-heading"
              className="text-xsm font-medium text-(--sidebar-muted)"
            >
              Page outline
            </p>
            <p className="text-xxs mt-0.5 text-muted-foreground">
              {blocks.length} {blocks.length === 1 ? "section" : "sections"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
                />
              }
            >
              <Plus className="size-3.5" />
              Add
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="afm-dashboard w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Portfolio sections</DropdownMenuLabel>
                {BLOCK_CATALOG.filter((item) =>
                  CORE_BLOCK_TYPES.has(item.type)
                ).map((item) => (
                  <DropdownMenuItem
                    key={item.type}
                    onClick={() => {
                      const fresh = createBlock(
                        item.type,
                        draft,
                        draft.template
                      )
                      onBlocks([...blocks, fresh])
                      onSelect(fresh.id)
                    }}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>More sections</DropdownMenuLabel>
                {BLOCK_CATALOG.filter(
                  (item) => !CORE_BLOCK_TYPES.has(item.type)
                ).map((item) => (
                  <DropdownMenuItem
                    key={item.type}
                    onClick={() => {
                      const fresh = createBlock(
                        item.type,
                        draft,
                        draft.template
                      )
                      onBlocks([...blocks, fresh])
                      onSelect(fresh.id)
                    }}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="afm-editor-scroll flex max-h-52 flex-col gap-1 overflow-y-auto pr-1">
          {blocks.map((block, index) => {
            const selected = block.id === selectedId
            return (
              <div
                key={block.id}
                className={cn(
                  "group/row relative flex h-11 min-w-0 items-center rounded-lg px-1 transition-colors",
                  selected
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/60"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(block.id)}
                  className="flex h-full min-w-0 flex-1 items-center rounded-md px-2 text-left text-sm tracking-tight focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                >
                  <span
                    className={cn(
                      "block truncate whitespace-nowrap",
                      selected && "font-medium",
                      block.hidden && "line-through opacity-40"
                    )}
                  >
                    {blockLabel(block.type)}
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        aria-label={`${blockLabel(block.type)} actions`}
                        className={cn(
                          actionClass,
                          "ml-1 opacity-60 group-hover/row:opacity-100 focus-visible:opacity-100 data-open:bg-sidebar-accent data-open:opacity-100"
                        )}
                      />
                    }
                  >
                    <MoreHorizontal className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="afm-dashboard w-40"
                  >
                    <DropdownMenuItem onClick={() => toggleHidden(block.id)}>
                      {block.hidden ? (
                        <Eye className="size-3.5" />
                      ) : (
                        <EyeOff className="size-3.5" />
                      )}
                      {block.hidden ? "Show" : "Hide"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={index === 0}
                      onClick={() => move(block.id, -1)}
                    >
                      <ChevronUp className="size-3.5" />
                      Move up
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={index === blocks.length - 1}
                      onClick={() => move(block.id, 1)}
                    >
                      <ChevronDown className="size-3.5" />
                      Move down
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicate(block.id)}>
                      <Copy className="size-3.5" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => reset(block.id)}>
                      <RotateCcw className="size-3.5" />
                      Reset
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={blocks.length <= 1}
                      variant="destructive"
                      onClick={() => remove(block.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
      </section>

      <section
        className="mt-4 flex min-h-0 flex-1 flex-col border-t border-sidebar-border pt-4"
        aria-labelledby="block-inspector-heading"
      >
        <div className="mb-3 shrink-0 px-1">
          <p className="text-xxs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Editing
          </p>
          <h2
            id="block-inspector-heading"
            className="mt-1 text-sm font-semibold tracking-tight"
          >
            {activeBlock ? blockLabel(activeBlock.type) : "No section selected"}
          </h2>
        </div>
        <div className="afm-editor-scroll min-h-0 flex-1 overflow-y-auto pr-2">
          {activeBlock ? (
            <BlockForm
              block={activeBlock}
              onChange={(patch) => updateBlock(activeBlock.id, patch)}
            />
          ) : (
            <p className="px-1 text-sm text-muted-foreground">
              Add a section to start editing this page.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
