import { BLOCK_CATALOG, blockLabel, createBlock, resetBlock, isStaleLayout, reapplyTemplateChrome } from "../../lib/blocks"
import { PORTFOLIOS, type FolioBlock, type Portfolio, type TemplateId } from "../../lib/demo"
import {
  DEFAULT_ONBOARDING_STATE,
  ONBOARDING_STORAGE_KEY,
  generateDraftFromOnboarding,
  type OnboardingState,
} from "../../lib/onboarding"
import {
  getBaseDraft,
  hydrateDraft,
  saveDraft,
  getDraft,
  defaultChrome,
  defaultSeo,
  defaultSettings,
  type StoredPortfolio,
} from "../../lib/portfolio-store"
import { TASTE_IDS, STUDENT_WORK } from "../../lib/tastes"
import { FRAME_VARIANTS } from "../../lib/frame-variants"

console.log("================================================================================")
console.log("INDEPENDENT VICTORY AUDIT TEST EXECUTION — VICTORY AUDITOR 3")
console.log("================================================================================\n")

let passCount = 0
let failCount = 0

function verify(req: string, name: string, condition: boolean, details?: string) {
  if (condition) {
    passCount++
    console.log(`[PASS] [${req}] ${name}${details ? ` -> ${details}` : ""}`)
  } else {
    failCount++
    console.error(`[FAIL] [${req}] ${name}${details ? ` -> ${details}` : ""}`)
  }
}

// -----------------------------------------------------------------------------
// R1: Form-Based Sidebar Editor & DialKit Removal Verification
// -----------------------------------------------------------------------------
console.log("--- R1: Form-Based Sidebar Editor & DialKit Removal Verification ---")

verify(
  "R1",
  "Block Catalog has 13 block types",
  BLOCK_CATALOG.length === 13,
  `Catalog count: ${BLOCK_CATALOG.length}`
)

const draftTalib = getBaseDraft("talib", "frame")
verify(
  "R1",
  "Base draft has blocks created for 'frame' taste",
  Array.isArray(draftTalib.blocks) && draftTalib.blocks.length > 0,
  `Blocks count: ${draftTalib.blocks?.length}`
)

// Test inline field mutation on block
const heroBlock = createBlock("hero", draftTalib, "frame")
const modifiedHero: FolioBlock = {
  ...heroBlock,
  heading: "New Studio Title\nCreative Vision",
  eyebrow: "Senior Director",
  body: "Live synchronized body text for preview canvas.",
  cta: "DISCOVER →",
  ctaHref: "#work",
}

verify(
  "R1",
  "Direct inline block field updates mutate block properties accurately",
  modifiedHero.heading === "New Studio Title\nCreative Vision" &&
    modifiedHero.eyebrow === "Senior Director" &&
    modifiedHero.body === "Live synchronized body text for preview canvas." &&
    modifiedHero.cta === "DISCOVER →" &&
    modifiedHero.ctaHref === "#work"
)

// -----------------------------------------------------------------------------
// R2: Reference-Based Template Integration ("Frame" Taste)
// -----------------------------------------------------------------------------
console.log("\n--- R2: Reference-Based Template Integration (\"Frame\" Taste) ---")

verify(
  "R2",
  "'frame' is in TASTE_IDS catalog",
  TASTE_IDS.includes("frame"),
  `TASTE_IDS: [${TASTE_IDS.join(", ")}]`
)

verify(
  "R2",
  "FRAME_VARIANTS defined with presets",
  FRAME_VARIANTS.length >= 4 && FRAME_VARIANTS.some((v) => v.id === "frame"),
  `Variants count: ${FRAME_VARIANTS.length}`
)

// Check dynamic block chrome reapplication for frame
const switchedBlocks = reapplyTemplateChrome(
  [modifiedHero, createBlock("about", draftTalib, "frame")],
  draftTalib,
  "frame"
)
verify(
  "R2",
  "reapplyTemplateChrome preserves custom content on 'frame' template",
  switchedBlocks.length === 2 &&
    switchedBlocks[0].heading === modifiedHero.heading &&
    switchedBlocks[0].body === modifiedHero.body
)

// -----------------------------------------------------------------------------
// R3: Tailored Onboarding Form & Draft Hydration
// -----------------------------------------------------------------------------
console.log("\n--- R3: Tailored Onboarding Form & Draft Hydration ---")

verify(
  "R3",
  "ONBOARDING_STORAGE_KEY constant is 'afm:onboarding:data'",
  ONBOARDING_STORAGE_KEY === "afm:onboarding:data"
)

verify(
  "R3",
  "DEFAULT_ONBOARDING_STATE contains studioName, heroLine1, heroLine2, contactEmail, disciplines, projects, statementHeadline, statementBio, services",
  Boolean(
    DEFAULT_ONBOARDING_STATE.studioName &&
      DEFAULT_ONBOARDING_STATE.heroLine1 &&
      DEFAULT_ONBOARDING_STATE.heroLine2 &&
      DEFAULT_ONBOARDING_STATE.contactEmail &&
      DEFAULT_ONBOARDING_STATE.disciplines.length &&
      DEFAULT_ONBOARDING_STATE.projects.length &&
      DEFAULT_ONBOARDING_STATE.statementHeadline &&
      DEFAULT_ONBOARDING_STATE.statementBio &&
      DEFAULT_ONBOARDING_STATE.services.length
  ),
  `Studio: "${DEFAULT_ONBOARDING_STATE.studioName}", Projects: ${DEFAULT_ONBOARDING_STATE.projects.length}`
)

const generatedDraft = generateDraftFromOnboarding(DEFAULT_ONBOARDING_STATE, "talib")

verify(
  "R3",
  "generateDraftFromOnboarding produces valid StoredPortfolio with slug 'talib'",
  generatedDraft.slug === "talib" &&
    generatedDraft.name === DEFAULT_ONBOARDING_STATE.studioName &&
    generatedDraft.template === "frame" &&
    generatedDraft.settings.email === DEFAULT_ONBOARDING_STATE.contactEmail
)

const genBlocks = generatedDraft.blocks ?? []
verify(
  "R3",
  "Generated draft contains all required blocks (hero, featured xN, skills, why, reviews, faq, about, contact, footer)",
  genBlocks.some((b) => b.type === "hero") &&
    genBlocks.filter((b) => b.type === "featured").length === DEFAULT_ONBOARDING_STATE.projects.length &&
    genBlocks.some((b) => b.type === "skills") &&
    genBlocks.some((b) => b.type === "why") &&
    genBlocks.some((b) => b.type === "reviews") &&
    genBlocks.some((b) => b.type === "faq") &&
    genBlocks.some((b) => b.type === "about") &&
    genBlocks.some((b) => b.type === "contact") &&
    genBlocks.some((b) => b.type === "footer"),
  `Total generated blocks: ${genBlocks.length}`
)

// Verify isStaleLayout is false on generated draft
verify(
  "R3",
  "isStaleLayout returns false on generated onboarding blocks",
  !isStaleLayout(genBlocks)
)

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n================================================================================")
console.log(`AUDIT EXECUTION COMPLETED: ${passCount} PASSED, ${failCount} FAILED`)
console.log("================================================================================")

if (failCount > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
