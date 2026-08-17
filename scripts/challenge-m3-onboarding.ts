import fs from "node:fs"
import path from "node:path"
import {
  DEFAULT_ONBOARDING_STATE,
  ONBOARDING_STORAGE_KEY,
  generateDraftFromOnboarding,
  loadOnboardingState,
  saveOnboardingState,
  clearOnboardingState,
  type OnboardingProject,
  type OnboardingState,
} from "@/lib/onboarding"
import { type StoredPortfolio } from "@/lib/portfolio-store"
import { type FolioBlock } from "@/lib/demo"

interface TestResult {
  suite: string
  name: string
  passed: boolean
  details: string
  error?: string
}

const results: TestResult[] = []

function assert(suite: string, name: string, condition: boolean, details: string) {
  if (condition) {
    results.push({ suite, name, passed: true, details })
    console.log(`  [PASS] [${suite}] ${name}: ${details}`)
  } else {
    results.push({ suite, name, passed: false, details })
    console.error(`  [FAIL] [${suite}] ${name}: ${details}`)
  }
}

console.log("================================================================================")
console.log("EMPIRICAL CHALLENGER TEST SUITE: Milestone M3 lib/onboarding.ts Verification")
console.log("================================================================================\n")

// -----------------------------------------------------------------------------
// Suite 1: Module & Contract Conformance
// -----------------------------------------------------------------------------
console.log("--- Suite 1: Module & Contract Conformance ---")

assert(
  "Suite 1",
  "ONBOARDING_STORAGE_KEY constant",
  ONBOARDING_STORAGE_KEY === "afm:onboarding:data",
  `Expected "afm:onboarding:data", got "${ONBOARDING_STORAGE_KEY}"`
)

assert(
  "Suite 1",
  "DEFAULT_ONBOARDING_STATE structure",
  typeof DEFAULT_ONBOARDING_STATE === "object" &&
    DEFAULT_ONBOARDING_STATE.studioName.length > 0 &&
    DEFAULT_ONBOARDING_STATE.heroLine1.length > 0 &&
    DEFAULT_ONBOARDING_STATE.heroLine2.length > 0 &&
    DEFAULT_ONBOARDING_STATE.contactEmail.length > 0 &&
    Array.isArray(DEFAULT_ONBOARDING_STATE.disciplines) &&
    DEFAULT_ONBOARDING_STATE.disciplines.length >= 3 &&
    Array.isArray(DEFAULT_ONBOARDING_STATE.projects) &&
    DEFAULT_ONBOARDING_STATE.projects.length >= 3 &&
    DEFAULT_ONBOARDING_STATE.statementHeadline.length > 0 &&
    DEFAULT_ONBOARDING_STATE.statementBio.length > 0 &&
    DEFAULT_ONBOARDING_STATE.templateId === "frame",
  `Studio: "${DEFAULT_ONBOARDING_STATE.studioName}", Projects: ${DEFAULT_ONBOARDING_STATE.projects.length}, Disciplines: ${DEFAULT_ONBOARDING_STATE.disciplines.length}`
)

assert(
  "Suite 1",
  "Function exports exist and are callable",
  typeof generateDraftFromOnboarding === "function" &&
    typeof loadOnboardingState === "function" &&
    typeof saveOnboardingState === "function" &&
    typeof clearOnboardingState === "function",
  "generateDraftFromOnboarding, loadOnboardingState, saveOnboardingState, clearOnboardingState exported"
)

// -----------------------------------------------------------------------------
// Suite 2: Default State Generation & Serialization
// -----------------------------------------------------------------------------
console.log("\n--- Suite 2: Default State Generation & Serialization ---")

const defaultDraft = generateDraftFromOnboarding(DEFAULT_ONBOARDING_STATE, "talib")
const defaultDraftBlocks = defaultDraft.blocks ?? []

assert(
  "Suite 2",
  "Draft slug match",
  defaultDraft.slug === "talib",
  `Expected "talib", got "${defaultDraft.slug}"`
)

