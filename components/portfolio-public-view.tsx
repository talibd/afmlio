"use client"

import * as React from "react"
import { FolioView } from "@/components/folio-view"
import { coerceTemplate, type Portfolio } from "@/lib/demo"
import { resolvePublicPortfolio, hydrateDraft, subscribe } from "@/lib/portfolio-store"

export function PortfolioPublicView({
  slug,
  fallback,
  templateHint,
}: {
  slug: string
  fallback: Portfolio
  templateHint?: string
}) {
  const portfolio = React.useSyncExternalStore(
    (callback) =>
      subscribe((s) => {
        if (s === slug) callback()
      }),
    () => resolvePublicPortfolio(slug),
    () => fallback,
  )

  React.useEffect(() => {
    const seo = "seo" in portfolio ? (portfolio as { seo?: { title: string; description: string; indexable: boolean } }).seo : null
    if (seo) {
      document.title = seo.title
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement("meta")
        meta.setAttribute("name", "description")
        document.head.appendChild(meta)
      }
      meta.setAttribute("content", seo.description)
      let robots = document.querySelector('meta[name="robots"]')
      if (!robots) {
        robots = document.createElement("meta")
        robots.setAttribute("name", "robots")
        document.head.appendChild(robots)
      }
      robots.setAttribute(
        "content",
        seo.indexable ? "index,follow" : "noindex,nofollow",
      )
    }
  }, [portfolio])

  if (portfolio.status !== "live") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-medium">This page is not published yet.</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Open the editor and publish to make <code>/p/{slug}</code> live.
        </p>
        <a
          href={`/edit/${slug}`}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Open editor
        </a>
      </div>
    )
  }

  return (
    <FolioView
      portfolio={portfolio}
      template={coerceTemplate(templateHint ?? portfolio.template)}
    />
  )
}

/** Client loader for editor preview of draft. */
export function PortfolioDraftPreview({ slug, templateHint }: { slug: string; templateHint?: string }) {
  const hint = templateHint as import("@/lib/demo").TemplateId | undefined
  const draft = React.useMemo(() => hydrateDraft(slug, hint), [slug, hint])
  
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  
  if (!mounted) return null

  return <FolioView portfolio={draft} template={draft.template} />
}
