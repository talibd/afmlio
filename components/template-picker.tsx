"use client"

import { TEMPLATES, type TemplateId } from "@/lib/demo"
import { cn } from "@/lib/utils"

export function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateId
  onChange: (id: TemplateId) => void
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-sidebar-border py-6">
      <p className="text-xsm text-(--sidebar-muted)">Taste</p>
      <div className="flex flex-col gap-1">
        {TEMPLATES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-left text-[13px] tracking-tight transition-colors hover:bg-sidebar-accent",
              value === item.id && "bg-sidebar-accent font-medium",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  )
}
