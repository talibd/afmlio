import { BLOCK_CATALOG, createBlock, resetBlock, blockLabel, defaultBlocks, isStaleLayout, reapplyTemplateChrome } from "../lib/blocks"
import { type BlockType, type FolioBlock, type Portfolio, type TemplateId, PORTFOLIOS } from "../lib/demo"
import { getBaseDraft } from "../lib/portfolio-store"
import { TASTE_IDS } from "../lib/tastes"

interface TestResult {
  suite: string
  name: string
  passed: boolean
  error?: string
  details?: unknown
}

const results: TestResult[] = []

function assert(suite: string, name: string, condition: boolean, details?: unknown) {
  if (!condition) {
    results.push({ suite, name, passed: false, error: `Assertion failed`, details })
    console.error(`❌ [${suite}] FAIL: ${name}`, details ? JSON.stringify(details) : "")
  } else {
    results.push({ suite, name, passed: true })
    console.log(`✅ [${suite}] PASS: ${name}`)
  }
}

console.log("================================================================")
console.log("CHALLENGER 1: EMPIRICAL VERIFICATION & STRESS TEST HARNESS (M1)")
console.log("================================================================")

const ALL_BLOCK_TYPES: BlockType[] = [
  "hero",
  "still",
  "skills",
  "why",
  "reviews",
  "faq",
  "cta",
  "footer",
  "partners",
  "features",
  "featured",
  "about",
  "contact",
]

const ALL_TEMPLATES = TASTE_IDS
const basePortfolio: Portfolio = getBaseDraft("talib", "frame")

// ============================================================================
// SUITE 1: 13 Block Types & Catalog Completeness
// ============================================================================
console.log("\n--- Suite 1: 13 Block Types & Catalog Completeness ---")
assert(
  "Suite 1",
  "BLOCK_CATALOG contains all 13 block types",
  BLOCK_CATALOG.length === 13,
  { count: BLOCK_CATALOG.length }
)

for (const type of ALL_BLOCK_TYPES) {
  const catalogEntry = BLOCK_CATALOG.find((b) => b.type === type)
  assert(
    "Suite 1",
    `Block type '${type}' exists in catalog with label '${catalogEntry?.label}'`,
    !!catalogEntry
  )
  assert(
    "Suite 1",
    `blockLabel('${type}') returns '${catalogEntry?.label}'`,
    blockLabel(type) === catalogEntry?.label
  )

  // Test block creation across all 6 templates
  for (const template of ALL_TEMPLATES) {
    const block = createBlock(type, basePortfolio, template)
    assert(
      "Suite 1",
      `createBlock('${type}', template='${template}') creates valid block with ID ${block.id}`,
      !!block && block.type === type && typeof block.id === "string" && block.id.length > 0
    )
    assert(
      "Suite 1",
      `Block '${type}' on '${template}' has defined heading`,
      typeof block.heading === "string"
    )
    assert(
      "Suite 1",
      `Block '${type}' on '${template}' has defined layout with maxWidth`,
      block.layout !== undefined && typeof block.layout.maxWidth === "number"
    )
  }
}

// ============================================================================
// SUITE 2: List Parsing & Pipe Delimiters Stress Test
// ============================================================================
console.log("\n--- Suite 2: List Parsing & Pipe Delimiters Stress Test ---")

function parsePipe(item: string, partsCount = 2): string[] {
  const parts = item.split("|").map((p) => p.trim())
  while (parts.length < partsCount) {
    parts.push("")
  }
  return parts
}

const pipeCases = [
  { input: "Design System | Built with React", parts: 2, expected: ["Design System", "Built with React"] },
  { input: "No Delimiter Text", parts: 2, expected: ["No Delimiter Text", ""] },
  { input: "No Delimiter Text", parts: 4, expected: ["No Delimiter Text", "", "", ""] },
  { input: "", parts: 2, expected: ["", ""] },
  { input: "  Spaces   |   More Spaces   ", parts: 2, expected: ["Spaces", "More Spaces"] },
  { input: "A | B | C | D | E", parts: 2, expected: ["A", "B", "C", "D", "E"] },
  { input: "Quote | Author | Role | https://avatar.url/img.png", parts: 4, expected: ["Quote", "Author", "Role", "https://avatar.url/img.png"] },
  { input: "Special & Characters < > \" ' | Desc with $#%@!*", parts: 2, expected: ["Special & Characters < > \" '", "Desc with $#%@!*"] },
]

