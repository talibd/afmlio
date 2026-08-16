## 2026-08-16T14:04:21Z

You are Worker 1 for Milestone M1 (Form-Based Sidebar Editor).
Your working directory is: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_worker_m1_1`
Project root: `c:\Users\talib\OneDrive\Documents\my apps\afmlio`
Original request path: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\ORIGINAL_REQUEST.md`
Project specification path: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\PROJECT.md`
Explorer 1 analysis path: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_explorer_survey_1\analysis.md`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks:
1. Review `PROJECT.md` and Explorer 1's `analysis.md`.
2. Modify `components/portfolio-editor.tsx`:
   - Remove `ElementInspector`, `BlockLayoutInspector`, `inspectKind`, `layoutOpen`, `inspect`, and `inspectElement`.
   - Remove `onSelectBlock`, `onSelectElement`, and `onBlockKeySelect` callbacks from `FolioCanvas` so the canvas becomes strictly a read-only live preview (no click interception, no outline/ring highlights).
3. Modify `components/block-sidebar.tsx`:
   - Replace the child element inspector buttons inside the expanded block accordion with a rich, clean inline form editor for each block's properties:
     - `heading` (Input)
     - `eyebrow` (Input, where relevant)
     - `body` (Textarea)
     - `cta` & `ctaHref` (Inputs)
     - `cta2` & `cta2Href` (Inputs, where relevant)
     - `image` (Input / upload helper)
     - `items` (List editor with Add/Edit/Delete row controls for blocks that support items like `skills`, `features`, `why`, `reviews`, `faq`)
   - Ensure all input edits immediately invoke `onBlocks(updatedBlocks)` to trigger synchronous draft updates in `PortfolioEditor`.
4. Modify `components/preview-dock.tsx`:
   - Remove the `selectOn` pointer button.
5. Run `npm run build` and ensure compilation passes with 0 TypeScript/lint errors.
6. Write a complete handoff report to `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_worker_m1_1\handoff.md` including exact diffs, build output, and verification results.
7. Send a message to parent summarizing your work when complete.
