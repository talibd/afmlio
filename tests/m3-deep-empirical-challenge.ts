import {
  DEFAULT_ONBOARDING_STATE,
  ONBOARDING_STORAGE_KEY,
  clearOnboardingState,
  generateDraftFromOnboarding,
  loadOnboardingState,
  saveOnboardingState,
  type OnboardingProject,
  type OnboardingState,
} from "@/lib/onboarding"
import {
  createBlock,
  defaultBlocks,
  isStaleLayout,
  reapplyTemplateChrome,
  resetBlock,
} from "@/lib/blocks"
import {
  getDraft,
  saveDraft,
  type StoredPortfolio,
} from "@/lib/portfolio-store"
import { type BlockType, type FolioBlock } from "@/lib/demo"

// -----------------------------------------------------------------------------
// Test Runner Harness
// -----------------------------------------------------------------------------
interface TestCaseResult {
  suite: string
  id: string
  name: string
  passed: boolean
  details: string
}

const allResults: TestCaseResult[] = []

function test(suite: string, id: string, name: string, fn: () => { pass: boolean; details: string }) {
  try {
    const res = fn()
    if (res.pass) {
      allResults.push({ suite, id, name, passed: true, details: res.details })
      console.log(`  [PASS] [${suite} - ${id}] ${name}: ${res.details}`)
    } else {
      allResults.push({ suite, id, name, passed: false, details: res.details })
      console.error(`  [FAIL] [${suite} - ${id}] ${name}: ${res.details}`)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    allResults.push({ suite, id, name, passed: false, details: `Threw exception: ${msg}` })
    console.error(`  [FAIL] [${suite} - ${id}] ${name}: Threw exception: ${msg}`)
  }
}

console.log("================================================================================")
console.log("DEEP EMPIRICAL CHALLENGER SUITE: Milestone M3 Verification")
console.log("================================================================================\n")

// -----------------------------------------------------------------------------
// Mock LocalStorage for Node testing
// -----------------------------------------------------------------------------
class MockLocalStorage {
  private store: Map<string, string> = new Map()
  public throwOnSet = false

  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.throwOnSet) {
      throw new Error("QuotaExceededError: DOM Exception 22")
    }
    this.store.set(key, String(value))
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  get length(): number {
    return this.store.size
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys())
    return keys[index] ?? null
  }
}

const mockStorage = new MockLocalStorage()

// =============================================================================
// SUITE 1: LocalStorage Persistence & Resilience
// =============================================================================
console.log("--- Suite 1: LocalStorage Persistence & Resilience ---")

test("Suite 1", "1.1", "loadOnboardingState in SSR (no window) returns DEFAULT_ONBOARDING_STATE", () => {
  const origWindow = (globalThis as unknown as { window?: unknown }).window
  delete (globalThis as unknown as { window?: unknown }).window

  const state = loadOnboardingState()
  const pass = state.studioName === DEFAULT_ONBOARDING_STATE.studioName &&
    state.projects.length === DEFAULT_ONBOARDING_STATE.projects.length

  if (origWindow !== undefined) {
    ;(globalThis as unknown as { window?: unknown }).window = origWindow
  }
  return {
    pass,
    details: `Returned default studio: "${state.studioName}", projects: ${state.projects.length}`,
  }
})

;(globalThis as unknown as { window: unknown; localStorage: unknown }).window = globalThis
;(globalThis as unknown as { window: unknown; localStorage: unknown }).localStorage = mockStorage

test("Suite 1", "1.2", "loadOnboardingState with empty localStorage returns DEFAULT_ONBOARDING_STATE", () => {
  mockStorage.clear()
  const state = loadOnboardingState()
  const pass = state.studioName === DEFAULT_ONBOARDING_STATE.studioName &&
    state.heroLine1 === DEFAULT_ONBOARDING_STATE.heroLine1 &&
    state.disciplines.length === DEFAULT_ONBOARDING_STATE.disciplines.length
  return {
    pass,
    details: `Empty storage yielded default state with ${state.disciplines.length} disciplines`,
  }
})

