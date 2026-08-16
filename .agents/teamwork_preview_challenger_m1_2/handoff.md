# Milestone M1 Adversarial Review & Stress-Test Report (Challenger 2)

## 1. Observation

1. **Block Catalog & Types**:
   - `lib/blocks.ts` (lines 13-27): `BLOCK_CATALOG` defines 13 block types: `hero`, `partners`, `features`, `why`, `reviews`, `faq`, `cta`, `footer`, `still`, `skills`, `about`, `featured`, `contact`.
   - `lib/blocks.ts` (lines 123-212): `createBlock` provides tailored seed data, fallback copy, and template layouts for all 13 block types across all 6 templates (`frame`, `walk`, `flood`, `signal`, `craft`, `bold`).

2. **`BlockSidebar` Inline Form Architecture**:
   - `components/block-sidebar.tsx` (lines 611-842): `BlockForm` dynamically reveals inline form fields based on block type:
     - `heading`: Input field for all block types.
     - `eyebrow`: Input field for `hero`, `about`, `featured`, `still`, `cta`, `contact`, `features`, `why`, `reviews`, `faq`.
     - `body`: Textarea for all block types except `skills` and `partners`.
     - `image` + `imageAlt`: URL input, file upload via `persistImageFile`, and live image preview for `hero`, `about`, `featured`, `still`, `features`.
     - `cta` & `ctaHref`: Primary action inputs for `hero`, `about`, `featured`, `still`, `cta`, `contact`, `footer`.
     - `cta2` & `cta2Href`: Secondary action inputs for `hero`, `cta`, `contact`.
     - `items`: Structured list editors:
       - `skills`, `partners`: `SkillsListEditor` with item inputs, move up/down, delete, add item, and comma-separated bulk addition.
       - `features`, `why`: `FeaturesListEditor` with 2-part pipe-delimited title and description editors.
       - `reviews`: `ReviewsListEditor` with 4-part pipe-delimited quote, author, role, and avatar editors.
       - `faq`: `FaqListEditor` with 2-part pipe-delimited question and answer editors.

3. **Block Operations & Boundary Safeguards**:
   - `components/block-sidebar.tsx` (lines 863-871): `move(id, dir)` guards against out-of-bounds shifting (`next < 0 || next >= blocks.length` returns early).
   - `components/block-sidebar.tsx` (lines 873-885): `duplicate(id)` assigns a unique ID (`${block.type}-${Math.random().toString(36).slice(2, 8)}`) and splices the clone immediately below.
   - `components/block-sidebar.tsx` (lines 887-890, 1059): `remove(id)` enforces `if (blocks.length <= 1) return` and the menu item is disabled when `blocks.length <= 1`, preventing deletion of the last remaining block.
   - `components/block-sidebar.tsx` (lines 898-906): `reset(id)` restores the block's original defaults while retaining the existing block ID.
   - `components/block-sidebar.tsx` (lines 908-912): `updateBlock(id, patch)` synchronizes changes directly to `onBlocks`.

4. **Canvas Read-Only Verification**:
   - `components/portfolio-editor.tsx` (lines 304-307): `FolioCanvas` is rendered strictly with `portfolio={draft}` and `template={draft.template}`. No inspector callbacks (`onSelectBlock`, `onSelectElement`, `onBlockKeySelect`) are provided.
   - `components/taste-folio.tsx` (lines 19-61): `hitHelper` and `blockHitHelper` return empty `{}` when selection callbacks are absent, eliminating click interception, pointer hover outlines, and selection rings.
   - `components/preview-dock.tsx` (lines 145-266): `selectOn` pointer button has been completely removed from the preview dock toolbar.

5. **Empirical Stress Test Results**:
   - Executed automated stress-test harness (`scripts/stress-test-m1.ts`):
     - Suite 1 (Catalog & 13 Block Types across 6 templates): 91/91 assertions PASSED.
     - Suite 2 (Pipe Parsing & Delimiter Edge Cases): 8/8 assertions PASSED.
     - Suite 3 (Sidebar State Mutations, Add/Remove/Reorder/Duplicate/Reset/Update): 211/211 assertions PASSED.
     - Total: **310 / 310 empirical test assertions PASSED (100% success rate)**.

6. **TypeScript Check**:
   - Command: `npm run typecheck` (`tsc --noEmit`)
   - Exit code: 0 (No TypeScript errors).

---

## 2. Logic Chain

1. **Complete Block Type Coverage**: Observations 1 and 2 establish that all 13 block types defined in `BLOCK_CATALOG` are supported with tailored creation logic in `lib/blocks.ts` and responsive form layouts in `BlockForm`.
2. **Robust Mutation & Fault Tolerance**: Observation 3 establishes that array bounds, single-block edge cases, ID collisions during duplication, and pipe parsing edge cases (missing delimiters, empty values, special characters) are handled gracefully without exceptions or state corruption.
3. **Synchronous State Sync**: Observation 2 and Observation 3 establish that updating any form field immediately calls `updateBlock` -> `onBlocks` -> `setBlocks` in `PortfolioEditor`. This updates `draft.blocks` in React state, propagating changes instantly to `FolioCanvas` and maintaining undo/redo history.
4. **Pure Live Canvas**: Observation 4 confirms that all inspector selection callbacks have been removed, making the visual canvas a clean, non-interactive live preview matching the requirements of F2.
5. **Empirical Validation**: Observations 5 and 6 confirm that 310 rigorous test cases pass and TypeScript compiles cleanly with zero errors.

---

## 3. Caveats

- **Next.js Turbopack Lock**: When the dev server (`next dev`) is actively running in background, running `npm run build` simultaneously reports that another process is running due to Next.js 16 directory locks on `.next/lock`. TypeScript compilation was verified via `npm run typecheck` (`tsc --noEmit`), which exited cleanly with code 0.
- **Milestone M2 Note**: `components/taste-folio.tsx` contains a conditionally called `useMemo` in `CraftFolio` (line 791). This belongs to Milestone M2 (Reference Template Integration) and does not affect Milestone M1.

---

## 4. Conclusion

**Verdict: APPROVE**

Milestone M1 (Form-Based Sidebar Editor) satisfies all functional and architectural specifications:
- `BlockSidebar` gracefully handles all 13 block types with inline form controls and list editors.
- Block addition, removal, reordering, duplication, reset, and item mutations operate without regressions.
- The live preview canvas is completely read-only with zero click interception.
- State synchronization is synchronous and integrates seamlessly with `useEditorHistory`.

---

## 5. Verification Method

1. Run TypeScript check from project root:
   ```bash
   npm run typecheck
   ```
   *Expected result*: Exit code 0 with 0 errors.

2. Inspect `components/block-sidebar.tsx`:
   - Verify `BlockForm` renders input fields for headings, eyebrows, body copy, image uploads, CTA pairs, and list editors (`SkillsListEditor`, `FeaturesListEditor`, `ReviewsListEditor`, `FaqListEditor`).
   - Verify `move`, `duplicate`, `remove`, `reset`, and `updateBlock` functions enforce bounds and single-block guards.

3. Inspect `components/portfolio-editor.tsx` and `components/taste-folio.tsx`:
   - Verify `FolioCanvas` does not pass `onSelectBlock` / `onSelectElement`.
   - Verify `hitHelper` returns `{}` in read-only mode.
