export const TASTE_IDS = [
  "frame",
  "walk",
  "ground",
  "aperture",
  "folio",
  "flood",
] as const

export type TemplateId = (typeof TASTE_IDS)[number]

const LEGACY: Record<string, TemplateId> = {
  developer: "flood",
  creative: "folio",
  professional: "walk",
  sides: "walk",
  "light-table": "aperture",
  "pin-up": "ground",
  dailies: "flood",
  zine: "folio",
}

export function coerceTemplate(id?: string | null): TemplateId {
  if (id && (TASTE_IDS as readonly string[]).includes(id))
    return id as TemplateId
  if (id && LEGACY[id]) return LEGACY[id]
  return "frame"
}

export function isTemplateId(id: string): id is TemplateId {
  return (TASTE_IDS as readonly string[]).includes(id)
}

export const TEMPLATES: {
  id: TemplateId
  name: string
  blurb: string
}[] = [
  {
    id: "frame",
    name: "Frame",
    blurb:
      "Editorial AI archive. Clean grid, category filters, and electric accents.",
  },
  {
    id: "walk",
    name: "Walk",
    blurb: "A suite of rooms. The still is the first wall.",
  },
  {
    id: "ground",
    name: "Ground",
    blurb: "You stand in the picture. Pieces are chapters of the land.",
  },
  {
    id: "aperture",
    name: "Aperture",
    blurb: "A rounded window into the work. Type lives in the glass.",
  },
  {
    id: "folio",
    name: "Folio",
    blurb: "A magazine spread. The name is architecture on the still.",
  },
  {
    id: "flood",
    name: "Flood",
    blurb: "Each piece owns a color field. The page is the room.",
  },
]

export type StudentPiece = {
  src: string
  mediaKind?: "image" | "video"
  title: string
  slug: string
  note: string
  category?: string
}

/** Synthetic student pieces for empty folios. Labeled in the UI. */
export const STUDENT_WORK: StudentPiece[] = [
  {
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=90",
    title: "After Tomorrow",
    slug: "AI FILM · 04:18",
    note: "AI short film · 04:18",
    category: "film",
  },
  {
    src: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=90",
    title: "Maison Noire",
    slug: "Luxury campaign · 00:45",
    note: "Luxury campaign · 00:45",
    category: "ad",
  },
  {
    src: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=90",
    title: "Synthetic Nature",
    slug: "Generative image series",
    note: "Generative image series",
    category: "graphic",
  },
  {
    src: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=90",
    title: "Human / Machine",
    slug: "Editorial visual series",
    note: "Editorial visual series",
    category: "graphic",
  },
  {
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=90",
    title: "Parallel",
    slug: "Concept film · 02:40",
    note: "Concept film · 02:40",
    category: "film",
  },
  {
    src: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=90",
    title: "Future Product",
    slug: "Product campaign · 00:30",
    note: "Product campaign · 00:30",
    category: "ad",
  },
]

export const PROJECT_SRC: Record<TemplateId, string> = {
  frame:
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1800&q=90",
  walk: STUDENT_WORK[0].src,
  ground: STUDENT_WORK[5].src,
  aperture: STUDENT_WORK[1].src,
  folio: STUDENT_WORK[2].src,
  flood: STUDENT_WORK[4].src,
}
