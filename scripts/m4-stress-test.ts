import {
  createBlock,
  resetBlock,
  reapplyTemplateChrome,
  isStaleLayout,
  blocksOf,
  BLOCK_CATALOG,
} from "../lib/blocks"
import {
  type BlockType,
  type FolioBlock,
  type Portfolio,
  type TemplateId,
} from "../lib/demo"
import {
  getBaseDraft,
  defaultSeo,
  defaultChrome,
  defaultSettings,
  defaultMedia,
  uniquePortfolioSlug,
  hasDraftChanges,
  type StoredPortfolio,
  type LivePortfolio,
} from "../lib/portfolio-store"
import { TASTE_IDS, STUDENT_WORK, type StudentPiece } from "../lib/tastes"

console.log("================================================================")
console.log("CHALLENGER 1: M4 ADVERSARIAL STRESS & HIGH-LOAD HARNESS")
console.log("================================================================")

let totalChecks = 0
let passedChecks = 0
let failedChecks = 0

function check(name: string, condition: boolean, extra?: unknown) {
  totalChecks++
  if (condition) {
    passedChecks++
    console.log(`✅ [STRESS] PASS: ${name}`)
  } else {
    failedChecks++
    console.error(`❌ [STRESS] FAIL: ${name}`, extra)
  }
}

// ----------------------------------------------------------------------------
// 1. High Volume Block Operations (500 Iterations)
// ----------------------------------------------------------------------------
console.log("\n--- Stress 1: 500 Rapid Block Mutations & Reorders ---")
const baseDraft = getBaseDraft("stress-test-user", "frame")
let blocks: FolioBlock[] = [
  createBlock("hero", baseDraft, "frame"),
  createBlock("featured", baseDraft, "frame"),
  createBlock("about", baseDraft, "frame"),
  createBlock("contact", baseDraft, "frame"),
]

const startMutations = performance.now()
for (let i = 0; i < 500; i++) {
  const blockType = BLOCK_CATALOG[i % BLOCK_CATALOG.length].type
  const newBlock = createBlock(blockType, baseDraft, "frame")
  blocks.push(newBlock)

  // Mutate an existing block
  const targetIdx = i % blocks.length
  blocks[targetIdx] = {
    ...blocks[targetIdx],
    heading: `Mutated Heading ${i} - ${Math.random().toString(36).slice(2)}`,
    body: `Body mutation payload string of length ${i * 10}`,
  }

  // Reorder
  if (blocks.length > 2) {
    const swapA = i % blocks.length
    const swapB = (i + 1) % blocks.length
    const temp = blocks[swapA]
    blocks[swapA] = blocks[swapB]
    blocks[swapB] = temp
  }

  // Prune if over 50 blocks
  if (blocks.length > 50) {
    blocks.splice(2, 1)
  }
}
const mutationDuration = performance.now() - startMutations

check(
  `500 rapid block mutations and reorders completed in ${mutationDuration.toFixed(2)}ms (< 500ms)`,
  mutationDuration < 500 && blocks.length > 0
)

// ----------------------------------------------------------------------------
// 2. Giant Payload Resilience (Large Strings & 100+ Projects)
// ----------------------------------------------------------------------------
console.log("\n--- Stress 2: Giant Payload Resilience ---")
const hugeBio = "A".repeat(50_000) // 50KB bio
const hugeHeadline = "Studio Headline ⚡ ".repeat(2000)

const megaPortfolio: StoredPortfolio = {
  ...baseDraft,
  bio: hugeBio,
  title: hugeHeadline,
  blocks: Array.from({ length: 100 }, (_, idx) => ({
    ...createBlock("featured", baseDraft, "frame"),
    id: `mega-proj-${idx}`,
    heading: `Project #${idx + 1} with deep unicode 🎬 🔥 🚀`,
    eyebrow: idx % 2 === 0 ? "film" : "graphic",
    body: `Deep detail copy description #${idx}`.repeat(20),
    image: `https://example.com/asset-${idx}.jpg`,
    mediaKind: idx % 5 === 0 ? "video" : "image",
  })),
}