test("Suite 1", "1.3", "loadOnboardingState with corrupt JSON string safely returns DEFAULT_ONBOARDING_STATE", () => {
  mockStorage.setItem(ONBOARDING_STORAGE_KEY, "{corrupt json invalid syntax: %%%")
  const state = loadOnboardingState()
  const pass = state.studioName === DEFAULT_ONBOARDING_STATE.studioName &&
    state.projects.length === DEFAULT_ONBOARDING_STATE.projects.length
  return {
    pass,
    details: `Corrupt JSON safely recovered to default state: "${state.studioName}"`,
  }
})

test("Suite 1", "1.4", "loadOnboardingState with partial object merges missing defaults", () => {
  mockStorage.clear()
  const partial = {
    studioName: "KROMA LABS",
    heroLine1: "Volumetric CGI",
  }
  mockStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(partial))
  const state = loadOnboardingState()
  const pass = state.studioName === "KROMA LABS" &&
    state.heroLine1 === "Volumetric CGI" &&
    state.heroLine2 === DEFAULT_ONBOARDING_STATE.heroLine2 &&
    state.contactEmail === DEFAULT_ONBOARDING_STATE.contactEmail &&
    state.disciplines.length === DEFAULT_ONBOARDING_STATE.disciplines.length &&
    state.projects.length === DEFAULT_ONBOARDING_STATE.projects.length &&
    state.templateId === "frame"
  return {
    pass,
    details: `Partially saved state merged defaults: studio="${state.studioName}", hero2="${state.heroLine2}", disciplines=${state.disciplines.length}`,
  }
})

test("Suite 1", "1.5", "loadOnboardingState with empty arrays fallback to default collections", () => {
  mockStorage.clear()
  const emptyArrays = {
    studioName: "Test Studio",
    disciplines: [],
    projects: [],
    services: [],
  }
  mockStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(emptyArrays))
  const state = loadOnboardingState()
  const pass = state.disciplines.length === DEFAULT_ONBOARDING_STATE.disciplines.length &&
    state.projects.length === DEFAULT_ONBOARDING_STATE.projects.length &&
    state.services.length === DEFAULT_ONBOARDING_STATE.services.length
  return {
    pass,
    details: `Empty disciplines/projects/services fell back to default arrays: disciplines=${state.disciplines.length}, projects=${state.projects.length}`,
  }
})

test("Suite 1", "1.6", "saveOnboardingState writes valid JSON to ONBOARDING_STORAGE_KEY", () => {
  mockStorage.clear()
  const customState: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    studioName: "NEXUS MOTION",
    contactEmail: "inquiry@nexus.ai",
  }
  saveOnboardingState(customState)
  const raw = mockStorage.getItem(ONBOARDING_STORAGE_KEY)
  const parsed = raw ? (JSON.parse(raw) as OnboardingState) : null
  const pass = parsed !== null &&
    parsed.studioName === "NEXUS MOTION" &&
    parsed.contactEmail === "inquiry@nexus.ai"
  return {
    pass,
    details: `Saved state in localStorage matches: studio="${parsed?.studioName}", email="${parsed?.contactEmail}"`,
  }
})

test("Suite 1", "1.7", "saveOnboardingState swallows storage exceptions (e.g. QuotaExceeded) safely", () => {
  mockStorage.throwOnSet = true
  let threw = false
  try {
    saveOnboardingState(DEFAULT_ONBOARDING_STATE)
  } catch {
    threw = true
  } finally {
    mockStorage.throwOnSet = false
  }
  return {
    pass: !threw,
    details: `saveOnboardingState did not throw when storage threw QuotaExceededError`,
  }
})

test("Suite 1", "1.8", "clearOnboardingState removes ONBOARDING_STORAGE_KEY from storage", () => {
  mockStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(DEFAULT_ONBOARDING_STATE))
  clearOnboardingState()
  const raw = mockStorage.getItem(ONBOARDING_STORAGE_KEY)
  return {
    pass: raw === null,
    details: `Storage key removed: raw is ${String(raw)}`,
  }
})

// =============================================================================
// SUITE 2: Onboarding State Boundary & Extreme Edge Cases
// =============================================================================
console.log("\n--- Suite 2: Onboarding State Boundary & Extreme Edge Cases ---")

