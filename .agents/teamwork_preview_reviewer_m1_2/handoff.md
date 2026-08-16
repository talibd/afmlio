# Milestone M1 Review Report: Form-Based Sidebar Editor

## Review Summary

**Verdict**: **REQUEST_CHANGES**

---

## Findings

### [Critical] Finding 1: Build Failure During Production TypeScript Compilation
- **What**: `npm run build` fails during the TypeScript verification step.
- **Where**: `scripts/stress-test-m1.ts:2:76`
- **Verbatim Error**:
  ```
  ▲ Next.js 16.2.6 (Turbopack)

    Creating an optimized production build ...
  ✓ Compiled successfully in 9.3s
    Running TypeScript ...
  Failed to type check.

  ./scripts/stress-test-m1.ts:2:76
  Type error: '"../lib/demo"' has no exported member named 'DEMO_PORTFOLIOS'. Did you mean 'PORTFOLIOS'?

    1 | ...lock, resetBlock, blockLabel, defaultBlocks, isStaleLayout, reapplyTemplateChrome } from...
  > 2 | ...olioBlock, type Portfolio, type TemplateId, DEMO_PORTFOLIOS } from "../lib/demo"
      |                                                ^
    3 | ..../lib/portfolio-store"
  ```
- **Why**: `tsconfig.json` includes `**/*.ts`. The script `scripts/stress-test-m1.ts` imports a non-existent member `DEMO_PORTFOLIOS` (the correct export in `lib/demo.ts` is `PORTFOLIOS`). Because of this, `npm run build` exits with code 1, violating acceptance criterion #3 ("The project builds successfully with `npm run build` without type or lint errors").
- **Suggestion**: Update `scripts/stress-test-m1.ts` to import `PORTFOLIOS` instead of `DEMO_PORTFOLIOS` (or exclude `scripts/` in `tsconfig.json` / relocate agent test files into `.agents/`) so the build exits cleanly with code 0.

---

### [Major] Finding 2: Whitespace / Spacebar Deletion During Controlled Keystroke Input in Structured List Editors
- **What**: When typing multi-word text in `FeaturesListEditor`, `ReviewsListEditor`, or `FaqListEditor`, typing a trailing space (e.g. pressing Spacebar between words) is immediately stripped on each keystroke, preventing normal input of spaces between words.
- **Where**: `components/block-sidebar.tsx`:
  - Lines 48–54 (`parsePipe`): `const parts = item.split("|").map((p) => p.trim())`
  - Line 280 (`FeaturesListEditor`): `next[idx] = `${title.trim()} | ${description.trim()}``
  - Line 388 (`ReviewsListEditor`): `next[idx] = `${quote.trim()} | ${author.trim()} | ${role.trim()} | ${avatar.trim()}``
  - Line 515 (`FaqListEditor`): `next[idx] = `${question.trim()} | ${answer.trim()}``
- **Why**: In controlled React inputs, applying `.trim()` in `onChange` and `parsePipe` causes immediate deletion of whitespace while the user is actively typing. When a user presses Space after typing a word (e.g., `"Hello "`), the component immediately updates state to `"Hello"`, strips the trailing space, and resets the `<Input>` value to `"Hello"`. The next character typed results in `"HelloWord"` rather than `"Hello Word"`.
- **Suggestion**: 
  1. Do not call `.trim()` in `updateItem` on individual keystrokes.
  2. In `parsePipe`, split on `|` without mapping `.trim()` on intermediate input values during editing, or use a delimiter format like `${title}|${description}` and leave trimming to the public template consumers (which already call `.trim()` in `pipe()` in `folio-sections.tsx`).

---

### [Minor] Finding 3: `move(id, dir)` Negative Index Splice on Unfound Block ID
- **What**: In `components/block-sidebar.tsx` (`move` function), there is no check for `index === -1`.
- **Where**: `components/block-sidebar.tsx:864–871`
  ```typescript
  function move(id: string, dir: -1 | 1) {
    const index = blocks.findIndex((block) => block.id === id)
    const next = index + dir
    if (next < 0 || next >= blocks.length) return
    const copy = [...blocks]
    const [item] = copy.splice(index, 1)
    copy.splice(next, 0, item)
    onBlocks(copy)
  }
  ```
