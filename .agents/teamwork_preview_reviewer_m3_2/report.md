# Review & Adversarial Quality Report: Milestone M3 (Tailored Onboarding Form & Draft Generation)

**Reviewer**: Reviewer 2 (`teamwork_preview_reviewer_m3_2`)  
**Roles**: Reviewer, Adversarial Critic  
**Date**: 2026-08-16  
**Milestone**: M3 (Tailored Onboarding Form & Draft Generation)  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Executive Summary

Milestone M3 aims to deliver a tailored 5-step onboarding intake flow aligned with the Frame design template (`frame-ai-simple-portfolio.html`), persisting onboarding state across steps, and generating a fully populated `StoredPortfolio` draft saved to `afm:draft:<slug>` (and `afm:draft:talib`) that hydrates seamlessly into `PortfolioEditor` and public route `/p/[slug]`.

Following empirical codebase inspection, schema verification, and build validation, Milestone M3 **CANNOT BE APPROVED** in its current state. The module `lib/onboarding.ts` has not been implemented, the route `app/onboarding/[step]/page.tsx` is a dummy facade that redirects to `/onboarding`, the onboarding component (`components/frame-onboarding.tsx`) is a 2-step form that lacks the 5-step structured intake (missing discrete Creative Disciplines selection and Taste Presentation/Launch steps) and omits several Frame template blocks (`skills`, `why`, `reviews`, `faq`, `footer`), and `npm run build` fails due to TypeScript compilation errors.

---

## 2. Review Findings & Issues

### Finding 1: [Critical] Missing `lib/onboarding.ts` Module
- **Location**: `lib/onboarding.ts`
- **Issue**: The contract specified in `PROJECT.md` and `ORIGINAL_REQUEST.md` requires `lib/onboarding.ts` to export `OnboardingState`, `INITIAL_ONBOARDING_STATE`, `generateDraftFromOnboarding()`, and client persistence helpers. This file does not exist in the codebase.
- **Impact**: Other parts of the platform and automated tests cannot import canonical onboarding types or draft generation logic, preventing a standardized draft pipeline.
- **Required Fix**: Create `lib/onboarding.ts` with the complete 5-step `OnboardingState` data contract, defaults, and `generateDraftFromOnboarding(state, slug)` compiling all 9 Frame template blocks (`hero`, `featured`, `skills`, `why`, `reviews`, `faq`, `about`, `contact`, `footer`).

---

### Finding 2: [Critical] Onboarding Steps Incomplete (2-Step Form vs Required 5-Step Intake)
- **Location**: `components/frame-onboarding.tsx` & `app/onboarding/[step]/page.tsx`
- **Issue**: The authoritative specification mandates 5 distinct onboarding steps:
  1. **Step 1**: Studio Name, Hero Headline Line 1 & Line 2, Contact Email
  2. **Step 2**: Creative Disciplines / Filters (interactive pills/tags e.g. Films, Ads, Graphics, Motion, 3D & CGI)
  3. **Step 3**: Curated Project Showcase (multi-project list with categories, format/runtime, image/video, description)
  4. **Step 4**: Statement & Ethos (Manifesto Headline, Manifesto Bio, Services)
  5. **Step 5**: Taste Presentation & Launch (visual preview confirmation, draft serialization to `afm:draft:<slug>`, redirect to `/edit/<slug>`)
  
  Currently, `frame-onboarding.tsx` implements only a 2-step screen (`step: 1 | 2`), cramming Step 1 and Step 4 inputs together into Step 1, omitting the dedicated Creative Disciplines tag selector (Step 2), omitting Step 5 Taste Presentation & Launch, and `app/onboarding/[step]/page.tsx` merely redirects to `/onboarding`.
- **Impact**: Users cannot select creative discipline tags or review/launch their chosen taste template, and URL step routing `/onboarding/[step]` is non-functional.
- **Required Fix**: Implement the 5-step onboarding intake flow conforming to the specification, supporting step navigation and preview synchronization.

---

### Finding 3: [Critical] Incomplete Block Generation in Draft Creation
- **Location**: `components/frame-onboarding.tsx` (lines 78–160, `buildPortfolio`)
- **Issue**: In `buildPortfolio`, only 4 blocks are generated: `hero`, `featured` (for projects), `about`, and `contact`. It completely omits the rich editorial blocks established in Milestone M2:
  - `skills` block (Creative Disciplines)
  - `why` block (Creative Process)
  - `reviews` block (Client / Peer Notes)
  - `faq` block (Frequently Asked Questions)
  - `footer` block (Studio footer)
