"use client"

import * as React from "react"
import { Film, ImageIcon, Upload } from "lucide-react"
import { toast } from "sonner"

import { persistImageFile } from "@/lib/image-utils"
import type { StoredPortfolio } from "@/lib/portfolio-store"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function PortfolioMediaPanel({
  draft,
  onChange,
}: {
  draft: StoredPortfolio
  onChange: (patch: Partial<StoredPortfolio>) => void
}) {
  const headshotRef = React.useRef<HTMLInputElement>(null)
  const stillRef = React.useRef<HTMLInputElement>(null)

  async function pickHeadshot(file: File | undefined) {
    if (!file) return
    const dataUrl = await persistImageFile(file)
    if (!dataUrl) {
      toast.error("Image too large. Try a smaller file.")
      return
    }
    onChange({ media: { ...draft.media, headshot: dataUrl } })
    toast.success("Headshot saved")
  }

  async function addStill(file: File | undefined) {
    if (!file) return
    const dataUrl = await persistImageFile(file)
    if (!dataUrl) {
      toast.error("Image too large.")
      return
    }
    onChange({
      media: {
        ...draft.media,
        stills: [...draft.media.stills, dataUrl].slice(0, 8),
      },
    })
  }

  return (
    <div className="flex flex-col gap-3 border-b border-sidebar-border py-6">
      <p className="text-xsm text-(--sidebar-muted)">Media</p>
      <input
        ref={headshotRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          void pickHeadshot(e.target.files?.[0])
          e.target.value = ""
        }}
      />
      <input
        ref={stillRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          void addStill(e.target.files?.[0])
          e.target.value = ""
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="h-9 justify-start gap-2 text-xs font-normal"
        onClick={() => headshotRef.current?.click()}
      >
        <Upload className="size-3.5" />
        {draft.media.headshot ? "Replace headshot" : "Upload headshot"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-9 justify-start gap-2 text-xs font-normal"
        onClick={() => stillRef.current?.click()}
      >
        <ImageIcon className="size-3.5" />
        Add still ({draft.media.stills.length})
      </Button>
      <Field>
        <FieldLabel htmlFor="film-link">Film / video link</FieldLabel>
        <Input
          id="film-link"
          placeholder="YouTube, Vimeo, or embed URL"
          value={draft.media.filmLink ?? ""}
          onChange={(e) =>
            onChange({
              media: { ...draft.media, filmLink: e.target.value || undefined },
            })
          }
        />
      </Field>
      {draft.media.filmLink ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Film className="size-3.5" />
          Shown on your portfolio when published
        </p>
      ) : null}
    </div>
  )
}