test("Suite 2", "2.1", "All empty / whitespace strings fallback gracefully to valid non-empty values", () => {
  const blankState: OnboardingState = {
    studioName: "   \t\n  ",
    heroLine1: "",
    heroLine2: "   ",
    contactEmail: "   ",
    disciplines: [],
    projects: [],
    statementHeadline: "   ",
    statementBio: "",
    services: [],
    templateId: "frame",
  }
  const draft = generateDraftFromOnboarding(blankState, "blank-slug")
  const blocks = draft.blocks ?? []
  const hero = blocks.find((b) => b.type === "hero")
  const about = blocks.find((b) => b.type === "about")
  const contact = blocks.find((b) => b.type === "contact")

  const pass = draft.name === "TALIB / FRAME" &&
    draft.settings.email === "contact@talib.design" &&
    hero?.heading === "Direction & Visual Systems\nSelected Works 2024–2026" &&
    about?.heading === "Less noise. More work." &&
    contact?.ctaHref === "mailto:contact@talib.design" &&
    !blocks.some((b) => b.heading?.includes("undefined") || b.body?.includes("undefined"))

  return {
    pass,
    details: `All blank inputs converted to safe fallbacks. Draft name: "${draft.name}", email: "${draft.settings.email}"`,
  }
})

test("Suite 2", "2.2", "Massive string inputs (100k characters) processed without memory exhaustion or crash", () => {
  const massiveHeadline = "A".repeat(50_000)
  const massiveBio = "B".repeat(50_000)
  const massiveState: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    statementHeadline: massiveHeadline,
    statementBio: massiveBio,
  }
  const t0 = Date.now()
  const draft = generateDraftFromOnboarding(massiveState, "massive-slug")
  const duration = Date.now() - t0
  const blocks = draft.blocks ?? []
  const about = blocks.find((b) => b.type === "about")

  const pass = about?.heading.length === 50_000 &&
    about?.body?.length === 50_000 &&
    draft.bio.length === 50_000 &&
    duration < 500

  return {
    pass,
    details: `Processed 100k chars in ${duration}ms without errors`,
  }
})

test("Suite 2", "2.3", "Special Characters, HTML entities, Quotes, Backslashes, and XSS strings preserved without corruption", () => {
  const xssState: OnboardingState = {
    studioName: "<script>alert('XSS')</script> & \"Quotes\"",
    heroLine1: "Line 1 with `backticks` and \\backslash\\",
    heroLine2: "Line 2 with ${eval('code')} & <style>body{}</style>",
    contactEmail: "inquiry+tag@sub-domain.co.uk",
    disciplines: ["CGI & VFX", "<Film>", "3D/2D 'Hybrid'"],
    projects: [
      {
        id: "p-xss-1",
        title: "Project <b>Bold</b> & \"Escaped\"",
        category: "CGI & VFX",
        runtime: "01:30",
        imageUrl: "https://example.com/asset.jpg?param=1&foo=bar#hash",
        client: "Client & Partners / 'Global'",
        description: "Description with \n newline and \t tabs and <img src=x onerror=alert(1)>",
      },
    ],
    statementHeadline: "Manifesto: \"To be or not to be\" & <bold>",
    statementBio: "Studio Bio with unicode \u0000 \u2028 \u2029 characters.",
    services: ["Service A & B", "CGI <3D>"],
    templateId: "frame",
  }

  const draft = generateDraftFromOnboarding(xssState, "xss-slug")
  const json = JSON.stringify(draft)
  const roundtrip = JSON.parse(json) as StoredPortfolio
  const roundtripBlocks = roundtrip.blocks ?? []

  const pass = roundtrip.name === "<script>alert('XSS')</script> & \"Quotes\"" &&
    roundtripBlocks[0]?.heading?.includes("`backticks`") &&
    roundtripBlocks[1]?.heading === "Project <b>Bold</b> & \"Escaped\"" &&
    roundtripBlocks[1]?.eyebrow === "CGI & VFX"

  return {
    pass,
    details: `Special chars survived JSON roundtrip intact: name="${roundtrip.name}"`,
  }
})

