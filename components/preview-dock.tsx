"use client"

import * as React from "react"
import {
  ChevronsUpDown,
  ExternalLink,
  Monitor,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react"
import { toast } from "sonner"

import { blockLabel } from "@/lib/blocks"
import type { FolioBlock } from "@/lib/demo"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type PreviewSize = "desktop" | "tablet" | "mobile"

const sizes: { id: PreviewSize; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Phone", icon: Smartphone },
]

export const PREVIEW_WIDTH: Record<PreviewSize, string> = {
  desktop: "w-full",
  tablet: "mx-auto w-full max-w-[768px] ring-1 ring-black/10",
  mobile: "mx-auto w-full max-w-[390px] ring-1 ring-black/10",
}

export function PreviewDock({
  size,
  onSize,
  blocks,
  selectedId,
  onSelectElement,
  seoTitle,
  seoDescription,
  onSeoTitle,
  onSeoDescription,
  indexable,
  onIndexable,
  onPublish,
  onSaveDraft,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  publicUrl,
  dirty,
  savedAt,
  liveAt,
}: {
  size: PreviewSize
  onSize: (size: PreviewSize) => void
  blocks: FolioBlock[]
  selectedId: string
  onSelectElement: (id: string) => void
  seoTitle: string
  seoDescription: string
  onSeoTitle: (value: string) => void
  onSeoDescription: (value: string) => void
  indexable: boolean
  onIndexable: (value: boolean) => void
  onPublish: () => void
  onSaveDraft: () => void
  onUndo: () => boolean
  onRedo: () => boolean
  canUndo: boolean
  canRedo: boolean
  publicUrl: string
  dirty: boolean
  savedAt: number | null
  liveAt: number | null
}) {
  const selected = blocks.find((block) => block.id === selectedId)
  const [seoOpen, setSeoOpen] = React.useState(false)
  const [pickOpen, setPickOpen] = React.useState(false)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-2 sm:bottom-5 sm:px-3">
      <div className="pointer-events-auto relative max-w-[calc(100vw-1rem)]">
        {seoOpen ? (
          <div className="absolute right-0 bottom-[calc(100%+12px)] w-[min(calc(100vw-2rem),20rem)] rounded-xl border bg-background p-4 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.4)]">
            <p className="text-sm font-medium tracking-tight">Search listing</p>
            <div className="mt-4 flex flex-col gap-3">
              <Field>
                <FieldLabel htmlFor="seo-title">Page title</FieldLabel>
                <Input
                  id="seo-title"
                  value={seoTitle}
                  onChange={(e) => onSeoTitle(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="seo-desc">Description</FieldLabel>
                <Textarea
                  id="seo-desc"
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => onSeoDescription(e.target.value)}
                />
              </Field>
              <div className="flex items-center justify-between gap-3 py-1">
                <p className="text-sm tracking-tight">Allow search indexing</p>
                <Switch checked={indexable} onCheckedChange={onIndexable} />
              </div>
            </div>
          </div>
        ) : null}
        {pickOpen ? (
          <div className="absolute bottom-[calc(100%+12px)] left-0 max-h-48 w-52 overflow-y-auto rounded-xl border bg-background py-1 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.4)]">
            {blocks.map((block) => (
              <button
                key={block.id}
                type="button"
                className={cn(
                  "flex w-full px-3 py-2 text-left text-sm tracking-tight hover:bg-secondary",
                  block.id === selectedId && "font-medium",
                  block.hidden && "opacity-50",
                )}
                onClick={() => {
                  onSelectElement(block.id)
                  setPickOpen(false)
                  setSeoOpen(false)
                }}
              >
                {blockLabel(block.type)}
              </button>
            ))}
          </div>
        ) : null}
        <div
          className="flex max-w-full flex-wrap items-center gap-1 rounded-xl border bg-background px-1.5 py-1 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.4)] sm:gap-2 sm:px-2 sm:h-12"
          role="toolbar"
          aria-label="Preview and publish"
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="Undo"
                  disabled={!canUndo}
                  onClick={() => onUndo()}
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30"
                />
              }
            >
              <Undo2 className="size-4" strokeWidth={1.5} />
            </TooltipTrigger>
            <TooltipContent side="top">Undo (⌘Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="Redo"
                  disabled={!canRedo}
                  onClick={() => onRedo()}
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30"
                />
              }
            >
              <Redo2 className="size-4" strokeWidth={1.5} />
            </TooltipTrigger>
            <TooltipContent side="top">Redo (⌘⇧Z)</TooltipContent>
          </Tooltip>
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <button
            type="button"
            aria-expanded={pickOpen}
            onClick={() => {
              setPickOpen((open) => !open)
              setSeoOpen(false)
            }}
            className="flex h-8 max-w-28 items-center gap-1 rounded-lg px-2 text-[13px] tracking-tight text-muted-foreground hover:bg-secondary hover:text-foreground sm:max-w-36"
          >
            <span className="truncate">
              {selected ? blockLabel(selected.type) : "Jump to"}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0" />
          </button>
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <div className="hidden items-center rounded-lg bg-secondary p-0.5 sm:flex">
            {sizes.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label={item.label}
                      aria-pressed={size === item.id}
                      onClick={() => onSize(item.id)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
                        size === item.id &&
                          "bg-background text-foreground shadow-sm",
                      )}
                    />
                  }
                >
                  <item.icon className="size-4" strokeWidth={1.5} />
                </TooltipTrigger>
                <TooltipContent side="top">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <button
            type="button"
            aria-pressed={seoOpen}
            onClick={() => {
              setSeoOpen((open) => !open)
              setPickOpen(false)
            }}
            className={cn(
              "h-8 rounded-lg px-2.5 text-[13px] tracking-tight text-muted-foreground hover:bg-secondary hover:text-foreground",
              seoOpen && "bg-secondary text-foreground",
            )}
          >
            SEO
          </button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden h-8 rounded-lg px-2.5 text-[13px] font-normal sm:inline-flex"
            onClick={() => {
              onSaveDraft()
              toast.success("Draft saved")
            }}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg px-2 text-[13px] font-normal"
            render={<a href={publicUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink className="size-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-lg px-3 text-[13px] font-medium"
            onClick={onPublish}
          >
            Publish
          </Button>
        </div>
        <p className="mt-1 hidden text-center text-[10px] text-muted-foreground sm:block">
          {dirty ? "Draft has unpublished changes" : "Draft matches live"}
          {savedAt ? ` · Autosaved` : ""}
          {liveAt ? ` · Live ${new Date(liveAt).toLocaleDateString()}` : ""}
        </p>
      </div>
    </div>
  )
}
