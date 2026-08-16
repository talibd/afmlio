import { defaultStyle } from "@/lib/elements"
import {
  PORTRAIT_SRC,
  PROJECT_SRC,
  demoItems,
  type BlockLayout,
  type BlockType,
  type FolioBlock,
  type Portfolio,
  type TemplateId,
} from "@/lib/demo"

export const BLOCK_CATALOG: { type: BlockType; label: string }[] = [
  { type: "featured", label: "Project" },
  { type: "still", label: "Image" },
  { type: "skills", label: "Skills" },
  { type: "about", label: "About" },
  { type: "contact", label: "Contact" },
  { type: "hero", label: "Introduction" },
  { type: "features", label: "Project collection" },
  { type: "partners", label: "Collaborators" },
  { type: "why", label: "Process" },
  { type: "reviews", label: "Testimonials" },
  { type: "faq", label: "Questions" },
  { type: "cta", label: "Closing message" },
  { type: "footer", label: "Footer" },
]

const DEFAULT_ORDER: BlockType[] = ["featured", "still", "about", "contact"]

const CENTERED: BlockType[] = ["partners", "features", "why", "reviews"]

export function blockLabel(type: BlockType) {
  return BLOCK_CATALOG.find((item) => item.type === type)?.label ?? type
}

function nid(type: BlockType) {
  return `${type}-${Math.random().toString(36).slice(2, 8)}`
}

export function defaultLayout(
  _template: TemplateId,
  type: BlockType
): BlockLayout {
  return {
    maxWidth: 1120,
    align: CENTERED.includes(type) ? "center" : "start",
    padT:
      type === "partners"
        ? 40
        : type === "hero"
          ? 80
          : type === "footer"
            ? 48
            : 72,
    padR: 40,
    padB:
      type === "partners"
        ? 40
        : type === "hero"
          ? 80
          : type === "footer"
            ? 48
            : 72,
    padL: 40,
    gap: type === "hero" ? 24 : 20,
  }
}

export function layoutOf(block: FolioBlock): BlockLayout {
  return block.layout ?? defaultLayout("walk", block.type)
}

function chrome(template: TemplateId, type: BlockType) {
  const ink = template === "walk" || template === "flood"
  const display =
    type === "hero" || type === "about" || type === "featured" || type === "cta"
  const cta =
    type === "hero"
      ? "Get in touch"
      : type === "cta"
        ? "Get started"
        : type === "footer"
          ? "Talk to us"
          : type === "contact"
            ? "Get in touch"
            : type === "about"
              ? "Say hi"
              : ""
  return {
    hidden: false,
    layout: defaultLayout(template, type),
    cta,
    ctaHref:
      type === "hero" || type === "cta" || type === "contact"
        ? "#cta"
        : type === "about"
          ? "#cta"
          : type === "footer"
            ? "mailto:"
            : undefined,
    cta2: type === "hero" ? "See the work" : undefined,
    cta2Href: type === "hero" ? "#features" : undefined,
    headingStyle: defaultStyle({
      face: "serif",
      size: type === "about" ? 88 : type === "cta" ? 40 : display ? 56 : 32,
      tracking: -2,
      weight: "400",
    }),
    bodyStyle: defaultStyle({
      size: 15,
      weight: "400",
      tracking: 0.2,
      color:
        ink || type === "contact" || type === "cta" ? "#a3a3a3" : "#737373",
    }),
    buttonStyle: defaultStyle({
      size: 14,
      weight: "500",
      color:
        ink && type !== "contact" && type !== "cta" ? "#111111" : "#ffffff",
      bg: ink && type !== "contact" && type !== "cta" ? "#ffffff" : "#111111",
      hoverBg: "#3d4a28",
    }),
  }
}

function seed(
  type: BlockType,
  portfolio: Portfolio,
  template: TemplateId,
  extra: Partial<FolioBlock>
): FolioBlock {
  return {
    id: nid(type),
    type,
    heading: extra.heading ?? "",
    body: extra.body ?? "",
    image: extra.image ?? PROJECT_SRC[template],
    items: extra.items ?? demoItems(type, portfolio),
    ...chrome(template, type),
    ...extra,
  }
}