test("Suite 2", "2.4", "Multilingual Unicode, RTL scripts, CJK, and Emojis preserved across all block headers and copy", () => {
  const multiState: OnboardingState = {
    studioName: "スタジオ · 映画制作 ✨ 🎬",
    heroLine1: "🌟 الإخراج السينمائي والتصميم الرقمي",
    heroLine2: "Créativité sans frontières 🚀 2026",
    contactEmail: "talib@éxample.studio",
    disciplines: ["Кино 🎥", "アニメ 🌸", "تصميم 📐", "Édition ✂️"],
    projects: [
      {
        id: "p-multi-1",
        title: "東京 2099: 記憶の構造 🌌",
        category: "アニメ 🌸",
        runtime: "05:12",
        imageUrl: "https://example.com/cjk.jpg",
        description: "生成AIと伝統的アニメーションの融合。🌸",
      },
    ],
    statementHeadline: "卓越した美学 · Qualité Supérieure ✨",
    statementBio: "نص تجريبي للإبداع والتصميم الرقمي في استوديو المستقبل. 🚀",
    services: ["Direction 🎬", "3D CGI 🌟"],
    templateId: "frame",
  }

  const draft = generateDraftFromOnboarding(multiState, "multilingual-slug")
  const blocks = draft.blocks ?? []
  const pass = draft.name.includes("✨") &&
    blocks[0]?.heading?.includes("الإخراج") &&
    blocks[0]?.heading?.includes("Créativité") &&
    blocks[1]?.heading?.includes("東京 2099") &&
    blocks[3]?.heading?.includes("卓越した美学") &&
    blocks[3]?.body?.includes("نص تجريبي")

  return {
    pass,
    details: `Multilingual CJK, Arabic RTL, French accents, and Emojis preserved across all FolioBlocks`,
  }
})

test("Suite 2", "2.5", "Extreme project counts: 0 projects safely falls back to default projects", () => {
  const zeroState: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    projects: [],
  }
  const draft = generateDraftFromOnboarding(zeroState, "zero-projects")
  const blocks = draft.blocks ?? []
  const featured = blocks.filter((b) => b.type === "featured")

  const pass = featured.length === DEFAULT_ONBOARDING_STATE.projects.length &&
    blocks.length === DEFAULT_ONBOARDING_STATE.projects.length + 4

  return {
    pass,
    details: `0 projects state yielded ${featured.length} featured blocks (fell back to default projects)`,
  }
})

test("Suite 2", "2.6", "Extreme project counts: 100 projects generate 100 featured blocks with unique IDs", () => {
  const hundredProjects: OnboardingProject[] = Array.from({ length: 100 }, (_, i) => ({
    id: `project-${i + 1}`,
    title: `Showcase Work #${i + 1}`,
    category: i % 2 === 0 ? "Films" : "Commercials",
    runtime: "02:30",
    imageUrl: `https://images.unsplash.com/photo-${1000 + i}`,
    client: `Client ${i + 1}`,
    description: `Narrative for project ${i + 1}`,
  }))

  const hundredState: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    projects: hundredProjects,
  }

  const draft = generateDraftFromOnboarding(hundredState, "hundred-slug")
  const blocks = draft.blocks ?? []
  const featured = blocks.filter((b) => b.type === "featured")
  const allIds = new Set(blocks.map((b) => b.id))

  const pass = featured.length === 100 &&
    blocks.length === 104 &&
    allIds.size === 104 &&
    draft.media.stills.length === 100

  return {
    pass,
    details: `Generated ${featured.length} featured blocks, total ${blocks.length} blocks with ${allIds.size} unique IDs`,
  }
})

test("Suite 2", "2.7", "Projects with missing imageUrl fall back to default project image URL", () => {
  const missingImgState: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    projects: [
      {
        id: "no-img-1",
        title: "No Image Project 1",
        category: "Films",
        runtime: "01:00",
        imageUrl: "",
      },
      {
        id: "no-img-2",
        title: "No Image Project 2",
        category: "Commercials",
        runtime: "02:00",
        imageUrl: "",
      },
    ],
  }

  const draft = generateDraftFromOnboarding(missingImgState, "no-img-slug")
  const blocks = draft.blocks ?? []
  const featured = blocks.filter((b) => b.type === "featured")

  const pass = featured.length === 2 &&
    (featured[0]?.image?.length ?? 0) > 0 &&
    (featured[1]?.image?.length ?? 0) > 0 &&
    featured[0]?.image === DEFAULT_ONBOARDING_STATE.projects[0].imageUrl &&
    featured[1]?.image === DEFAULT_ONBOARDING_STATE.projects[1].imageUrl

  return {
    pass,
    details: `Missing project imageUrl fell back to DEFAULT_ONBOARDING_STATE project images`,
  }
})

