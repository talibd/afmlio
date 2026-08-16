"use client"

import { TasteFolio } from "@/components/taste-folio"
import {
  coerceTemplate,
  type ElementKind,
  type Portfolio,
  type TemplateId,
} from "@/lib/demo"
import type { PortfolioChrome } from "@/lib/portfolio-store"

export function FolioCanvas({
  portfolio,
  template,
  selectedId,
  selectedKind,
  onSelectBlock,
  onSelectElement,
  onBlockKeySelect,
}: {
  portfolio: Portfolio & { chrome?: PortfolioChrome; media?: { filmLink?: string } }
  template: TemplateId
  edit?: boolean
  selectedId?: string
  selectedKind?: ElementKind | null
  onSelectBlock?: (id: string) => void
  onSelectElement?: (id: string, kind: ElementKind) => void
  onBlockKeySelect?: (id: string) => void
}) {
  return (
    <TasteFolio
      portfolio={portfolio}
      template={coerceTemplate(template)}
      selectedId={selectedId}
      selectedKind={selectedKind}
      onSelectBlock={onSelectBlock}
      onSelectElement={onSelectElement}
      onBlockKeySelect={onBlockKeySelect}
    />
  )
}

export function FolioView({
  portfolio,
  template: initial,
}: {
  portfolio: Portfolio & { chrome?: PortfolioChrome; media?: { filmLink?: string } }
  template?: TemplateId
}) {
  const template = coerceTemplate(initial ?? portfolio.template)
  return (
    <div className="min-h-svh">
      <TasteFolio portfolio={portfolio} template={template} />
    </div>
  )
}