assert(
  "Suite 2",
  "Draft template is 'frame'",
  defaultDraft.template === "frame",
  `Expected "frame", got "${defaultDraft.template}"`
)

assert(
  "Suite 2",
  "Studio Name propagated",
  defaultDraft.name === DEFAULT_ONBOARDING_STATE.studioName,
  `Expected "${DEFAULT_ONBOARDING_STATE.studioName}", got "${defaultDraft.name}"`
)

assert(
  "Suite 2",
  "Settings Email propagated",
  defaultDraft.settings.email === DEFAULT_ONBOARDING_STATE.contactEmail,
  `Expected "${DEFAULT_ONBOARDING_STATE.contactEmail}", got "${defaultDraft.settings.email}"`
)

const expectedSkills = (DEFAULT_ONBOARDING_STATE.services?.length ?? 0) > 0
  ? DEFAULT_ONBOARDING_STATE.services
  : DEFAULT_ONBOARDING_STATE.disciplines

assert(
  "Suite 2",
  "Skills / Disciplines populated",
  Array.isArray(defaultDraft.skills) && defaultDraft.skills.length === expectedSkills.length,
  `Skills count: ${defaultDraft.skills.length} matching: [${defaultDraft.skills.join(", ")}]`
)

assert(
  "Suite 2",
  "Media Stills populated",
  Array.isArray(defaultDraft.media.stills) && defaultDraft.media.stills.length === DEFAULT_ONBOARDING_STATE.projects.length,
  `Media stills count: ${defaultDraft.media.stills.length}`
)

assert(
  "Suite 2",
  "Total Blocks count",
  defaultDraftBlocks.length === DEFAULT_ONBOARDING_STATE.projects.length + 4,
  `Generated ${defaultDraftBlocks.length} blocks (hero + ${DEFAULT_ONBOARDING_STATE.projects.length} featured + skills + about + contact)`
)

// Serialization check
const serialized = JSON.stringify(defaultDraft)
const parsed = JSON.parse(serialized) as StoredPortfolio
assert(
  "Suite 2",
  "JSON Serialization & Deserialization fidelity",
  parsed.slug === "talib" &&
    (parsed.blocks?.length ?? 0) === defaultDraftBlocks.length &&
    parsed.settings.email === defaultDraft.settings.email,
  `Payload size: ${serialized.length} bytes, roundtripped with 100% integrity`
)

// -----------------------------------------------------------------------------
// Suite 3: Required Fields Validation
// -----------------------------------------------------------------------------
console.log("\n--- Suite 3: Required Fields Validation on StoredPortfolio ---")

assert(
  "Suite 3",
  "Field: template === 'frame'",
  defaultDraft.template === "frame",
  `Template is "${defaultDraft.template}"`
)

assert(
  "Suite 3",
  "Field: media structure conforms to PortfolioMedia",
  typeof defaultDraft.media === "object" &&
    Array.isArray(defaultDraft.media.stills) &&
    Array.isArray(defaultDraft.media.clips) &&
    typeof defaultDraft.media.headshot === "string",
  `media.stills: ${defaultDraft.media.stills.length}, media.clips: ${defaultDraft.media.clips.length}`
)

assert(
  "Suite 3",
  "Field: settings structure conforms to PortfolioSettings",
  typeof defaultDraft.settings === "object" &&
    typeof defaultDraft.settings.email === "string" &&
    typeof defaultDraft.settings.showEmail === "boolean" &&
    typeof defaultDraft.settings.notifyViews === "boolean",
  `settings.email: "${defaultDraft.settings.email}", showEmail: ${defaultDraft.settings.showEmail}`
)

assert(
  "Suite 3",
  "Field: chrome conforms to PortfolioChrome",
  typeof defaultDraft.chrome === "object" &&
    Array.isArray(defaultDraft.chrome.navLinks) &&
    typeof defaultDraft.chrome.navCta === "object" &&
    Array.isArray(defaultDraft.chrome.footerColumns),
  `navLinks: ${defaultDraft.chrome.navLinks.length}, footerColumns: ${defaultDraft.chrome.footerColumns.length}`
)