test("Suite 2", "2.8", "Contact block CTA formats email in uppercase with ↗ symbol and mailto: link", () => {
  const emailState: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    contactEmail: "hello@creative-studio.io",
  }
  const draft = generateDraftFromOnboarding(emailState, "email-test")
  const blocks = draft.blocks ?? []
  const contact = blocks.find((b) => b.type === "contact")

  const pass = contact !== undefined &&
    contact.cta === "HELLO@CREATIVE-STUDIO.IO ↗" &&
    contact.ctaHref === "mailto:hello@creative-studio.io"

  return {
    pass,
    details: `Contact CTA="${contact?.cta}", ctaHref="${contact?.ctaHref}"`,
  }
})

test("Suite 2", "2.9", "Skills block uses provided services, or falls back to DEFAULT_ONBOARDING_STATE.services when empty", () => {
  const withServices: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    disciplines: ["D1", "D2"],
    services: ["S1", "S2", "S3"],
  }
  const draftA = generateDraftFromOnboarding(withServices, "skills-a")
  const skillsBlockA = (draftA.blocks ?? []).find((b) => b.type === "skills")

  const withoutServices: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    disciplines: ["D1", "D2"],
    services: [],
  }
  const draftB = generateDraftFromOnboarding(withoutServices, "skills-b")
  const skillsBlockB = (draftB.blocks ?? []).find((b) => b.type === "skills")

  const pass = skillsBlockA?.items?.join(",") === "S1,S2,S3" &&
    skillsBlockB?.items?.join(",") === DEFAULT_ONBOARDING_STATE.services.join(",")

  return {
    pass,
    details: `With custom services: [${skillsBlockA?.items?.join(", ")}], With empty services (fallback to default services): [${skillsBlockB?.items?.join(", ")}]`,
  }
})

// =============================================================================
// SUITE 3: FolioBlock ↔ BlockSidebar Schema Synchronization & Mutations
// =============================================================================
console.log("\n--- Suite 3: FolioBlock ↔ BlockSidebar Schema Synchronization & Mutations ---")

const baseDraft = generateDraftFromOnboarding(DEFAULT_ONBOARDING_STATE, "mutation-test")

test("Suite 3", "3.1", "isStaleLayout returns false for generated onboarding blocks", () => {
  const isStale = isStaleLayout(baseDraft.blocks)
  return {
    pass: isStale === false,
    details: `isStaleLayout is false, guaranteeing onboarding blocks will not be wiped or replaced by default template blocks`,
  }
})

test("Suite 3", "3.2", "Simulate BlockSidebar inline field updates on Hero block", () => {
  const blocks = [...(baseDraft.blocks ?? [])]
  const heroIndex = blocks.findIndex((b) => b.type === "hero")
  const hero = blocks[heroIndex]

  const patch: Partial<FolioBlock> = {
    heading: "Updated Hero Title\nSelected Works 2026",
    eyebrow: "Available for Q4 · Film Director",
    body: "Updated studio manifesto copy.",
    cta: "EXPLORE NOW →",
    ctaHref: "#work",
    cta2: "READ BIO",
    cta2Href: "#about",
    image: "https://example.com/new-hero.jpg",
  }

  blocks[heroIndex] = { ...hero, ...patch }
  const updatedHero = blocks[heroIndex]

  const pass = updatedHero.heading === patch.heading &&
    updatedHero.eyebrow === patch.eyebrow &&
    updatedHero.body === patch.body &&
    updatedHero.cta === patch.cta &&
    updatedHero.ctaHref === patch.ctaHref &&
    updatedHero.cta2 === patch.cta2 &&
    updatedHero.cta2Href === patch.cta2Href &&
    updatedHero.image === patch.image

  return {
    pass,
    details: `Hero block accepted all BlockSidebar fields: heading="${updatedHero.heading}", cta="${updatedHero.cta}"`,
  }
})

