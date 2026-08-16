import type { Metadata } from "next"
import { cookies } from "next/headers"

import { getPortfolio, type Portfolio } from "@/lib/demo"
import type { PortfolioSeo } from "@/lib/portfolio-store"

const SEO_COOKIE = (slug: string) => `afm_seo_${slug}`

export async function getPublishedSeo(slug: string): Promise<PortfolioSeo | null> {
  try {
    const jar = await cookies()
    const raw = jar.get(SEO_COOKIE(slug))?.value
    if (!raw) return null
    return JSON.parse(decodeURIComponent(raw)) as PortfolioSeo
  } catch {
    return null
  }
}

export async function buildPublicMetadata(slug: string): Promise<Metadata> {
  const demo = getPortfolio(slug)
  const seo = await getPublishedSeo(slug)
  const title = seo?.title ?? `${demo.name} — AFM Student`
  const description = seo?.description ?? demo.bio
  const indexable = seo?.indexable ?? true
  return {
    title,
    description,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  }
}

export function demoPortfolio(slug: string): Portfolio {
  return getPortfolio(slug)
}