for (const [idx, tc] of pipeCases.entries()) {
  const parsed = parsePipe(tc.input, tc.parts)
  const ok = tc.expected.every((val, i) => parsed[i] === val)
  assert(
    "Suite 2",
    `Pipe Case ${idx + 1}: "${tc.input}" (${tc.parts} parts)`,
    ok,
    { parsed, expected: tc.expected }
  )
}

// ============================================================================
// SUITE 3: Sidebar State Mutations & Invariant Preservation
// ============================================================================
console.log("\n--- Suite 3: Sidebar State Mutations & Invariant Preservation ---")

let currentBlocks: FolioBlock[] = defaultBlocks(basePortfolio, "frame")
const initialCount = currentBlocks.length
assert("Suite 3", "Initial default blocks created successfully", initialCount > 0, { initialCount })

// 3.1 Addition of every block type
for (const type of ALL_BLOCK_TYPES) {
  const prevLen = currentBlocks.length
  const newBlock = createBlock(type, basePortfolio, "frame")
  currentBlocks = [...currentBlocks, newBlock]
  assert(
    "Suite 3",
    `Addition: Added block of type '${type}', total blocks: ${currentBlocks.length}`,
    currentBlocks.length === prevLen + 1 && currentBlocks[currentBlocks.length - 1].type === type
  )
}

// 3.2 Duplication
const blockToDup = currentBlocks[2]
const dupIndex = 2
const dupCopy: FolioBlock = {
  ...blockToDup,
  id: `${blockToDup.type}-${Math.random().toString(36).slice(2, 8)}`,
}
const nextAfterDup = [...currentBlocks]
nextAfterDup.splice(dupIndex + 1, 0, dupCopy)
currentBlocks = nextAfterDup
assert(
  "Suite 3",
  `Duplication: Duplicated block '${blockToDup.id}' -> '${dupCopy.id}' with unique ID`,
  currentBlocks[dupIndex + 1].id === dupCopy.id && currentBlocks[dupIndex + 1].id !== blockToDup.id
)

// 3.3 Reordering (Move Up / Move Down)
function move(blocks: FolioBlock[], id: string, dir: -1 | 1): FolioBlock[] {
  const index = blocks.findIndex((block) => block.id === id)
  if (index === -1) return blocks
  const next = index + dir
  if (next < 0 || next >= blocks.length) return blocks
  const copy = [...blocks]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy
}

const unfoundMove = move(currentBlocks, "non-existent-id-12345", 1)
assert("Suite 3", "Unfound ID: Moving non-existent block ID is safe no-op", unfoundMove.length === currentBlocks.length)

const firstId = currentBlocks[0].id
const afterNoOpUp = move(currentBlocks, firstId, -1)
assert("Suite 3", "Reorder Boundary: Moving top block UP is safe no-op", afterNoOpUp[0].id === firstId)

const lastId = currentBlocks[currentBlocks.length - 1].id
const afterNoOpDown = move(currentBlocks, lastId, 1)
assert("Suite 3", "Reorder Boundary: Moving bottom block DOWN is safe no-op", afterNoOpDown[afterNoOpDown.length - 1].id === lastId)

const targetBlock = currentBlocks[5]
const movedUp = move(currentBlocks, targetBlock.id, -1)
assert("Suite 3", "Reorder: Moving block 5 UP places it at index 4", movedUp[4].id === targetBlock.id && movedUp[5].id !== targetBlock.id)

const movedDown = move(movedUp, targetBlock.id, 1)
assert("Suite 3", "Reorder: Moving block 4 DOWN restores it to index 5", movedDown[5].id === targetBlock.id)
currentBlocks = movedDown

// 3.4 Property Updates (BlockForm mutations)
function updateBlock(blocks: FolioBlock[], id: string, patch: Partial<FolioBlock>): FolioBlock[] {
  return blocks.map((b) => (b.id === id ? { ...b, ...patch } : b))
}

