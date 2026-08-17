import {
  coerceTemplate,
  getPortfolio as getDemoPortfolio,
  getPortfolioExact,
  type FolioBlock,
  type Portfolio,
  type TemplateId,
} from "@/lib/demo"
import { blocksOf, isStaleLayout } from "@/lib/blocks"

export type NavLink = { label: string; href: string }

export type PortfolioChrome = {
  navLinks: NavLink[]
  navCta: NavLink
  footerColumns: { title: string; links: NavLink[] }[]
  logoMode?: "wordmark" | "mark" | "both"
  wordmark?: string
  logoUrl?: string
  showWorkNav?: boolean
  showAboutNav?: boolean
  showContactNav?: boolean
}

export type PortfolioSeo = {
  title: string
  description: string
  indexable: boolean
}

export type PortfolioMedia = {
  headshot?: string
  stills: string[]
  clips: string[]
  filmLink?: string
}

export type PortfolioSettings = {
  email: string
  showEmail: boolean
  notifyViews: boolean
}

export type StoredPortfolio = Portfolio & {
  seo: PortfolioSeo
  chrome: PortfolioChrome
  media: PortfolioMedia
  settings: PortfolioSettings
  updatedAt: number
}

export type LivePortfolio = StoredPortfolio & {
  publishedAt: number
}

const DRAFT_PREFIX = "afm:draft:"
const LIVE_PREFIX = "afm:live:"
const SNAPSHOT_PREFIX = "afm:snapshots:"
const PORTFOLIO_INDEX_KEY = "afm:portfolio:index"
const MAX_SNAPSHOTS = 8

export type PortfolioSummary = Pick<
  StoredPortfolio,
  "slug" | "name" | "title" | "status" | "updatedAt"
>

export const DEMO_PORTFOLIO_SUMMARIES: PortfolioSummary[] = [
  getPortfolioExact("talib"),
  getPortfolioExact("studio-notes"),
]
  .filter(Boolean)
  .map((portfolio) => ({
    slug: portfolio!.slug,
    name: portfolio!.name,
    title: portfolio!.title,
    status: portfolio!.status,
    updatedAt: 0,
  }))

let portfolioSummaryCache: PortfolioSummary[] | null = null

export const DEFAULT_NAV: NavLink[] = [
  { href: "#top", label: "Work" },
  { href: "#cta", label: "Write" },
]

export const DEFAULT_FOOTER_COLUMNS: PortfolioChrome["footerColumns"] = [
  {
    title: "Essential",
    links: [
      { href: "#top", label: "Home" },
      { href: "#features", label: "Projects" },
      { href: "#why", label: "About" },
    ],
  },
  {
    title: "Social",
    links: [
      { href: "#cta", label: "Email" },
      { href: "#reviews", label: "Peers" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#footer", label: "Privacy" },
      { href: "#footer", label: "Terms" },
    ],
  },
]

export function defaultChrome(): PortfolioChrome {
  return {
    navLinks: DEFAULT_NAV.map((link) => ({ ...link })),
    navCta: { label: "Write ↗", href: "#cta" },
    footerColumns: DEFAULT_FOOTER_COLUMNS.map((col) => ({
      title: col.title,
      links: col.links.map((link) => ({ ...link })),
    })),
  }
}

export function defaultSeo(portfolio: Portfolio): PortfolioSeo {
  return {
    title: `${portfolio.name} — AFM Student`,
    description: portfolio.bio,
    indexable: true,
  }
}

export function defaultSettings(): PortfolioSettings {
  return {
    email: "talib@afm.edu",
    showEmail: false,
    notifyViews: false,
  }
}

export function defaultMedia(): PortfolioMedia {
  return { stills: [], clips: [] }
}

export function getStoredOnboardingMedia(): PortfolioMedia | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("afm:onboarding:media")
    if (raw) {
      const parsed = JSON.parse(raw) as PortfolioMedia
      return {
        stills: parsed.stills ?? [],
        clips: parsed.clips ?? [],
        headshot: parsed.headshot,
        filmLink: parsed.filmLink,
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

function seedBlocks(portfolio: Portfolio, template: TemplateId): FolioBlock[] {
  return blocksOf({ ...portfolio, blocks: undefined }, template)
}

export function getBaseDraft(
  slug: string,
  templateHint?: TemplateId
): StoredPortfolio {
  const demo = getPortfolioExact(slug) ?? {
    ...getDemoPortfolio(slug),
    slug,
    name: "Untitled portfolio",
    title: "Human made creative.",
    status: "draft" as const,
    template: "frame" as const,
  }
  const template = coerceTemplate(templateHint ?? demo.template)
  return {
    ...demo,
    slug,
    template,
    blocks: seedBlocks(demo, template),
    seo: defaultSeo(demo),
    chrome: defaultChrome(),
    media: defaultMedia(),
    settings: defaultSettings(),
    updatedAt: 0,
  }
}

export function hydrateDraft(
  slug: string,
  templateHint?: TemplateId
): StoredPortfolio {
  const base = getBaseDraft(slug, templateHint)
  if (typeof window === "undefined") return base
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + slug)
    if (!raw) return base
    const parsed = JSON.parse(raw) as StoredPortfolio
    return {
      ...base,
      ...parsed,
      slug,
      template: coerceTemplate(
        templateHint ?? parsed.template ?? base.template
      ),
      blocks:
        parsed.blocks?.length && !isStaleLayout(parsed.blocks)
          ? parsed.blocks
          : base.blocks,
      seo: { ...base.seo, ...parsed.seo },
      chrome: { ...base.chrome, ...parsed.chrome },
      media: { ...base.media, ...parsed.media },
      settings: { ...base.settings, ...parsed.settings },
    }
  } catch {
    return base
  }
}

export function getDraft(slug: string): StoredPortfolio | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + slug)
    if (!raw) return null
    return JSON.parse(raw) as StoredPortfolio
  } catch {
    return null
  }
}

