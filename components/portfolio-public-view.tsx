"use client"

import * as React from "react"
import Link from "next/link"

import { FolioView } from "@/components/folio-view"
import { Button } from "@/components/ui/button"
import { coerceTemplate, type Portfolio } from "@/lib/demo"
import { getOwnedPortfolioBySlug } from "@/lib/portfolio-api-client"

export function PortfolioDraftPreview({ slug, templateHint }: { slug: string; templateHint?: string }) {
  const [portfolio, setPortfolio] = React.useState<Portfolio | null>(null)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const controller = new AbortController()
    void getOwnedPortfolioBySlug(slug, controller.signal)
      .then((record) => setPortfolio(record.draftSnapshot as unknown as Portfolio))
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return
        setError(reason instanceof Error ? reason.message : "Could not load preview.")
      })
    return () => controller.abort()
  }, [slug])

  if (error) return <main className="afm-dashboard flex min-h-svh items-center justify-center p-6 text-center"><div className="max-w-md space-y-4"><h1 className="text-2xl font-semibold">Preview unavailable</h1><p className="text-sm text-muted-foreground">{error}</p><Button render={<Link href={`/edit/${slug}`} />}>Return to editor</Button></div></main>
  if (!portfolio) return <div className="min-h-svh animate-pulse bg-muted" aria-label="Loading portfolio preview" />
  return <FolioView portfolio={{ ...portfolio, slug }} template={coerceTemplate(templateHint ?? portfolio.template)} />
}