const updateTargetId = currentBlocks[0].id
currentBlocks = updateBlock(currentBlocks, updateTargetId, {
  heading: "New Custom Title 123",
  eyebrow: "Senior Director",
  body: "Custom body copy testing real-time state sync.",
  cta: "Hire Us",
  ctaHref: "#contact",
  cta2: "View Reel",
  cta2Href: "#work",
  image: "https://example.com/custom.jpg",
  imageAlt: "Custom Image Alt",
})

const updated = currentBlocks.find((b) => b.id === updateTargetId)!
assert(
  "Suite 3",
  "Update: All block properties updated synchronously and accurately",
  updated.heading === "New Custom Title 123" &&
    updated.eyebrow === "Senior Director" &&
    updated.body === "Custom body copy testing real-time state sync." &&
    updated.cta === "Hire Us" &&
    updated.ctaHref === "#contact" &&
    updated.cta2 === "View Reel" &&
    updated.cta2Href === "#work" &&
    updated.image === "https://example.com/custom.jpg" &&
    updated.imageAlt === "Custom Image Alt"
)

// 3.5 List Item Mutations (Skills, Features, Reviews, FAQ)
const skillsBlock = currentBlocks.find((b) => b.type === "skills")!
const originalSkills = skillsBlock.items ?? []
const updatedSkills = [...originalSkills, "Next.js", "Tailwind CSS", "TypeScript"]
currentBlocks = updateBlock(currentBlocks, skillsBlock.id, { items: updatedSkills })
assert(
  "Suite 3",
  "List Mutation: Skills items appended and synced",
  currentBlocks.find((b) => b.id === skillsBlock.id)?.items?.includes("Next.js") === true
)

const faqBlock = currentBlocks.find((b) => b.type === "faq")!
const newFaqItem = "What is the turnaround time? | Typical studio projects take 2 to 4 weeks."
const updatedFaqs = [...(faqBlock.items ?? []), newFaqItem]
currentBlocks = updateBlock(currentBlocks, faqBlock.id, { items: updatedFaqs })
assert(
  "Suite 3",
  "List Mutation: FAQ question/answer pipe item added and synced",
  currentBlocks.find((b) => b.id === faqBlock.id)?.items?.some((item) => item.startsWith("What is the turnaround")) === true
)

// 3.6 Reset Block
const resetResult = resetBlock(updated, basePortfolio, "frame")
assert(
  "Suite 3",
  `Reset: resetBlock restored defaults for '${updated.type}' while preserving ID '${updated.id}'`,
  resetResult.id === updated.id && resetResult.heading !== "New Custom Title 123"
)

// 3.7 Removal & Single Block Protection
function remove(blocks: FolioBlock[], id: string): FolioBlock[] {
  if (blocks.length <= 1) return blocks
  return blocks.filter((b) => b.id !== id)
}

while (currentBlocks.length > 1) {
  const idToRemove = currentBlocks[0].id
  const prevLen = currentBlocks.length
  currentBlocks = remove(currentBlocks, idToRemove)
  assert(
    "Suite 3",
    `Removal: Removed block '${idToRemove}', remaining: ${currentBlocks.length}`,
    currentBlocks.length === prevLen - 1 && !currentBlocks.some((b) => b.id === idToRemove)
  )
}

const lastRemainingId = currentBlocks[0].id
const afterAttemptRemoveLast = remove(currentBlocks, lastRemainingId)
assert(
  "Suite 3",
  "Single Block Protection: Removing the only remaining block is prevented",
  afterAttemptRemoveLast.length === 1 && afterAttemptRemoveLast[0].id === lastRemainingId
)

// ============================================================================
// SUITE 4: Canvas Event Detachment & Read-Only Invariants
// ============================================================================
console.log("\n--- Suite 4: Canvas Event Detachment & Read-Only Invariants ---")

function hitHelper(
  blockId: string,
  kind: string,
  selectedId?: string,
  selectedKind?: string | null,
  onSelectElement?: (id: string, kind: string) => void,
) {
  if (!onSelectElement) return {}
  const isSelected = selectedId === blockId && selectedKind === kind
  return {
    onClick: () => onSelectElement(blockId, kind),
    className: `outline ${isSelected ? "ring-2" : ""}`,
  }
}

