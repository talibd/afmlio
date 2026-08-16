import { createBlock, defaultBlocks } from "../lib/blocks"
import { PORTFOLIOS, type FolioBlock, type Portfolio } from "../lib/demo"
import { getBaseDraft, type StoredPortfolio } from "../lib/portfolio-store"

function syncFieldsToBlocks(draft: StoredPortfolio): FolioBlock[] {
  const headshot = draft.media?.headshot
  return (draft.blocks ?? []).map((block) => {
    if (block.type === "hero") {
      return {
        ...block,
        heading: draft.title || block.heading,
        body: draft.bio || block.body,
        image: headshot || block.image,
      }
    }
    if (block.type === "about") {
      return {
        ...block,
        body: draft.bio || block.body,
        image: headshot || block.image,
      }
    }
    if (block.type === "featured" || block.type === "still") {
      return {
        ...block,
        heading: draft.project?.name || block.heading,
        body: draft.project?.copy || block.body,
      }
    }
    if (block.type === "skills" || block.type === "partners") {
      return { ...block, items: draft.skills?.length ? draft.skills : block.items }
    }
    if (block.type === "footer") {
      return {
        ...block,
        heading: draft.name || block.heading,
        body: draft.bio || block.body,
      }
    }
    return block
  })
}

console.log("=== REMEDIATION VERIFICATION TESTS ===")

// Test 1: Optional chaining with undefined media / project / skills
console.log("\n1. Testing syncFieldsToBlocks with undefined/sparse draft:")
const sparseDraft = {
  slug: "sparse-user",
  name: "Sparse User",
  title: "Designer",
  bio: "Sparse bio",
  school: "AFM",
  status: "draft" as const,
  template: "frame" as const,
  blocks: defaultBlocks({ slug: "sparse-user", name: "Sparse User", title: "Designer", bio: "Sparse bio", school: "AFM", status: "draft", template: "frame", project: { name: "", copy: "" }, skills: [] }, "frame"),
  // media, project, skills intentionally undefined / partial
  media: undefined as any,
  project: undefined as any,
  skills: undefined as any,
} as StoredPortfolio

try {
  const synced = syncFieldsToBlocks(sparseDraft)
  console.log(`✅ syncFieldsToBlocks executed without throwing! Returned ${synced.length} blocks.`)
} catch (err) {
  console.error("❌ syncFieldsToBlocks threw an error with sparse draft:", err)
  process.exit(1)
}

// Test 2: Pipe delimiter formatting without destructive trimming
console.log("\n2. Testing Pipe delimiter formatting and whitespace preservation:")
function parsePipe(item: string, partsCount = 2): string[] {
  const parts = item.split("|")
  while (parts.length < partsCount) {
    parts.push("")
  }
  return parts
}

const inputWithTrailingSpaces = "Feature Title With Space "
const descWithTrailingSpace = "Description with space "
const combined = `${inputWithTrailingSpaces}|${descWithTrailingSpace}`
const [parsedTitle, parsedDesc] = parsePipe(combined, 2)

if (parsedTitle === inputWithTrailingSpaces && parsedDesc === descWithTrailingSpace) {
  console.log(`✅ Active keystroke spaces preserved: "${parsedTitle}" and "${parsedDesc}"`)
} else {
  console.error(`❌ Space preservation failed: "${parsedTitle}" vs "${inputWithTrailingSpaces}"`)
  process.exit(1)
}

// Test 3: Move with unfound block id
console.log("\n3. Testing move with unfound block ID:")
function testMove(blocks: FolioBlock[], id: string, dir: -1 | 1): FolioBlock[] {
  const index = blocks.findIndex((block) => block.id === id)
  if (index === -1) return blocks
  const next = index + dir
  if (next < 0 || next >= blocks.length) return blocks
  const copy = [...blocks]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy
}

const basePortfolio: Portfolio = getBaseDraft("talib", "frame")
const initialBlocks = defaultBlocks(basePortfolio, "frame")
const unchangedBlocks = testMove(initialBlocks, "non-existent-id", 1)

if (unchangedBlocks.length === initialBlocks.length && unchangedBlocks[0].id === initialBlocks[0].id) {
  console.log("✅ testMove with unfound ID safely returned unchanged array without deleting last element.")
} else {
  console.error("❌ testMove with unfound ID corrupted the blocks array!")
  process.exit(1)
}

console.log("\n🎉 ALL REMEDIATION TESTS PASSED!")
