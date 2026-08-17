"use client"

import * as React from "react"

import type { PortfolioSummary } from "@/lib/portfolio-store"

type ApiPortfolio = {
  slug: string
  name: string
  status: "draft" | "published"
  updatedAt: string
}

export function usePortfolioSummaries() {
  const [portfolios, setPortfolios] = React.useState<PortfolioSummary[]>([])

  React.useEffect(() => {
    const controller = new AbortController()
    fetch("/api/portfolios", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load portfolios")
        return response.json() as Promise<{ portfolios: ApiPortfolio[] }>
      })
      .then(({ portfolios: records }) => {
        setPortfolios(
          records.map((portfolio) => ({
            slug: portfolio.slug,
            name: portfolio.name,
            title: "Frame portfolio",
            status: portfolio.status === "published" ? "live" : "draft",
            updatedAt: new Date(portfolio.updatedAt).getTime(),
          }))
        )
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setPortfolios([])
      })
    return () => controller.abort()
  }, [])

  return portfolios
}