function blockHitHelper(
  blockId: string,
  selectedId?: string,
  selectedKind?: string | null,
  onSelectBlock?: (id: string) => void,
) {
  if (!onSelectBlock) return {}
  const isBlockSelected = selectedId === blockId && !selectedKind
  return {
    onClick: () => onSelectBlock(blockId),
    className: `cursor-pointer ${isBlockSelected ? "ring-2" : ""}`,
  }
}

// 4.1 In FolioCanvas, onSelectElement and onSelectBlock are omitted -> hit helpers return empty {}
const detachedElementHit = hitHelper("hero-1", "heading", "hero-1", "heading", undefined)
assert(
  "Suite 4",
  "Canvas Read-Only: hitHelper returns empty object (no onClick, no outline)",
  Object.keys(detachedElementHit).length === 0 && (detachedElementHit as { onClick?: unknown }).onClick === undefined
)

const detachedBlockHit = blockHitHelper("hero-1", "hero-1", null, undefined)
assert(
  "Suite 4",
  "Canvas Read-Only: blockHitHelper returns empty object (no onClick, no ring)",
  Object.keys(detachedBlockHit).length === 0 && (detachedBlockHit as { onClick?: unknown }).onClick === undefined
)

// ============================================================================
// SUITE 5: Undo / Redo History State Machine
// ============================================================================
console.log("\n--- Suite 5: Undo / Redo History State Machine ---")

class HistorySimulator<T> {
  past: T[] = []
  future: T[] = []
  present: T
  maxHistory = 50

  constructor(initial: T) {
    this.present = initial
  }

  set(next: T | ((prev: T) => T)) {
    const val = typeof next === "function" ? (next as (prev: T) => T)(this.present) : next
    this.past = [...this.past, this.present].slice(-this.maxHistory)
    this.future = []
    this.present = val
  }

  undo(): boolean {
    if (!this.past.length) return false
    const last = this.past[this.past.length - 1]
    this.past = this.past.slice(0, -1)
    this.future = [this.present, ...this.future].slice(0, this.maxHistory)
    this.present = last
    return true
  }

  redo(): boolean {
    if (!this.future.length) return false
    const [first, ...rest] = this.future
    this.future = rest
    this.past = [...this.past, this.present].slice(-this.maxHistory)
    this.present = first
    return true
  }

  canUndo(): boolean {
    return this.past.length > 0
  }

  canRedo(): boolean {
    return this.future.length > 0
  }
}

const history = new HistorySimulator<string>("v0: initial")
assert("Suite 5", "Undo/Redo: Initial state has canUndo=false, canRedo=false", !history.canUndo() && !history.canRedo())

history.set("v1: heading edited")
assert("Suite 5", "Undo/Redo: Edit 1 enables canUndo, present is v1", history.canUndo() && !history.canRedo() && history.present === "v1: heading edited")

history.set("v2: eyebrow edited")
history.set("v3: cta edited")
assert("Suite 5", "Undo/Redo: 3 edits recorded in past stack", history.past.length === 3 && history.present === "v3: cta edited")

const undo1 = history.undo()
assert("Suite 5", "Undo/Redo: Undo 1 restores v2, canRedo=true", undo1 && history.present === "v2: eyebrow edited" && history.canRedo())

const undo2 = history.undo()
assert("Suite 5", "Undo/Redo: Undo 2 restores v1", undo2 && history.present === "v1: heading edited" && history.past.length === 1)

const redo1 = history.redo()
assert("Suite 5", "Undo/Redo: Redo 1 restores v2", redo1 && history.present === "v2: eyebrow edited")

history.set("v2.1: new divergent edit")
assert("Suite 5", "Undo/Redo: New edit clears future stack (canRedo=false)", history.present === "v2.1: new divergent edit" && !history.canRedo())

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log("\n================================================================")
const failed = results.filter((r) => !r.passed)
if (failed.length === 0) {
  console.log(`🎉 ALL ${results.length} STRESS TESTS PASSED SUCCESSFULLY!`)
} else {
  console.error(`💥 ${failed.length} OF ${results.length} TESTS FAILED!`)
  process.exit(1)
}
console.log("================================================================")
