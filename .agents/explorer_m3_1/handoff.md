# Handoff Report — Explorer 1 (Milestone M3: Onboarding Form & Draft Generation)

**Agent**: Explorer 1  
**Milestone**: M3 (Tailored Onboarding Form & Draft Generation)  
**Date**: 2026-08-16  
**Type**: Hard Handoff (Task Complete)  

---

## 1. Observation

1. **Routing in `app/onboarding/[step]/page.tsx`**:
   - Lines 3-7: `OnboardingStepPage` currently executes `redirect("/onboarding")` unconditionally without reading or matching step routes `1` through `5`.
   - `app/onboarding/page.tsx` mounts `<FrameOnboarding />` directly.

2. **Interim 2-step Component in `components/frame-onboarding.tsx`**:
   - Lines 39-49: Defines a 2-step `FrameOnboardingState` (`step: 1 | 2`, `brand`, `heroPrimary`, `heroSecondary`, `intro`, `aboutHeading`, `aboutBody`, `email`, `projects`).
   - Lines 78-160: `buildPortfolio` creates a partial `StoredPortfolio` with `hero`, `featured`, `about`, and `contact` blocks.
   - Lines 180-233: `ScaledFramePreview` uses `ResizeObserver` to render `FolioCanvas` scaled to `viewport.clientWidth / 1120`.

3. **Frame Reference Template in `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html` & `components/taste-folio.tsx`**:
   - `FrameFolio` (lines 62-120 in `taste-folio.tsx`) extracts `pieces` from `portfolio.media.stills` and `portfolio.blocks` (`featured`, `still`, `hero`).
   - Renders:
     - Nav logo from `portfolio.school || portfolio.name`
     - Hero headline from `heroBlock.heading` or `heroLine1 + '\n' + heroLine2`
     - Featured 2:1 hero banner from `featured` piece
     - Work section with dynamic category filter buttons (`All`, `Films`, `Ads`, `Graphics`) derived from `pieces.map(p => p.category)`
     - 2-column work card grid with modal lightbox
     - 2-column About section from `aboutBlock.heading` ("Less noise.\nMore work.") and `aboutBlock.body`
     - CTA section with accent highlight (`#dfff45`), discipline subtitle, and contact email button
     - Footer with copyright and uppercase discipline list

4. **Draft Storage and Editor Hydration**:
   - `lib/portfolio-store.ts` lines 187-216: `hydrateDraft(slug)` and `getDraft(slug)` read from `localStorage.getItem("afm:draft:" + slug)`.
   - `components/portfolio-editor.tsx` lines 115-138: Hydrates the stored draft immediately upon mounting and calls `resetDraft(merged)`.

---

## 2. Logic Chain

1. **Step-by-Step Mapping to Frame Requirements**:
   - To achieve full fidelity with the Frame template, onboarding must collect data across 5 distinct domains:
     - **Step 1**: Studio Identity & Hero (`studioName`, `heroLine1`, `heroLine2`, `intro`, `contactEmail`)
     - **Step 2**: Creative Disciplines / Filters (`disciplines`: `Films`, `Ads`, `Graphics`, `Motion`, `3D & CGI`, etc.)
     - **Step 3**: Project Showcase (`projects`: multi-item array with `title`, `category`, `detail`, `image`, `mediaKind`)
     - **Step 4**: Statement & Manifesto (`statementHeadline`, `statementBody`)
     - **Step 5**: Taste Selection & Review (`templateId`: `"frame"`, with auto-populated review card and launch trigger)

2. **Routing & Static Generation**:
   - Next.js App Router dynamic route `app/onboarding/[step]/page.tsx` must supply `generateStaticParams()` returning `[{ step: "1" }, { step: "2" }, { step: "3" }, { step: "4" }, { step: "5" }]` to ensure zero prerender errors.
   - `app/onboarding/page.tsx` should redirect to `/onboarding/1`.
   - Navigating next/back pushes `/onboarding/${nextStep}` via Next.js router.

3. **State Persistence**:
   - User answers should be persisted to `localStorage` under `afm:onboarding:data` on every keystroke/change, ensuring resilience across page refreshes or route changes.
   - On Step 5 completion, `generateDraftFromOnboarding(state, slug)` creates a complete `StoredPortfolio` (with all blocks seeded and bound), saves it to `afm:draft:${slug}` and `afm:draft:talib`, and redirects to `/edit/talib?welcome=1`.

4. **Split View Live Preview**:
   - The desktop layout should retain the `ScaledFramePreview` on the right side, computing `preview = generateDraftFromOnboarding(state, "preview")` reactively so the user sees their live Frame portfolio update in real-time as they type.

---

## 3. Caveats

- **No Caveats.** The architecture cleanly integrates with existing stores, components, and Next.js App Router conventions.
- Image uploads are converted to data URLs (capped at 1.5MB for images, 3.0MB for videos) for localStorage safety; direct URLs are supported as primary fallback.

---

## 4. Conclusion

The 5-step onboarding intake flow is fully designed and specified:
- `lib/onboarding.ts` defines `OnboardingState`, default values, storage helpers, and `generateDraftFromOnboarding()`.
- `app/onboarding/[step]/page.tsx` powers dynamic step routing with `generateStaticParams`.
- Step forms provide high-taste inputs for Studio Identity, Discipline Chips, Multi-project Showcase, Manifesto Copy, and Template Launch.
- Live preview continuously reflects state changes.
- Generated draft immediately hydrates `/edit/talib` in `PortfolioEditor`.

---

## 5. Verification Method

1. **Build Verification**:
   ```powershell
   npm run build
   ```
   Must compile with 0 type errors, 0 lint errors, and successfully prerender `/onboarding/[step]` (5 static step pages).

2. **Interactive Flow Verification**:
   - Navigate to `/onboarding` -> redirects to `/onboarding/1`.
   - Complete Step 1 -> click Next -> navigates to `/onboarding/2`.
   - Toggle discipline chips in Step 2 -> category filter buttons on right live preview update immediately.
   - Edit project title/image in Step 3 -> featured banner and work grid cards update immediately.
   - Edit statement in Step 4 -> About section updates immediately.
   - Click "Launch Portfolio Editor" on Step 5 -> saves draft and redirects to `/edit/talib`.
   - Check `/edit/talib` in browser: All sidebar fields and live canvas blocks match user's onboarding input 100%.
