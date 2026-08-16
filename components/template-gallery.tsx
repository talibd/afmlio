"use client"

import * as React from "react"

import { FolioCanvas } from "@/components/folio-view"
import { PORTFOLIOS, TEMPLATES, type TemplateId } from "@/lib/demo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function TemplateThumb({ id }: { id: TemplateId }) {
  return (
    <div className="@container relative aspect-[4/3] overflow-hidden bg-[#c9b896]">
      <div className="pointer-events-none w-[1120px] origin-top-left [transform:scale(calc(100cqw/1120))]">
        <FolioCanvas portfolio={PORTFOLIOS[0]} template={id} />
      </div>
    </div>
  )
}

export function TemplateGallery({
  action = "use",
}: {
  action?: "use" | "pick"
}) {
  const [picked, setPicked] = React.useState<TemplateId>("walk")

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATES.map((t) => {
        const on = picked === t.id
        const body = (
          <>
            <TemplateThumb id={t.id} />
            <div className="flex flex-col gap-2 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium tracking-tight">{t.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {t.blurb}
                </p>
              </div>
              {action === "use" ? (
                <Button
                  variant="outline"
                  className="h-8 w-full px-3 text-xs font-normal"
                  render={<a href={`/edit/talib?template=${t.id}`} />}
                >
                  Use this taste
                </Button>
              ) : null}
            </div>
          </>
        )

        if (action === "pick") {
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(t.id)}
              className={cn(
                "overflow-hidden rounded-xl bg-card text-left transition-colors",
                on && "ring-1 ring-primary",
              )}
            >
              {body}
            </button>
          )
        }

        return (
          <div key={t.id} className="overflow-hidden rounded-xl bg-card">
            {body}
          </div>
        )
      })}
    </div>
  )
}
