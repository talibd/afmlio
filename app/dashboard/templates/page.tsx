import type { Metadata } from "next"

import { TemplateGallery } from "@/components/template-gallery"

export const metadata: Metadata = { title: "Tastes — AFM" }

export default function TemplatesPage() {
  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-10 overflow-y-auto p-4 md:gap-11 md:p-8">
      <div className="flex flex-col md:gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Tastes</h1>
        <p className="text-muted-foreground">
          Pick a visual world. Your work stays the same.
        </p>
      </div>
      <TemplateGallery />
    </div>
  )
}
