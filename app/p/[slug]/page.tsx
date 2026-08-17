import { notFound, redirect } from "next/navigation"

import { FolioView } from "@/components/folio-view"
import { PortfolioDraftPreview } from "@/components/portfolio-public-view"
import { coerceTemplate } from "@/lib/demo"
import { buildPublicMetadata, getPublishedPortfolio } from "@/lib/portfolio-public"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
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
  const query = await searchParams

  if (query.edit === "1") redirect(`/edit/${slug}`)
  if (query.preview === "1") return <PortfolioDraftPreview slug={slug} templateHint={query.template} />

  const portfolio = await getPublishedPortfolio(slug)
  if (!portfolio) notFound()
  return <FolioView portfolio={portfolio} template={coerceTemplate(portfolio.template)} />
}