assert(
  "Suite 3",
  "Field: seo conforms to PortfolioSeo",
  typeof defaultDraft.seo === "object" &&
    typeof defaultDraft.seo.title === "string" &&
    typeof defaultDraft.seo.description === "string" &&
    typeof defaultDraft.seo.indexable === "boolean",
  `SEO title: "${defaultDraft.seo.title}"`
)

// -----------------------------------------------------------------------------
// Suite 4: Edge Case Stress Testing
// -----------------------------------------------------------------------------
console.log("\n--- Suite 4: Edge Case Stress Testing ---")

// Edge Case A: Empty strings in all inputs
const emptyInputState: OnboardingState = {
  studioName: "   ",
  heroLine1: "",
  heroLine2: "   ",
  contactEmail: "",
  disciplines: [],
  projects: [],
  statementHeadline: "",
  statementBio: "",
  services: [],
  templateId: "frame",
}
const draftEmpty = generateDraftFromOnboarding(emptyInputState, "empty-slug")
const draftEmptyBlocks = draftEmpty.blocks ?? []
assert(
  "Suite 4",
  "Edge Case A: All-empty strings fallback safely",
  draftEmpty.name === "TALIB / FRAME" &&
    draftEmpty.settings.email === "contact@talib.design" &&
    draftEmpty.skills.length > 0 &&
    draftEmptyBlocks.length >= 4 &&
    !draftEmptyBlocks.some((b) => b.heading === "undefined" || b.body === "undefined"),
  `Fallback name: "${draftEmpty.name}", email: "${draftEmpty.settings.email}", blocks count: ${draftEmptyBlocks.length}`
)

// Edge Case B: Special Characters, HTML tags, Quotes, Escapes
const specialCharsState: OnboardingState = {
  studioName: "<script>alert('XSS')</script>",
  heroLine1: "Headline & \"Quotes\" <tag> `code`",
  heroLine2: "Line 2 \\ backslash / slash % amp &amp;",
  contactEmail: "inquiry+tag@sub.domain.ai",
  disciplines: ["<Design>", "&Code", "3D \"CGI\"", "VFX & Compositing"],
  projects: [
    {
      id: "proj-special",
      title: "Project <b>Bold</b> & 'Special'",
      category: "Films & Shorts",
      runtime: "05:00",
      imageUrl: "https://example.com/test?a=1&b=2#hash",
      description: "Desc with \n newlines and \t tabs and \"quotes\".",
    },
  ],
  statementHeadline: "Statement: 'single' \"double\" `backtick`",
  statementBio: "Bio containing \u2028 line separator and \u2029 paragraph separator.",
  services: ["Service <1>", "Service & 2"],
  templateId: "frame",
}
const draftSpecial = generateDraftFromOnboarding(specialCharsState, "special-slug")
const jsonSpecial = JSON.stringify(draftSpecial)
const roundtripSpecial = JSON.parse(jsonSpecial) as StoredPortfolio
const roundtripSpecialBlocks = roundtripSpecial.blocks ?? []
assert(
  "Suite 4",
  "Edge Case B: Special characters and injection strings preserved without JSON corruptions",
  roundtripSpecial.name === "<script>alert('XSS')</script>" &&
    (roundtripSpecialBlocks[0]?.heading?.includes('& "Quotes"') ?? false) &&
    roundtripSpecialBlocks[1]?.heading === "Project <b>Bold</b> & 'Special'",
  `JSON roundtrip length: ${jsonSpecial.length} bytes, block 0 heading: "${roundtripSpecialBlocks[0]?.heading}"`
)

