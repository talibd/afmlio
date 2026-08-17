# Handoff Report — Explorer M3-3: Onboarding-to-Editor Journey & Draft Generation

## 1. Observation
- **Original & Milestone Requirements**:
  - `ORIGINAL_REQUEST.md:16`: "R3. Tailored Onboarding Form: Update the onboarding form flow to ask questions that map directly to the content requirements of the new template from R2. Ensure the generated draft is fully populated with the user's answers when they finish onboarding."
  - `PROJECT.md:20-22`: Milestone M3 features F8 (Tailored Onboarding Intake Form), F9 (Onboarding State Persistence & Draft Generator), and F10 (Onboarding to Editor Bridge).
- **Existing Architecture**:
  - `app/onboarding/[step]/page.tsx`: Currently contains a stub redirecting to `/onboarding`.
  - `components/frame-onboarding.tsx`: Contains a 2-step onboarding prototype with state persistence, client-side media handling, and preview scaling.
  - `components/portfolio-editor.tsx:115-138`: Hydrates stored draft from `localStorage` (`getDraft(slug)`) upon client mount and uses `isStaleLayout` check before resetting editor draft state.
  - `lib/blocks.ts:263-275`: `isStaleLayout` checks for core work blocks (`hero`, `still`, `about`, `featured`, `contact`, `skills`) and preserves them without resetting to defaults.
  - `components/taste-folio.tsx:62-120`: `FrameFolio` dynamically extracts pieces from `portfolio.blocks` (and `portfolio.media.stills`) to populate the hero featured banner, 2-column work grid, category filters, and modal lightbox.
  - `lib/onboarding.ts`: Does not yet exist; needs to be created to implement `OnboardingState`, defaults, and `generateDraftFromOnboarding`.

---

## 2. Logic Chain
1. **Intake Mapping**: The Frame taste template requires 5 core content dimensions:
   - Studio/Brand Identity & Headline/Subline (`hero`)
   - Creative Disciplines (`skills` and category filters)
   - Multi-Project Showcase with titles, categories, runtimes, and media (`featured` blocks)
   - Artist Statement / Manifesto with headline and body (`about`)
   - Studio Contact Email (`contact` and nav actions)
   Therefore, structuring onboarding into 5 sequential steps aligns 1:1 with Frame template sections.

2. **Zero-Friction UX**: Pre-filling all 5 steps with high-quality sample defaults (`DEFAULT_ONBOARDING_STATE`) ensures users can quickly click "Continue" through all steps to preview the complete template without getting blocked by empty required fields.

3. **State Persistence**: Persisting `OnboardingState` to `localStorage` under `afm:onboarding:state` on input changes ensures data is preserved across page reloads, step jumps, and browser back/forward navigation.

4. **Deterministic Draft Generation**: `generateDraftFromOnboarding(data, slug)` transforms `OnboardingState` into a `StoredPortfolio` containing `hero`, `featured` (for all projects), `about`, `skills`, and `contact` blocks. Saving this draft to `localStorage['afm:draft:talib']` and updating `afm:portfolio:index` guarantees that navigating to `/edit/talib` immediately loads the populated draft.

5. **Editor Hydration & Sidebar Form Editing**: Because `PortfolioEditor` checks `getDraft(slug)` on mount and `isStaleLayout` recognizes the seeded work blocks, `FolioCanvas` immediately renders the populated `FrameFolio` template and `BlockSidebar` renders inline editable form rows for every block.

---

## 3. Caveats
- **Local Storage Quotas**: Browser `localStorage` is typically limited to 5MB. Large base64 uploads must be guarded (1.5MB for images, 3MB for videos), and URL pasting is provided as a secondary option.
- **Slug Selection**: While the user can specify a studio name, default redirection routes to `/edit/talib` (the primary demo workspace) with cross-saving to ensure no 404 or unhydrated state occurs.

---

## 4. Conclusion
The onboarding-to-editor journey is fully specified and architecturally sound. Implementing `lib/onboarding.ts` and updating `app/onboarding/[step]/page.tsx` will deliver a seamless 5-step intake flow that generates a rich `StoredPortfolio` draft in `localStorage`, immediately rendering in `FolioCanvas` with Frame taste and offering direct inline editing in `BlockSidebar`.

---

## 5. Verification Method
1. **Codebase Inspection**:
   - Verify `lib/onboarding.ts` exports `OnboardingState`, `DEFAULT_ONBOARDING_STATE`, and `generateDraftFromOnboarding`.
   - Verify `app/onboarding/[step]/page.tsx` renders steps 1 through 5 with state persistence and back/forward navigation.
2. **Functional Test**:
   - Open `/onboarding/1` in browser, verify default sample values are pre-filled.
   - Advance through steps 1 -> 2 -> 3 -> 4 -> 5, verify state is retained when clicking "Back".
   - Complete Step 5, verify redirect to `/edit/talib`.
   - Verify `FolioCanvas` renders the hero banner, 2-column work grid, about section, and contact button.
   - Verify `BlockSidebar` displays rows for all seeded blocks and that editing a field immediately updates the canvas.
3. **Build Command**:
   - Run `npm run build` from project root and confirm 0 TypeScript or lint errors.
