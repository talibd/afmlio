"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { StoredPortfolio } from "@/lib/portfolio-store"

function linksToText(
  links: { label: string; href: string }[],
): string {
  return links.map((l) => `${l.label}|${l.href}`).join("\n")
}

function textToLinks(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((p) => p.trim())
      return { label: label || "Link", href: href || "#" }
    })
}

export function PortfolioChromePanel({
  draft,
  onChange,
}: {
  draft: StoredPortfolio
  onChange: (patch: Partial<StoredPortfolio>) => void
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-sidebar-border py-6">
      <p className="text-xsm text-(--sidebar-muted)">Navigation & footer</p>
      <Field>
        <FieldLabel htmlFor="nav-links">Nav links (label|href per line)</FieldLabel>
        <Textarea
          id="nav-links"
          rows={4}
          defaultValue={linksToText(draft.chrome.navLinks)}
          onBlur={(e) =>
            onChange({
              chrome: {
                ...draft.chrome,
                navLinks: textToLinks(e.target.value),
              },
            })
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="nav-cta">Nav CTA (label|href)</FieldLabel>
        <Textarea
          id="nav-cta"
          rows={1}
          defaultValue={`${draft.chrome.navCta.label}|${draft.chrome.navCta.href}`}
          onBlur={(e) => {
            const [label, href] = e.target.value.split("|").map((p) => p.trim())
            onChange({
              chrome: {
                ...draft.chrome,
                navCta: { label: label || "Contact", href: href || "#cta" },
              },
            })
          }}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="footer-cols">Footer columns (title then label|href lines, blank line between columns)</FieldLabel>
        <Textarea
          id="footer-cols"
          rows={8}
          defaultValue={draft.chrome.footerColumns
            .map((col) =>
              [col.title, ...col.links.map((l) => `${l.label}|${l.href}`)].join(
                "\n",
              ),
            )
            .join("\n\n")}
          onBlur={(e) => {
            const columns = e.target.value
              .split(/\n\s*\n/)
              .map((chunk) => {
                const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean)
                const title = lines.shift() ?? "Links"
                return {
                  title,
                  links: textToLinks(lines.join("\n")),
                }
              })
              .filter((col) => col.links.length)
            onChange({
              chrome: { ...draft.chrome, footerColumns: columns },
            })
          }}
        />
      </Field>
    </div>
  )
}