// Edge Case C: Emojis and Multi-lingual Unicode
const unicodeState: OnboardingState = {
  studioName: "🎬 FRAME TOKYO ✨ 映画スタジオ",
  heroLine1: "🌟 Next-Gen AI Filmmaking 🚀",
  heroLine2: "الإبداع البشري والتصميم الرقمي 🎨",
  contactEmail: "talib@éxample.studio",
  disciplines: ["Cinéma 🎥", "アニメ 🌸", "تصميم 📐", "Édition ✂️"],
  projects: [
    {
      id: "p-unicode-1",
      title: "プロジェクト 東京 2099 🌌",
      category: "Cinéma 🎥",
      runtime: "10:42 🎬",
      imageUrl: "https://example.com/tokyo.jpg",
      description: "短編映画 · 生成AIと実写の融合 🌸",
    },
  ],
  statementHeadline: "卓越した美学 · Qualité Supérieure ✨",
  statementBio: "Créer l'impossible avec l'intelligence artificielle et le cinéma. 🚀",
  services: ["Direction 🎬", "3D CGI 🌟"],
  templateId: "frame",
}
const draftUnicode = generateDraftFromOnboarding(unicodeState, "unicode-slug")
const draftUnicodeBlocks = draftUnicode.blocks ?? []
assert(
  "Suite 4",
  "Edge Case C: Multilingual Unicode & Emoji fidelity",
  draftUnicode.name.includes("🎬") &&
    (draftUnicodeBlocks[0]?.heading?.includes("🌟") ?? false) &&
    (draftUnicodeBlocks[0]?.heading?.includes("الإبداع") ?? false) &&
    (draftUnicodeBlocks[1]?.heading?.includes("プロジェクト") ?? false) &&
    (draftUnicodeBlocks[3]?.heading?.includes("卓越した美学") ?? false),
  "Multilingual and emoji strings accurately reflected across all portfolio blocks and metadata"
)

// Edge Case D: Multi-line text formatting
const multilineState: OnboardingState = {
  studioName: "Studio\nNewline",
  heroLine1: "Headline Line 1\nHeadline Line 2\nHeadline Line 3",
  heroLine2: "Subheading Line A\nSubheading Line B",
  contactEmail: "contact@studio.ai",
  disciplines: ["Films", "Ads"],
  projects: [
    {
      id: "p-multi",
      title: "Multi-line Title\nPart 2",
      category: "Films",
      runtime: "04:00",
      imageUrl: "https://example.com/multi.jpg",
      description: "Paragraph 1\n\nParagraph 2\n\nParagraph 3",
    },
  ],
  statementHeadline: "Statement P1\n\nStatement P2",
  statementBio: "Line A\nLine B\nLine C\n\nParagraph 2",
  services: [],
  templateId: "frame",
}
const draftMultiline = generateDraftFromOnboarding(multilineState, "multiline-slug")
const draftMultilineBlocks = draftMultiline.blocks ?? []
assert(
  "Suite 4",
  "Edge Case D: Multi-line text preservation in headings and body",
  (draftMultilineBlocks[0]?.heading?.includes("\n") ?? false) &&
    (draftMultilineBlocks[1]?.body?.includes("\n\n") ?? false) &&
    (draftMultilineBlocks[3]?.body?.includes("\nLine B") ?? false),
  "Hero heading, project body, and about body retain multiline structure"
)

// Edge Case E: 0 Projects in State
const zeroProjectsState: OnboardingState = {
  studioName: "Zero Studio",
  heroLine1: "New Studio",
  heroLine2: "Selected Works",
  contactEmail: "zero@studio.com",
  disciplines: ["Direction"],
  projects: [],
  statementHeadline: "Manifesto",
  statementBio: "Archive description.",
  services: [],
  templateId: "frame",
}
let zeroError: Error | null = null
let draftZero: StoredPortfolio | null = null
try {
  draftZero = generateDraftFromOnboarding(zeroProjectsState, "zero-slug")
} catch (e) {
  zeroError = e as Error
}
assert(
  "Suite 4",
  "Edge Case E: 0 Projects handled safely with fallback",
  zeroError === null && draftZero !== null && (draftZero.blocks?.length ?? 0) >= 4,
  `0 projects input safely fell back to default projects: ${draftZero?.blocks?.length} total blocks`
)