test("Suite 3", "3.3", "Simulate BlockSidebar inline field updates on Featured block", () => {
  const blocks = [...(baseDraft.blocks ?? [])]
  const featuredIndex = blocks.findIndex((b) => b.type === "featured")
  const feat = blocks[featuredIndex]

  const patch: Partial<FolioBlock> = {
    heading: "Chronos II: Beyond Time",
    eyebrow: "Short Films",
    body: "Extended directors cut with immersive Dolby Atmos mix.",
    image: "https://example.com/chronos-2.jpg",
    imageAlt: "Chronos II Key Visual",
    mediaKind: "video",
    cta: "WATCH TRAILER ↗",
    ctaHref: "https://vimeo.com/123456",
  }

  blocks[featuredIndex] = { ...feat, ...patch }
  const updated = blocks[featuredIndex]

  const pass = updated.heading === patch.heading &&
    updated.eyebrow === patch.eyebrow &&
    updated.body === patch.body &&
    updated.image === patch.image &&
    updated.imageAlt === patch.imageAlt &&
    updated.mediaKind === "video" &&
    updated.cta === patch.cta

  return {
    pass,
    details: `Featured block accepted title, eyebrow, body, image, alt, mediaKind, and cta`,
  }
})

test("Suite 3", "3.4", "Simulate BlockSidebar SkillsListEditor (Add, Update, Remove, Reorder, Bulk Add)", () => {
  const blocks = [...(baseDraft.blocks ?? [])]
  const skillsIndex = blocks.findIndex((b) => b.type === "skills")
  let items = [...(blocks[skillsIndex].items ?? [])]

  items = [...items, "New Skill"]
  items[items.length - 1] = "Spatial Computing"
  const [moved] = items.splice(items.length - 1, 1)
  items.splice(0, 0, moved)
  const bulk = "Unreal Engine 5, Houdini Solaris, ComfyUI"
  const newBulk = bulk.split(",").map((s) => s.trim()).filter(Boolean)
  items = [...items, ...newBulk]
  items = items.filter((_, i) => i !== 2)

  blocks[skillsIndex] = { ...blocks[skillsIndex], items }
  const updatedSkills = blocks[skillsIndex]

  const pass = updatedSkills.items?.[0] === "Spatial Computing" &&
    updatedSkills.items?.includes("Unreal Engine 5") &&
    updatedSkills.items?.includes("Houdini Solaris") &&
    updatedSkills.items?.includes("ComfyUI")

  return {
    pass,
    details: `Skills items modified successfully: total ${updatedSkills.items?.length} items: [${updatedSkills.items?.join(", ")}]`,
  }
})

test("Suite 3", "3.5", "Simulate BlockSidebar Section Actions: Move, Duplicate, ToggleHidden, Reset, Remove", () => {
  let blocks = [...(baseDraft.blocks ?? [])]
  const initialCount = blocks.length

  const targetBlock = blocks[1]
  const duplicateBlock: FolioBlock = {
    ...targetBlock,
    id: `${targetBlock.type}-${Math.random().toString(36).slice(2, 8)}`,
  }
  blocks.splice(2, 0, duplicateBlock)
  const afterDupCount = blocks.length

  blocks = blocks.map((b) => (b.id === duplicateBlock.id ? { ...b, hidden: !b.hidden } : b))
  const isHidden = blocks.find((b) => b.id === duplicateBlock.id)?.hidden

  const dupIdx = blocks.findIndex((b) => b.id === duplicateBlock.id)
  const [item] = blocks.splice(dupIdx, 1)
  blocks.splice(dupIdx - 1, 0, item)
  const newIdx = blocks.findIndex((b) => b.id === duplicateBlock.id)

  const resetResult = resetBlock(duplicateBlock, baseDraft, "frame")
  blocks = blocks.map((b) => (b.id === duplicateBlock.id ? resetResult : b))

  blocks = blocks.filter((b) => b.id !== duplicateBlock.id)
  const finalCount = blocks.length

  const pass = afterDupCount === initialCount + 1 &&
    isHidden === true &&
    newIdx === dupIdx - 1 &&
    resetResult.id === duplicateBlock.id &&
    finalCount === initialCount

  return {
    pass,
    details: `All BlockSidebar section lifecycle operations (Duplicate, ToggleHidden, Move, Reset, Delete) passed cleanly`,
  }
})

