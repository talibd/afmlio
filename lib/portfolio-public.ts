import "server-only"

import { and, eq } from "drizzle-orm"
import type { Metadata } from "next"

import { portfolios } from "@/db/schema"
import type { Portfolio } from "@/lib/demo"
import { db } from "@/lib/server/db"

export async function getPublishedPortfolio(slug: string): Promise<Portfolio | null> {
  const [record] = await db
    .select({ snapshot: portfolios.publishedSnapshot })
    .from(portfolios)
    .where(and(eq(portfolios.slug, slug), eq(portfolios.status, "published")))
    .limit(1)
  return record?.snapshot ? record.snapshot as unknown as Portfolio : null
}

export async function buildPublicMetadata(slug: string): Promise<Metadata> {
  const portfolio = await getPublishedPortfolio(slug)
  if (!portfolio) return { title: "Portfolio not found — AFM", robots: { index: false, follow: false } }
  const title = portfolio.seo?.title || `${portfolio.name} — Portfolio`
  const description = portfolio.seo?.description || portfolio.bio
  const indexable = portfolio.seo?.indexable ?? true
  return {
    title,
    description,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { title, description, type: "website" },
  }
}