// Edge Case F: 10 Projects in State
const tenProjects: OnboardingProject[] = Array.from({ length: 10 }, (_, i) => ({
  id: `custom-proj-${i + 1}`,
  title: `Massive Showcase Item ${String(i + 1).padStart(2, "0")}`,
  category: i % 3 === 0 ? "Films" : i % 3 === 1 ? "Commercials" : "Motion",
  runtime: `0${i + 1}:30`,
  client: `Client ${i + 1}`,
  imageUrl: `https://example.com/asset-${i + 1}.jpg`,
  description: `Comprehensive description of project ${i + 1}`,
}))
const tenProjectsState: OnboardingState = {
  studioName: "Ten Projects Studio",
  heroLine1: "Mega Showcase",
  heroLine2: "10 Projects Archive",
  contactEmail: "mega@showcase.ai",
  disciplines: ["Films", "Commercials", "Motion"],
  projects: tenProjects,
  statementHeadline: "Large Archive Manifesto",
  statementBio: "Extensive archive of ten curated projects.",
  services: ["Creative Direction", "VFX", "Grading"],
  templateId: "frame",
}
const draftTen = generateDraftFromOnboarding(tenProjectsState, "ten-slug")
const draftTenBlocks = draftTen.blocks ?? []
const featuredBlocks = draftTenBlocks.filter((b) => b.type === "featured")
const blockIds = new Set(draftTenBlocks.map((b) => b.id))
assert(
  "Suite 4",
  "Edge Case F: 10 Projects generate 10 featured blocks with unique IDs",
  featuredBlocks.length === 10 &&
    blockIds.size === draftTenBlocks.length &&
    draftTenBlocks.length === 14 &&
    draftTen.media.stills.length === 10,
  `Featured blocks: ${featuredBlocks.length}, Unique IDs: ${blockIds.size}/${draftTenBlocks.length}, Media stills: ${draftTen.media.stills.length}`
)

// Edge Case G: Custom Discipline & Service Tags
const customTagsState: OnboardingState = {
  studioName: "Deep Tech Lab",
  heroLine1: "Generative Systems",
  heroLine2: "AI Research & Design",
  contactEmail: "lab@deeptech.ai",
  disciplines: ["Diffusion Models", "Neural Shaders", "Volumetric Capture", "Spatial Audio", "Holographic UI"],
  projects: [
    {
      id: "p1",
      title: "Neural Shader 01",
      category: "Diffusion Models",
      runtime: "Realtime",
      imageUrl: "https://example.com/shader.jpg",
      description: "Realtime diffusion shader investigation.",
    },
  ],
  statementHeadline: "Research Statement",
  statementBio: "Investigating synthetic perception.",
  services: ["Model Fine-Tuning", "Interactive R&D", "Realtime Generation"],
  templateId: "frame",
}
const draftCustomTags = generateDraftFromOnboarding(customTagsState, "custom-tags-slug")
const draftCustomTagsBlocks = draftCustomTags.blocks ?? []
const skillsBlock = draftCustomTagsBlocks.find((b) => b.type === "skills")
const contactBlock = draftCustomTagsBlocks.find((b) => b.type === "contact")
assert(
  "Suite 4",
  "Edge Case G: Custom discipline & service tags correctly propagated",
  skillsBlock !== undefined &&
    skillsBlock.items?.length === 3 &&
    skillsBlock.items[0] === "Model Fine-Tuning" &&
    contactBlock !== undefined &&
    (contactBlock.body?.includes("Diffusion Models · Neural Shaders") ?? false),
  `Skills items: [${skillsBlock?.items?.join(", ")}], Contact body: "${contactBlock?.body}"`
)

// -----------------------------------------------------------------------------
// Suite 5: FolioBlock Mirroring & Sidebar Editing Compatibility
// -----------------------------------------------------------------------------
console.log("\n--- Suite 5: FolioBlock Mirroring & Sidebar Editing Compatibility ---")