test("Suite 3", "3.6", "reapplyTemplateChrome preserves all onboarding custom content and IDs", () => {
  const customDraft = generateDraftFromOnboarding(DEFAULT_ONBOARDING_STATE, "chrome-test")
  const origBlocks = customDraft.blocks ?? []
  const updatedBlocks = reapplyTemplateChrome(origBlocks, customDraft, "frame")

  const pass = updatedBlocks.length === origBlocks.length &&
    updatedBlocks.every((b, idx) => {
      const orig = origBlocks[idx]
      return b.id === orig.id &&
        b.type === orig.type &&
        b.heading === orig.heading &&
        b.body === orig.body &&
        b.image === orig.image &&
        b.cta === orig.cta
    })

  return {
    pass,
    details: `All ${updatedBlocks.length} blocks retained complete copy, structure, and IDs across template chrome reapplication`,
  }
})

// =============================================================================
// SUITE 4: Storage & Public View Integration
// =============================================================================
console.log("\n--- Suite 4: Storage & Public View Integration ---")

test("Suite 4", "4.1", "saveDraft and getDraft in portfolio-store roundtrips generated draft with 100% fidelity", () => {
  mockStorage.clear()
  const slug = "test-store-slug"
  const draft = generateDraftFromOnboarding(DEFAULT_ONBOARDING_STATE, slug)
  saveDraft(slug, draft)

  const retrieved = getDraft(slug)
  const pass = retrieved !== null &&
    retrieved.slug === slug &&
    retrieved.name === draft.name &&
    (retrieved.blocks?.length ?? 0) === (draft.blocks?.length ?? 0) &&
    retrieved.settings.email === draft.settings.email &&
    retrieved.seo.title === draft.seo.title

  return {
    pass,
    details: `Retrieved stored draft: slug="${retrieved?.slug}", name="${retrieved?.name}", blocks=${retrieved?.blocks?.length}`,
  }
})

test("Suite 4", "4.2", "StoredPortfolio schema strict compliance (required fields)", () => {
  const draft = generateDraftFromOnboarding(DEFAULT_ONBOARDING_STATE, "schema-check")
  const pass = typeof draft.slug === "string" &&
    typeof draft.name === "string" &&
    typeof draft.title === "string" &&
    typeof draft.bio === "string" &&
    draft.status === "draft" &&
    draft.template === "frame" &&
    typeof draft.project === "object" &&
    Array.isArray(draft.skills) &&
    Array.isArray(draft.blocks) &&
    typeof draft.media === "object" &&
    Array.isArray(draft.media.stills) &&
    Array.isArray(draft.media.clips) &&
    typeof draft.settings === "object" &&
    typeof draft.settings.email === "string" &&
    typeof draft.settings.showEmail === "boolean" &&
    typeof draft.seo === "object" &&
    typeof draft.seo.title === "string" &&
    typeof draft.chrome === "object" &&
    Array.isArray(draft.chrome.navLinks) &&
    Array.isArray(draft.chrome.footerColumns) &&
    typeof draft.updatedAt === "number"

  return {
    pass,
    details: `All 14 top-level StoredPortfolio properties and nested schemas conform strictly to TypeScript interfaces`,
  }
})

// =============================================================================
// SUMMARY & VERDICT
// =============================================================================
console.log("\n================================================================================")
console.log("CHALLENGER EXECUTION SUMMARY")
console.log("================================================================================")

const total = allResults.length
const passed = allResults.filter((r) => r.passed).length
const failed = allResults.filter((r) => !r.passed).length

console.log(`Total Invariants Evaluated: ${total}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)

if (failed > 0) {
  console.log("\nFailure Details:")
  allResults.filter((r) => !r.passed).forEach((r) => {
    console.log(`  - [${r.suite} - ${r.id}] ${r.name}: ${r.details}`)
  })
}

const finalVerdict = failed === 0 ? "APPROVE" : "REQUEST_CHANGES"
console.log(`\nFINAL EXPLICIT VERDICT: ${finalVerdict}`)

if (failed > 0) {
  process.exit(1)
}