export function createBlock(
  type: BlockType,
  portfolio: Portfolio,
  template: TemplateId = portfolio.template
): FolioBlock {
  const image = type === "about" ? PORTRAIT_SRC : PROJECT_SRC[template]
  if (type === "hero") {
    return seed(type, portfolio, template, {
      heading: portfolio.title,
      body: portfolio.bio,
      image,
      items: [],
    })
  }
  if (type === "still") {
    return seed(type, portfolio, template, {
      heading: portfolio.project.name,
      body: portfolio.project.copy,
      image,
      items: [],
    })
  }
  if (type === "skills" || type === "partners") {
    return seed(type, portfolio, template, {
      heading:
        type === "partners"
          ? "Trusted by the stack I actually ship with."
          : "Skills",
      body: "",
      image,
    })
  }
  if (type === "about") {
    return seed(type, portfolio, template, {
      heading: "Hi.",
      body: portfolio.bio,
      image,
      items: [],
    })
  }
  if (type === "featured" || type === "features") {
    return seed(type, portfolio, template, {
      heading:
        type === "features" ? "What I ship in studio" : portfolio.project.name,
      body:
        type === "features" ? portfolio.project.copy : portfolio.project.copy,
      image,
      items: type === "features" ? demoItems("features", portfolio) : [],
    })
  }
  if (type === "why") {
    return seed(type, portfolio, template, {
      heading: "Why work with me",
      body: "How I run a student brief from first note to a page you can send.",
      image,
    })
  }
  if (type === "reviews") {
    return seed(type, portfolio, template, {
      heading: "Notes from studio peers",
      body: "Quotes from classmates after critique — not AFM or recruiter claims.",
      image,
    })
  }
  if (type === "faq") {
    return seed(type, portfolio, template, {
      heading: "Questions before we start",
      body: "Short answers about working together on a student project.",
      image,
    })
  }
  if (type === "cta") {
    return seed(type, portfolio, template, {
      heading: "Have a brief? Let’s talk.",
      body: "Send a note and I’ll reply with next steps for a first slice.",
      image,
      items: [],
    })
  }
  if (type === "footer") {
    return seed(type, portfolio, template, {
      heading: portfolio.name,
      body: portfolio.bio,
      image,
      items: ["Essential", "Social", "Legal"],
    })
  }
  return seed("contact", portfolio, template, {
    type: "contact",
    heading: portfolio.name,
    body: portfolio.title,
    image,
    items: [],
  })
}

export function defaultBlocks(
  portfolio: Portfolio,
  template: TemplateId = portfolio.template
): FolioBlock[] {
  return DEFAULT_ORDER.map((type, index) => ({
    ...createBlock(type, portfolio, template),
    id: `${type}-${index}`,
  }))
}

const LANDING_TYPES = new Set<BlockType>([
  "partners",
  "features",
  "why",
  "reviews",
  "faq",
  "cta",
  "footer",
])

/** Landing-page snapshots — replaced by work-first taste templates. */
export function isStaleLayout(blocks?: FolioBlock[]): boolean {
  if (!blocks?.length) return true
  const WORK_TYPES = new Set<BlockType>([
    "hero",
    "still",
    "about",
    "featured",
    "contact",
    "skills",
  ])
  const hasWorkType = blocks.some((block) => WORK_TYPES.has(block.type))
  return !hasWorkType && blocks.every((block) => LANDING_TYPES.has(block.type))
}

export function blocksOf(
  portfolio: Portfolio,
  template?: TemplateId
): FolioBlock[] {
  const next = template ?? portfolio.template
  if (isStaleLayout(portfolio.blocks)) {
    return defaultBlocks(portfolio, next)
  }
  return portfolio.blocks as FolioBlock[]
}

/** Re-apply template chrome/styles while keeping user copy. */
export function reapplyTemplateChrome(
  blocks: FolioBlock[],
  portfolio: Portfolio,
  template: TemplateId
): FolioBlock[] {
  return blocks.map((block) => {
    const fresh = createBlock(block.type, portfolio, template)
    return {
      ...fresh,
      id: block.id,
      heading: block.heading,
      body: block.body,
      image: block.image,
      mediaKind: block.mediaKind,
      imageAlt: block.imageAlt,
      items: block.items,
      itemIcons: block.itemIcons,
      cta: block.cta,
      ctaHref: block.ctaHref ?? fresh.ctaHref,
      cta2: block.cta2,
      cta2Href: block.cta2Href ?? fresh.cta2Href,
      hidden: block.hidden,
    }
  })
}

export function resetBlock(
  block: FolioBlock,
  portfolio: Portfolio,
  template: TemplateId
): FolioBlock {
  const fresh = createBlock(block.type, portfolio, template)
  return { ...fresh, id: block.id }
}