- **Why**: If an unfound block ID is passed with `dir = 1`, `index` is `-1`, `next` is `0`, which passes `next < 0 || next >= blocks.length`. Then `copy.splice(-1, 1)` removes the *last* element in the array and `copy.splice(0, 0, item)` inserts it at the beginning.
- **Suggestion**: Add `if (index === -1) return` at the beginning of `move()`.

---

### [Minor] Finding 4: Missing Optional Chaining in `syncFieldsToBlocks`
- **What**: `syncFieldsToBlocks` in `components/portfolio-editor.tsx` accesses properties on `draft.media`, `draft.project`, and `draft.skills` without optional chaining.
- **Where**: `components/portfolio-editor.tsx:38, 58–59, 63`
  ```typescript
  const headshot = draft.media.headshot // line 38
  ...
  heading: draft.project.name || block.heading, // line 58
  body: draft.project.copy || block.body,       // line 59
  ...
  items: draft.skills.length ? draft.skills : block.items // line 63
  ```
- **Why**: If draft data loaded from `localStorage` or custom templates has omitted or undefined `media`, `project`, or `skills`, this function will throw an unhandled `TypeError: Cannot read properties of undefined`.
- **Suggestion**: Change to `draft.media?.headshot`, `draft.project?.name`, `draft.project?.copy`, and `draft.skills?.length`.

---

## 5-Component Handoff Section

### 1. Observation
1. **Build Command**: Ran `npm run build` in `c:\Users\talib\OneDrive\Documents\my apps\afmlio`.
   - **Result**: Command exited with code 1.
   - **TypeScript Error**: `./scripts/stress-test-m1.ts:2:76 Type error: '"../lib/demo"' has no exported member named 'DEMO_PORTFOLIOS'. Did you mean 'PORTFOLIOS'?`
2. **List Editing Behavior**:
   - In `components/block-sidebar.tsx`, lines 280, 388, 515, `updateItem` calls `.trim()` on field values before saving to `items`.
   - Lines 48–54 in `parsePipe` calls `.map((p) => p.trim())` on every render.
3. **Canvas Hit Neutralization**:
   - In `components/portfolio-editor.tsx`, `FolioCanvas` is passed only `portfolio` and `template`.
   - In `components/taste-folio.tsx` and `components/folio-frame.tsx`, `hitHelper` and `blockHitHelper` safely check for callback presence and return `{}` when callbacks are omitted.
4. **State & History Synchronization**:
   - In `components/portfolio-editor.tsx`, sidebar changes update `blocks` in `draft`, triggering reactive canvas re-renders and storing history in `useEditorHistory`.

### 2. Logic Chain
1. Production readiness requires `npm run build` to exit with code 0 without type errors. Because `scripts/stress-test-m1.ts` imports an invalid symbol `DEMO_PORTFOLIOS`, the Next.js TypeScript build phase fails.
2. The core user story for form-based sidebar editing requires users to freely type text into form fields. Because `parsePipe` and `updateItem` trim strings on every keystroke, user spacebar presses are stripped immediately in list fields (`Features`, `Reviews`, `FAQ`), creating a severe usability barrier.
3. Therefore, changes must be requested before Milestone M1 can be approved.

### 3. Caveats
- The core architecture for disabling DialKit inspector and routing form input into block properties is well-structured and functional.
- The issues identified are isolated and straightforward to resolve.

### 4. Conclusion
Milestone M1 cannot be approved in its current state due to a broken production build (`scripts/stress-test-m1.ts`) and space-trimming input defects in list editors. Verdict is **REQUEST_CHANGES**.

### 5. Verification Method
1. Run `npm run build` and confirm exit code 0 with zero TypeScript errors.
2. Launch dev server (`npm run dev`), open `/edit/talib`, expand a `Features`, `Reviews`, or `FAQ` block in the sidebar, and verify that typing spaces between words in text fields functions naturally without eating whitespace.
3. Verify that `FolioCanvas` displays all live updates without click interception or outline rings.
