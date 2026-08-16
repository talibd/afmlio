import { redirect } from "next/navigation"

import { PortfolioPublicView, PortfolioDraftPreview } from "@/components/portfolio-public-view"
import { buildPublicMetadata, demoPortfolio } from "@/lib/portfolio-public"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return buildPublicMetadata(slug)
}

export default async function PortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ edit?: string; template?: string; preview?: string }>
}) {
  const { slug } = await params
  const q = await searchParams

  if (q.edit === "1") {
    const query = q.template ? `?template=${q.template}` : ""
    redirect(`/edit/${slug}${query}`)
  }

  if (q.preview === "1") {
    return <PortfolioDraftPreview slug={slug} templateHint={q.template} />
  }

  const fallback = demoPortfolio(slug)

  return (
    <PortfolioPublicView
      slug={slug}
      fallback={fallback}
      templateHint={q.template}
    />
  )
}
