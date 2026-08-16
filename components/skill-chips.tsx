"use client"

import * as React from "react"
import {
  BarChart3,
  Code2,
  LineChart,
  MoreHorizontal,
  PenTool,
  Type,
} from "lucide-react"

import { cn } from "@/lib/utils"

const OPTIONS = [
  {
    id: "engineering",
    title: "Engineering",
    blurb: "Shipped products, code, and systems.",
    icon: Code2,
  },
  {
    id: "design",
    title: "Product design",
    blurb: "Interfaces, Figma, and student tools.",
    icon: PenTool,
  },
  {
    id: "data",
    title: "Data & analytics",
    blurb: "Models, dashboards, and insight.",
    icon: BarChart3,
  },
  {
    id: "writing",
    title: "Content & writing",
    blurb: "Case studies, essays, and process.",
    icon: Type,
  },
  {
    id: "markets",
    title: "Markets & research",
    blurb: "AFM work, finance, and analysis.",
    icon: LineChart,
  },
  {
    id: "else",
    title: "Something else",
    blurb: "I’ll name the skills on the page.",
    icon: MoreHorizontal,
  },
] as const

export function SkillChips() {
  const [picked, setPicked] = React.useState<string[]>(["engineering", "design"])

  function toggle(id: string) {
    setPicked((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {OPTIONS.map((opt) => {
        const on = picked.includes(opt.id)
        const Icon = opt.icon
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(opt.id)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl bg-card px-3 py-3 text-left transition-colors hover:bg-(--card-hover) md:pr-4",
              on && "ring-1 ring-primary"
            )}
          >
            <span className="flex items-center gap-3 overflow-hidden md:gap-4">
              <span className="flex size-11 items-center justify-center rounded-lg border bg-sidebar text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm tracking-tight">{opt.title}</span>
                <span className="truncate text-xs text-muted-foreground">{opt.blurb}</span>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