export function saveDraft(slug: string, draft: StoredPortfolio): void {
  if (typeof window === "undefined") return
  const payload: StoredPortfolio = { ...draft, slug, updatedAt: Date.now() }
  localStorage.setItem(DRAFT_PREFIX + slug, JSON.stringify(payload))
  upsertPortfolioIndex(payload)
  notify(slug)
}

function readPortfolioIndex(): PortfolioSummary[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(
      localStorage.getItem(PORTFOLIO_INDEX_KEY) ?? "[]"
    ) as PortfolioSummary[]
  } catch {
    return []
  }
}

function upsertPortfolioIndex(portfolio: StoredPortfolio) {
  const current = readPortfolioIndex()
  const summary: PortfolioSummary = {
    slug: portfolio.slug,
    name: portfolio.name,
    title: portfolio.title,
    status: portfolio.status,
    updatedAt: portfolio.updatedAt || Date.now(),
  }
  const next = [
    summary,
    ...current.filter((item) => item.slug !== summary.slug),
  ]
  localStorage.setItem(PORTFOLIO_INDEX_KEY, JSON.stringify(next))
}

export function getPortfolioSummaries(): PortfolioSummary[] {
  if (portfolioSummaryCache) return portfolioSummaryCache
  const stored = readPortfolioIndex()
  const storedSlugs = new Set(stored.map((item) => item.slug))
  portfolioSummaryCache = [
    ...stored,
    ...DEMO_PORTFOLIO_SUMMARIES.filter((item) => !storedSlugs.has(item.slug)),
  ]
  return portfolioSummaryCache
}

export function subscribePortfolioSummaries(callback: () => void): () => void {
  return subscribe(() => callback())
}

export function uniquePortfolioSlug(name: string): string {
  const base =
    name
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "portfolio"
  const used = new Set(getPortfolioSummaries().map((item) => item.slug))
  if (!used.has(base)) return base
  let suffix = 2
  while (used.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

export function getLive(slug: string): LivePortfolio | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LIVE_PREFIX + slug)
    if (!raw) return null
    return JSON.parse(raw) as LivePortfolio
  } catch {
    return null
  }
}

export function publish(slug: string, draft: StoredPortfolio): LivePortfolio {
  const live: LivePortfolio = {
    ...draft,
    slug,
    status: draft.status,
    publishedAt: Date.now(),
    updatedAt: Date.now(),
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(LIVE_PREFIX + slug, JSON.stringify(live))
    pushSnapshot(slug, live)
    try {
      document.cookie = `afm_seo_${slug}=${encodeURIComponent(JSON.stringify(draft.seo))};path=/;max-age=31536000;SameSite=Lax`
    } catch {
      /* ignore */
    }
    notify(slug)
  }
  return live
}

function pushSnapshot(slug: string, live: LivePortfolio): void {
  try {
    const key = SNAPSHOT_PREFIX + slug
    const existing = JSON.parse(
      localStorage.getItem(key) ?? "[]"
    ) as LivePortfolio[]
    const next = [live, ...existing].slice(0, MAX_SNAPSHOTS)
    localStorage.setItem(key, JSON.stringify(next))
  } catch {
    /* ignore quota */
  }
}

export function getSnapshots(slug: string): LivePortfolio[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(
      localStorage.getItem(SNAPSHOT_PREFIX + slug) ?? "[]"
    ) as LivePortfolio[]
  } catch {
    return []
  }
}

/** Public view: live if published & status live, else demo seed. */
export function resolvePublicPortfolio(slug: string): Portfolio {
  const demo = getDemoPortfolio(slug)
  const live = getLive(slug)
  if (live && live.status === "live") {
    return live
  }
  return demo
}

export function hasLive(slug: string): boolean {
  return Boolean(getLive(slug)?.status === "live")
}

export function hasDraftChanges(slug: string, draft: StoredPortfolio): boolean {
  const live = getLive(slug)
  if (!live) return true
  return JSON.stringify(stripMeta(draft)) !== JSON.stringify(stripMeta(live))
}

function stripMeta(p: StoredPortfolio | LivePortfolio) {
  const { updatedAt, publishedAt, ...rest } = p as StoredPortfolio & {
    publishedAt?: number
  }
  void updatedAt
  void publishedAt
  return rest
}

type Listener = (slug: string) => void
const listeners = new Set<Listener>()

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify(slug: string) {
  portfolioSummaryCache = null
  for (const fn of listeners) fn(slug)
}

export async function fileToDataUrl(
  file: File,
  maxBytes = 400_000
): Promise<string | null> {
  if (file.size > maxBytes) return null
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}