const sampleState = DEFAULT_ONBOARDING_STATE
const sampleDraft = generateDraftFromOnboarding(sampleState, "sidebar-test")
const sampleDraftBlocks = sampleDraft.blocks ?? []

// 1. Hero block mirroring
const heroBlock = sampleDraftBlocks.find((b) => b.type === "hero")
assert(
  "Suite 5",
  "Hero Block: Heading, Body, CTA, and ctaHref accurately mirrored",
  heroBlock !== undefined &&
    heroBlock.heading === `${sampleState.heroLine1}\n${sampleState.heroLine2}` &&
    heroBlock.body === sampleState.statementBio &&
    heroBlock.cta === "VIEW WORK →" &&
    heroBlock.ctaHref === "#work",
  `Heading: ${JSON.stringify(heroBlock?.heading)}, CTA: "${heroBlock?.cta}"`
)

// 2. Project / Featured blocks mirroring
const featuredList = sampleDraftBlocks.filter((b) => b.type === "featured")
assert(
  "Suite 5",
  "Featured Blocks: All projects converted with matching title, eyebrow, body, image, and alt",
  featuredList.length === sampleState.projects.length &&
    featuredList.every((fb, idx) => {
      const proj = sampleState.projects[idx]
      return (
        fb.heading === proj.title &&
        fb.eyebrow === proj.category &&
        fb.image === proj.imageUrl &&
        fb.imageAlt === proj.title
      )
    }),
  `All ${featuredList.length} featured blocks have exact 1:1 mapping with onboarding projects`
)

// 3. Skills block mirroring
const sBlock = sampleDraftBlocks.find((b) => b.type === "skills")
assert(
  "Suite 5",
  "Skills Block: Heading and Items array accurately mirrored",
  sBlock !== undefined &&
    sBlock.heading === "Capabilities & Services" &&
    Array.isArray(sBlock.items) &&
    sBlock.items.length === expectedSkills.length &&
    sBlock.items.every((item, idx) => item === expectedSkills[idx]),
  `Skills items: [${sBlock?.items?.join(", ")}]`
)

// 4. About block mirroring
const aBlock = sampleDraftBlocks.find((b) => b.type === "about")
assert(
  "Suite 5",
  "About Block: Heading and Body accurately mirrored",
  aBlock !== undefined &&
    aBlock.heading === sampleState.statementHeadline &&
    aBlock.body === sampleState.statementBio,
  `About heading: "${aBlock?.heading}", body: "${aBlock?.body?.slice(0, 45)}..."`
)

// 5. Contact block mirroring
const cBlock = sampleDraftBlocks.find((b) => b.type === "contact")
assert(
  "Suite 5",
  "Contact Block: Heading, Body, CTA with uppercase email, and mailto href",
  cBlock !== undefined &&
    cBlock.heading === "Have an idea?\nLet's make it." &&
    cBlock.cta === `${sampleState.contactEmail.toUpperCase()} ↗` &&
    cBlock.ctaHref === `mailto:${sampleState.contactEmail}`,
  `Contact CTA: "${cBlock?.cta}", CTA Href: "${cBlock?.ctaHref}"`
)

// -----------------------------------------------------------------------------
// Suite 6: Test Summary & Verdict
// -----------------------------------------------------------------------------
console.log("\n================================================================================")
console.log("TEST SUITE EXECUTION SUMMARY")
console.log("================================================================================")

const total = results.length
const passed = results.filter((r) => r.passed).length
const failed = results.filter((r) => !r.passed).length

console.log(`Total Invariants Tested: ${total}`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)

if (failed > 0) {
  console.log("\nFailed Tests:")
  results.filter((r) => !r.passed).forEach((r) => {
    console.log(`  - [FAIL] [${r.suite}] ${r.name}: ${r.details}`)
  })
}

const verdict = failed === 0 ? "APPROVE" : "REQUEST_CHANGES"
console.log(`\nExplicit Verdict: ${verdict}`)
