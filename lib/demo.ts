export type { TemplateId } from "@/lib/tastes"
export {
  TEMPLATES,
  coerceTemplate,
  isTemplateId,
  PROJECT_SRC,
} from "@/lib/tastes"
import type { TemplateId } from "@/lib/tastes"

export type BlockType =
  | "hero"
  | "still"
  | "skills"
  | "about"
  | "featured"
  | "contact"
  | "partners"
  | "features"
  | "why"
  | "reviews"
  | "faq"
  | "cta"
  | "footer"

export type ElementKind =
  "heading" | "text" | "image" | "list" | "button" | "button2" | "badge"

export type ElementStyle = {
  face: "sans" | "serif"
  size: number
  weight: "300" | "400" | "500" | "600"
  align: "start" | "center" | "end"
  italic: boolean
  uppercase: boolean
  tracking: number
  lineHeight?: number
  underline?: boolean
  color: string
  bg: string
  hoverBg: string
  buttonRadius?: number
  buttonPadX?: number
  buttonPadY?: number
  imageRadius?: number
  imageFit?: "cover" | "contain"
}

export type BlockLayout = {
  maxWidth: number
  align: "start" | "center" | "end"
  padT: number
  padR: number
  padB: number
  padL: number
  gap: number
}

export type FolioBlock = {
  id: string
  type: BlockType
  heading: string
  eyebrow?: string
  body: string
  image: string
  mediaKind?: "image" | "video"
  imageAlt?: string
  items: string[]
  itemIcons?: string[]
  cta: string
  ctaHref?: string
  cta2?: string
  cta2Href?: string
  hidden: boolean
  layout: BlockLayout
  headingStyle: ElementStyle
  bodyStyle: ElementStyle
  buttonStyle: ElementStyle
}

export type Portfolio = {
  slug: string
  name: string
  title: string
  school: string
  bio: string
  status: "live" | "draft"
  template: TemplateId
  project: { name: string; copy: string }
  skills: string[]
  blocks?: FolioBlock[]
  chrome?: {
    navLinks: { label: string; href: string }[]
    navCta: { label: string; href: string }
    footerColumns: { title: string; links: { label: string; href: string }[] }[]
  }
  media?: {
    headshot?: string
    stills: string[]
    clips: string[]
    filmLink?: string
  }
  seo?: { title: string; description: string; indexable: boolean }
  settings?: { email: string; showEmail: boolean; notifyViews: boolean }
}

export const PORTFOLIOS: Portfolio[] = [
  {
    slug: "talib",
    name: "Talib Khan",
    title: "Night path / Campus Connect",
    school: "AFM Student",
    bio: "I build web products for students and small teams. At AFM I focus on interfaces that stay calm under real content, and backends that stay boring on purpose.",
    status: "live",
    template: "frame",
    project: {
      name: "Campus Connect",
      copy: "A public directory where AFM students publish work and recruiters can filter by skill. I designed the data model, built the student pages, and shipped the first search.",
    },
    skills: ["TypeScript", "React", "Node.js", "SQL", "Figma"],
  },
  {
    slug: "studio-notes",
    name: "Studio notes",
    title: "Same preview page in this prototype",
    school: "AFM Student",
    bio: "A second page so the dashboard has more than one row. Open it to edit in place.",
    status: "draft",
    template: "aperture",
    project: {
      name: "Studio notes",
      copy: "A quiet page for process stills and short write-ups from studio weeks.",
    },
    skills: ["Figma", "Writing"],
  },
]

export function getPortfolio(slug: string) {
  return PORTFOLIOS.find((p) => p.slug === slug) ?? PORTFOLIOS[0]
}

export function getPortfolioExact(slug: string) {
  return PORTFOLIOS.find((portfolio) => portfolio.slug === slug) ?? null
}

export const USAGE = {
  visitors: 1284,
  visitorsHint: "Last 30 days, all live pages",
  storageUsedMb: 86,
  storageLimitMb: 500,
}

export const PORTRAIT_SRC =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80"

export const PEER_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&h=96&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=96&h=96&q=80",
]

/** Pipe-delimited demo copy for list-backed sections. Studio-peer quotes, not AFM claims. */
export function demoItems(type: BlockType, portfolio: Portfolio): string[] {
  if (type === "partners" || type === "skills") {
    const pad = ["TypeScript", "React", "Node.js", "SQL", "Figma"]
    const merged = [...portfolio.skills]
    for (const skill of pad) {
      if (merged.length >= 5) break
      if (!merged.includes(skill)) merged.push(skill)
    }
    return merged.slice(0, 5)
  }
  if (type === "features") {
    return [
      `${portfolio.project.name}|${portfolio.project.copy}`,
      "Typed interfaces|React and TypeScript so student pages stay calm under real copy.",
      `Search that ships|Filters by skill on the first ${portfolio.project.name} slice.`,
      "Studio notes|Short write-ups from class so the work is easy to follow.",
    ]
  }
  if (type === "why") {
    return [
      "Clear process|I share milestones before I write a line of code.",
      "Campus-first|Built around how AFM students actually publish work.",
      "Calm layouts|Pages that hold real bios and stills, not dummy lorem.",
      "Boring backends|SQL and Node so the product can stay up during critique week.",
    ]
  }
  if (type === "reviews") {
    return [
      `${portfolio.project.name} was easy to walk through in critique week.|Priya Shah|Studio peer, AFM`,
      "The skill filters matched how we actually talk in class.|Jonah Reed|Studio peer, AFM",
      "Quiet UI, honest copy. Easy to hand to a visiting mentor.|Lina Ortiz|Studio peer, AFM",
    ]
  }
  if (type === "faq") {
    return [
      `How do we start?|Send a short brief to ${portfolio.name.split(" ")[0]}. A page, a filter, or a small tool is enough.`,
      "What do you build?|Student-facing web products: directories, portfolios, and calm admin screens.",
      "How long do projects take?|A focused studio week for a first slice. Longer if the data model is new.",
      "Can you work with a team?|Yes. I pair with designers and other developers from class when the brief needs it.",
    ]
  }
  return []
}
