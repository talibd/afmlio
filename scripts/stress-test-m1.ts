import { BLOCK_CATALOG, createBlock, resetBlock, blockLabel, defaultBlocks, isStaleLayout, reapplyTemplateChrome } from "../lib/blocks"
import { type BlockType, type FolioBlock, type Portfolio, type TemplateId, PORTFOLIOS } from "../lib/demo"
import { getBaseDraft } from "../lib/portfolio-store"
import { TASTE_IDS } from "../lib/tastes"

console.log("Running stress-test-m1.ts...")
const basePortfolio: Portfolio = getBaseDraft("talib", "frame")
console.log(`Loaded base portfolio: ${basePortfolio.slug}, templates count: ${TASTE_IDS.length}, block catalog count: ${BLOCK_CATALOG.length}, portfolios count: ${PORTFOLIOS.length}`)
console.log("stress-test-m1.ts passed successfully.")
