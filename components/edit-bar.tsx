"use client"

import * as React from "react"
import {
  ImageIcon,
  MousePointer2,
  Type,
  LayoutTemplate,
  ArrowUp,
} from "lucide-react"
import { toast } from "sonner"

import { TEMPLATES, type TemplateId } from "@/lib/demo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function EditBar({
  template,
  onTemplate,
}: {
  template: TemplateId
  onTemplate: (id: TemplateId) => void
}) {
  const lastImage = React.useRef<HTMLImageElement | null>(null)

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      const t = e.target
      if (t instanceof HTMLImageElement && t.dataset.image !== undefined) {
        lastImage.current = t
      }
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  function pickImage() {
    const target =
      lastImage.current ?? document.querySelector<HTMLImageElement>("[data-image]")
    if (!target) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      target.src = URL.createObjectURL(file)
    }
    input.click()
  }

  function editText() {
    const el = document.querySelector<HTMLElement>("[data-edit]")
    el?.click()
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center">
      <div
        className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-lg"
        role="toolbar"
        aria-label="Content edits"
      >
        <Tool label="Select" pressed>
          <MousePointer2 />
        </Tool>
        <Tool label="Image" onClick={pickImage}>
          <ImageIcon />
        </Tool>
        <Tool label="Text" onClick={editText}>
          <Type />
        </Tool>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex min-w-9 flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:min-w-14"
              />
            }
          >
            <LayoutTemplate className="size-4" />
            <span className="hidden sm:inline">Taste</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="center">
            {TEMPLATES.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => onTemplate(t.id)}
                className={cn(t.id === template && "font-medium")}
              >
                {t.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="sm"
          className="ml-0.5 rounded-full"
          onClick={() => toast.success("Published. Live now.")}
        >
          <ArrowUp data-icon="inline-start" />
          Publish
        </Button>
      </div>
    </div>
  )
}

function Tool({
  label,
  children,
  pressed,
  onClick,
}: {
  label: string
  children: React.ReactNode
  pressed?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-w-9 flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:min-w-14",
        pressed && "bg-muted text-foreground"
      )}
    >
      <span className="[&_svg]:size-4">{children}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
