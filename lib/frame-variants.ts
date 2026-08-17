/**
 * Five recasts of the Frame template. Every variant renders the identical
 * structure (nav, hero, 2:1 featured banner, filterable work grid, lightbox,
 * about, CTA, footer) so the onboarding content model never changes with the
 * choice — only type, palette, density and card treatment do.
 *
 * The palette/font/button values seed `portfolio.customization` when a student
 * picks a variant, so they stay editable afterwards. Everything a token cannot
 * carry (rule weight, measure, section rhythm, card chrome) lives in
 * `app/tastes.css` under `.taste-frame[data-variant="<id>"]`.
 */

export const FRAME_VARIANT_IDS = [
  "frame",
  "press",
  "void",
  "studio",
  "column",
] as const

export type FrameVariantId = (typeof FRAME_VARIANT_IDS)[number]

export type FrameVariant = {
  id: FrameVariantId
  name: string
  blurb: string
  /** Seeded into customization so the student can still tune it later. */
  accentColor: string
  backgroundColor: string
  textColor: string
  buttonStyle: "pill" | "square" | "outline"
  /** Shown on the picker card so the choice reads as typography, not colour. */
  typeNote: string
}

export const FRAME_VARIANTS: FrameVariant[] = [
  {
    id: "frame",
    name: "Frame",
    blurb: "Tight editorial archive. Hairline rules and one acid accent.",
    accentColor: "#DFFF45",
    backgroundColor: "#FFFFFF",
    textColor: "#111111",
    buttonStyle: "square",
    typeNote: "Georgia · Arial",
  },
  {
    id: "press",
    name: "Press",
    blurb: "Broadsheet weight. Heavy rules, wide measure, portrait plates.",
    accentColor: "#8C2F2F",
    backgroundColor: "#F7F4EE",
    textColor: "#14110F",
    buttonStyle: "square",
    typeNote: "Bodoni Moda · Archivo",
  },
  {
    id: "void",
    name: "Void",
    blurb: "A screening room. Stills carry the page against near-black.",
    accentColor: "#E8C97A",
    backgroundColor: "#0E0E10",
    textColor: "#F2EFE9",
    buttonStyle: "square",
    typeNote: "Gloock · Bricolage Grotesque",
  },
  {
    id: "studio",
    name: "Studio",
    blurb: "Modernist and airy. Sans display, panelled work, soft corners.",
    accentColor: "#B6512F",
    backgroundColor: "#F4F4F2",
    textColor: "#1B1B19",
    buttonStyle: "pill",
    typeNote: "Archivo · Inter",
  },
  {
    id: "column",
    name: "Column",
    blurb: "Reading first. Narrow measure, generous air, no card chrome.",
    accentColor: "#ECE7D9",
    backgroundColor: "#FFFFFF",
    textColor: "#16150F",
    buttonStyle: "outline",
    typeNote: "Libre Baskerville · Inter",
  },
]

export const DEFAULT_FRAME_VARIANT: FrameVariantId = "frame"

export function isFrameVariant(id?: string | null): id is FrameVariantId {
  return Boolean(id && (FRAME_VARIANT_IDS as readonly string[]).includes(id))
}

export function coerceFrameVariant(id?: string | null): FrameVariantId {
  return isFrameVariant(id) ? id : DEFAULT_FRAME_VARIANT
}

export function frameVariant(id?: string | null): FrameVariant {
  const wanted = coerceFrameVariant(id)
  return FRAME_VARIANTS.find((v) => v.id === wanted) ?? FRAME_VARIANTS[0]
}