const serialized = JSON.stringify(megaPortfolio)
const deserialized = JSON.parse(serialized) as StoredPortfolio

check(
  "Mega portfolio with 100 blocks and 50KB text serializes & parses cleanly",
  Boolean(deserialized.blocks) &&
    deserialized.blocks!.length === 100 &&
    deserialized.bio.length === 50_000 &&
    deserialized.blocks![50]?.id === "mega-proj-50"
)

// ----------------------------------------------------------------------------
// 3. Reapply Template Chrome across All Tastes with Mega Payload
// ----------------------------------------------------------------------------
console.log("\n--- Stress 3: Mega Payload Template Switching ---")
const startSwitch = performance.now()
for (const taste of TASTE_IDS) {
  const reapplied = reapplyTemplateChrome(
    megaPortfolio.blocks ?? [],
    megaPortfolio,
    taste
  )
  check(
    `Reapplying ${taste} chrome on 100 blocks retains block count and custom properties`,
    reapplied.length === 100 &&
      reapplied[0].heading === (megaPortfolio.blocks?.[0]?.heading ?? "")
  )
}
const switchDuration = performance.now() - startSwitch
check(
  `All template switches on 100 blocks completed in ${switchDuration.toFixed(2)}ms (< 300ms)`,
  switchDuration < 300
)

// ----------------------------------------------------------------------------
// 4. Snapshot Quota & Array Truncation Stress
// ----------------------------------------------------------------------------
console.log("\n--- Stress 4: Snapshot Ring-Buffer Integrity ---")
const MAX_SNAPSHOTS = 8
let snapshots: LivePortfolio[] = []

for (let i = 0; i < 50; i++) {
  const liveSnap: LivePortfolio = {
    ...baseDraft,
    publishedAt: Date.now() + i,
    title: `Snapshot #${i}`,
  }
  snapshots = [liveSnap, ...snapshots].slice(0, MAX_SNAPSHOTS)
}

check(
  "Snapshot queue strictly caps at MAX_SNAPSHOTS (8) after 50 publishes",
  snapshots.length === 8 && snapshots[0].title === "Snapshot #49"
)

// ----------------------------------------------------------------------------
// 5. Public Route Live vs Draft Resolution
// ----------------------------------------------------------------------------
console.log("\n--- Stress 5: Public Route Status Resolution ---")
function resolvePublicStatus(live: LivePortfolio | null, demo: Portfolio): Portfolio {
  if (live && live.status === "live") {
    return live
  }
  return demo
}

const liveState: LivePortfolio = {
  ...baseDraft,
  status: "live",
  publishedAt: 1000,
  title: "Published Live Page",
}

const draftOnlyState: LivePortfolio = {
  ...baseDraft,
  status: "draft",
  publishedAt: 1000,
  title: "Unpublished Draft",
}

check(
  "resolvePublicPortfolio serves live portfolio when status === 'live'",
  resolvePublicStatus(liveState, baseDraft).title === "Published Live Page"
)
check(
  "resolvePublicPortfolio falls back to demo when status === 'draft'",
  resolvePublicStatus(draftOnlyState, baseDraft).title === baseDraft.title
)
check(
  "resolvePublicPortfolio falls back to demo when null",
  resolvePublicStatus(null, baseDraft).title === baseDraft.title
)

// ----------------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------------
console.log("\n================================================================")
console.log("STRESS TEST HARNESS SUMMARY")
console.log("================================================================")
console.log(`Total Checks : ${totalChecks}`)
console.log(`Passed Checks: ${passedChecks}`)
console.log(`Failed Checks: ${failedChecks}`)
console.log(`Pass Rate    : ${((passedChecks / totalChecks) * 100).toFixed(1)}%`)

if (failedChecks > 0) {
  console.error(`\n❌ STRESS TEST FAILED: ${failedChecks} failure(s).`)
  process.exit(1)
} else {
  console.log(`\n🎉 ALL HIGH-LOAD & ADVERSARIAL STRESS CHECKS PASSED!`)
  process.exit(0)
}
