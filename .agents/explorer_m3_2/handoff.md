# Handoff Report — Milestone M3: Tailored Onboarding & Draft Generation

## 1. Observation

1. **`lib/portfolio-store.ts` (lines 38–45, 187–216, 229–235)**:
   - `StoredPortfolio` is defined as:
     ```typescript
     export type StoredPortfolio = Portfolio & {
       seo: PortfolioSeo
       chrome: PortfolioChrome
       media: PortfolioMedia
       settings: PortfolioSettings
       updatedAt: number
     }
     ```
   - `saveDraft(slug, draft)` writes to `localStorage.getItem("afm:draft:" + slug)` and adds a record to `"afm:portfolio:index"`.
   - `getDraft(slug)` reads from `"afm:draft:" + slug`.

2. **`components/taste-folio.tsx` (lines 62–120, 289–309, 345–458, 461–525, 577–835, 901–1038)**:
   - `FrameFolio` dynamically pulls data from:
     - `portfolio.school` or `portfolio.name` for brand logo and footer copyright.
     - `portfolio.title` for secondary accent headline (`<span>{portfolio.title}</span>`).
     - `portfolio.bio` for fallback body text.
     - `portfolio.skills` for discipline tags in the `#skills` custom block and contact section.
     - `portfolio.media.stills` and `portfolio.blocks` (`type === "featured" | "still"`) for the hero featured banner and 2-column work grid cards with category filters ("Films", "Ads", "Graphics").
     - `heroBlock`, `aboutBlock`, `contactBlock`, and custom blocks (`skills`, `why`, `reviews`, `faq`).

3. **`components/portfolio-editor.tsx` (lines 101–138)**:
   - `PortfolioEditor` hydrates `getDraft(slug)` in `useEffect` and calls `resetDraft(merged)` into `useEditorHistory`.
   - Any draft stored under `afm:draft:<slug>` directly initializes the editor sidebar and live preview canvas.

4. **`components/block-sidebar.tsx` (lines 47–53, 241–320)**:
   - Contains native form controls for all block types (`hero`, `featured`, `still`, `about`, `skills`, `why`, `reviews`, `faq`, `contact`, `footer`).

5. **`prototype/` and `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`**:
   - Reference template requires: Studio Name, 2-line Hero Headline, Creative Categories (Films, Ads, Graphics), Projects with Title, Format/Runtime, and Visual Stills, Statement/Ethos ("Less noise. More work."), and Direct Contact Email.

---

## 2. Logic Chain

1. **Step 1 -> Template Matching**:
   - Observation (2) and Observation (5) show that `FrameFolio` needs a studio name, a 2-line hero title (`heroLine1` and `heroLine2`), and a contact email.
   - Therefore, Step 1 of onboarding must capture `studioName`, `heroLine1`, `heroLine2`, and `contactEmail`.

2. **Step 2 -> Category Filter System**:
   - Observation (2) confirms that `FrameFolio` renders category filter buttons and skills badges directly from `portfolio.skills`.
   - Therefore, Step 2 must provide interactive discipline chips (Films, Ads, Graphics, Motion, 3D & CGI, etc.) mapped to `OnboardingState.disciplines`.

3. **Step 3 -> Featured & Grid Work Items**:
   - Observation (2) confirms that `FrameFolio` extracts pieces where `pieces[0]` is the 2:1 featured banner and subsequent items populate the interactive cards grid.
   - Therefore, Step 3 must provide a multi-project list (`OnboardingProject[]`) collecting title, category, format/runtime, image URL/file, and description.

4. **Step 4 -> Statement & Manifesto**:
   - Observation (2) shows `FrameFolio` renders an editorial About section with a large Georgia heading and manifesto paragraph.
   - Therefore, Step 4 must collect `statementHeadline` and `statementBody`.

5. **Step 5 -> Draft Persistence & Launch**:
   - Observations (1) and (3) show that saving a generated `StoredPortfolio` to `afm:draft:<slug>` via `saveDraft(slug, draft)` immediately enables `PortfolioEditor` at `/edit/<slug>` to hydrate with all sections without manual recreation.
   - Therefore, `generateDraftFromOnboarding(state, slug)` should generate a complete `StoredPortfolio` with all 9 seeded `FolioBlock` objects (`hero`, `featured`, `skills`, `why`, `reviews`, `faq`, `about`, `contact`, `footer`) and write to `afm:draft:<slug>` upon launch.

---

## 3. Caveats

- **Media Quotas**: LocalStorage has a browser quota limit (~5MB). Image/video uploads should be compressed using `persistImageFile()` in `lib/image-utils.ts` or linked via external URLs.
- **Custom Blocks**: `FrameFolio` only renders blocks that exist in `portfolio.blocks`. Generating all 9 standard blocks in `generateDraftFromOnboarding()` ensures the editor sidebar has all editable sections ready.

---

## 4. Conclusion

The specification for `OnboardingState`, `generateDraftFromOnboarding()`, and the 5-step onboarding flow is complete and directly aligned with the Frame template requirements and `PortfolioEditor` hydration.
The full specification is recorded in `.agents/explorer_m3_2/report.md`.

---

## 5. Verification Method

1. **Type & Compilation Check**:
   Run `npm run build` or `npx tsc --noEmit` to verify type compatibility of `OnboardingState` and `generateDraftFromOnboarding` with `StoredPortfolio` and `FolioBlock`.
2. **LocalStorage Hydration Inspection**:
   In browser DevTools console after completing onboarding:
   ```javascript
   const draft = JSON.parse(localStorage.getItem("afm:draft:talib"));
   console.log(draft.name, draft.blocks.length, draft.media.stills);
   ```
   Verify that `draft.blocks` has 9 blocks and `draft.media.stills` matches the project images.
3. **Editor Hydration Check**:
   Navigate to `http://localhost:3000/edit/talib` and verify that the sidebar form fields match the onboarding inputs and the live preview canvas displays all custom copy and images.