- **Impact**: When the user finishes onboarding and is redirected to `PortfolioEditor`, the sidebar only contains 4 basic blocks and the Frame template appears truncated compared to the full design reference (`frame-ai-simple-portfolio.html`).
- **Required Fix**: Upgrade the draft generation engine to populate all 9 blocks with initial copy matching the user's answers and curated defaults.

---

### Finding 4: [Critical] Build Failure (`npm run build`)
- **Location**: `scripts/challenge-m3-onboarding.ts:3`
- **Issue**: Running `npm run build` fails with TypeScript error TS5097 / TS2691:
  ```
  Type error: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.
  ```
  `scripts/challenge-m3-onboarding.ts` contains imports with explicit `.ts` extensions (`from "../lib/portfolio-store.ts"`).
- **Impact**: Production build is completely broken.
- **Required Fix**: Remove `.ts` file extensions from script imports (`from "../lib/portfolio-store"`, `from "../lib/blocks"`, etc.) so `npm run build` passes with exit code 0.

---

## 3. Adversarial Stress-Test Findings

| # | Stress Scenario | Expected Outcome | Current System Behavior | Status |
|---|---|---|---|---|
| **S1** | Empty Input Fields during Onboarding | Safe default fallbacks without `undefined` strings in draft | Falls back partially, but crashes if projects array is empty or lacks titles | ⚠️ Major |
| **S2** | Multi-Project List (up to 6+ projects) | Creates indexed `featured-N` blocks with unique IDs and media stills | Supported in `frame-onboarding.tsx`, but does not generate category filter tags for all disciplines | ⚠️ Major |
| **S3** | Video Media Input (`.mp4`, `.mov`, data URLs) | Detected as `mediaKind: "video"`, added to `media.clips` and `filmLink` | Handled for preview in `frame-onboarding.tsx`, but missing `media.clips` array population in stored draft | ⚠️ Major |
| **S4** | Direct URL Step Navigation (`/onboarding/3`) | Renders Step 3 with restored state | Hard redirects to `/onboarding` (starts at Step 1) | ❌ Critical |
| **S5** | Target Slug Draft Seeding (`afm:draft:talib`) | Saves directly to specified slug and registers in `afm:portfolio:index` | Computes slug from brand name via `uniquePortfolioSlug` rather than respecting requested target slug when specified | ⚠️ Minor |

---

## 4. Verification Evidence

- `npm run build`: **FAILED** (Exit code 1, TypeScript import error in `scripts/challenge-m3-onboarding.ts:3`).
- `File Existence (lib/onboarding.ts)`: **FAILED** (File does not exist).
- `Step Route Fidelity (app/onboarding/[step]/page.tsx)`: **FAILED** (Contains only `redirect("/onboarding")`).
- `Block Inventory in Draft`: **FAILED** (Only 4 blocks generated instead of 9 template blocks).

---

## 5. Explicit Recommendation & Action Items for SWE / Implementer

1. **Implement `lib/onboarding.ts`**:
   - Define and export `OnboardingProject`, `OnboardingState`, `INITIAL_ONBOARDING_STATE`, `DEFAULT_DISCIPLINE_OPTIONS`.
   - Export `generateDraftFromOnboarding(state: OnboardingState, slug: string): StoredPortfolio` which seeds all 9 blocks (`hero`, `featured`, `skills`, `why`, `reviews`, `faq`, `about`, `contact`, `footer`).
   - Export storage helper functions `saveOnboardingState`, `getOnboardingState`, `clearOnboardingState`.
2. **Refactor Onboarding Flow to 5 Steps**:
   - Implement Step 1 (Identity & Contact), Step 2 (Creative Disciplines & Tags), Step 3 (Curated Projects), Step 4 (Statement & Ethos), Step 5 (Taste Preview & Launch).
   - Ensure `/onboarding/[step]` routes properly render the corresponding step or synchronize with the onboarding shell.
3. **Fix Script Imports**:
   - Strip `.ts` file extensions from imports in `scripts/challenge-m3-onboarding.ts`.
4. **Run Full Verification**:
   - Ensure `npm run build` passes with 0 errors and onboarding -> editor draft persistence is verified.
