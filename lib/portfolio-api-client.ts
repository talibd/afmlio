import type { StoredPortfolio } from "@/lib/portfolio-store"

export type PortfolioRecordDto = {
  id: string
  slug: string
  name: string
  template: string
  status: "draft" | "published"
  draftSnapshot: Record<string, unknown>
  publishedSnapshot: Record<string, unknown> | null
  publishedAt: string | null
  updatedAt: string
}

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null) as {
    error?: string | { message?: string }
  } | null
  if (typeof body?.error === "string") return body.error
  return body?.error?.message ?? fallback
}

export async function getOwnedPortfolioBySlug(slug: string, signal?: AbortSignal) {
  const list = await fetch("/api/portfolios", { cache: "no-store", signal })
  if (!list.ok) throw new Error(await readError(list, "Could not load portfolios."))
  const { portfolios } = await list.json() as { portfolios: Array<{ id: string; slug: string }> }
  const summary = portfolios.find((portfolio) => portfolio.slug === slug)
  if (!summary) throw new Error("Portfolio not found.")
  const response = await fetch(`/api/portfolios/${encodeURIComponent(summary.id)}`, { cache: "no-store", signal })
  if (!response.ok) throw new Error(await readError(response, "Could not load this portfolio."))
  return (await response.json() as { portfolio: PortfolioRecordDto }).portfolio
}

export async function savePortfolioDraft(id: string, draft: StoredPortfolio) {
  const response = await fetch(`/api/portfolios/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: draft.name, slug: draft.slug, draftSnapshot: draft }),
  })
  if (!response.ok) throw new Error(await readError(response, "Could not save your changes."))
  return (await response.json() as { portfolio: PortfolioRecordDto }).portfolio
}

export async function publishPortfolio(id: string) {
  const response = await fetch(`/api/portfolios/${encodeURIComponent(id)}/publish`, { method: "POST" })
  if (!response.ok) throw new Error(await readError(response, "Could not publish your portfolio."))
  return (await response.json() as { portfolio: PortfolioRecordDto }).portfolio
}
