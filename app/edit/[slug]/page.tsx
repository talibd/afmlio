import type { Metadata } from "next"
import { PortfolioEditor } from "@/components/portfolio-editor"
import {
  coerceTemplate,
  getPortfolioExact,
  isTemplateId,
  type TemplateId,
} from "@/lib/demo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const portfolio = getPortfolioExact(slug)
  return { title: `Edit ${portfolio?.name ?? "portfolio"} — AFM` }
}

export default async function EditPortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ template?: string }>
}) {
  const { slug } = await params
  const { template } = await searchParams
  const portfolio = getPortfolioExact(slug)

  const hint = isTemplateId(template ?? "")
    ? (template as TemplateId)
    : template
      ? coerceTemplate(template)
      : undefined

  return (
    <PortfolioEditor
      key={`${slug}-${hint ?? portfolio?.template ?? "frame"}`}
      slug={slug}
      templateHint={hint}
    />
  )
}
