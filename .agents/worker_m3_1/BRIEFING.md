# BRIEFING — 2026-08-16T17:12:05Z

## Mission
Implement tailored onboarding flow (5 steps) and draft generator for Milestone M3, generating complete StoredPortfolio and FolioBlocks for Frame template and redirecting to editor.

## 🔒 My Identity
- Archetype: Worker (implementer, qa, specialist)
- Roles: implementer, qa, specialist
- Working directory: c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\worker_m3_1
- Original parent: b393d438-28ba-4423-86ce-da81dd3fa6db
- Milestone: M3 (Tailored Onboarding Form & Draft Generation)

## 🔒 Key Constraints
- Scope: `lib/onboarding.ts`, `app/onboarding/[step]/page.tsx`, `app/onboarding/page.tsx`, `components/onboarding-shell.tsx` (and supporting onboarding components).
- Do not cheat, do not hardcode dummy values or fake implementations.
- Zero type errors, zero lint errors, `npm run build` must pass cleanly.

## Current Parent
- Conversation ID: b393d438-28ba-4423-86ce-da81dd3fa6db
- Updated: 2026-08-16T17:12:05Z

## Task Summary
- **What to build**: 
  1. `lib/onboarding.ts` with `OnboardingState`, client persistence (`loadOnboardingState`, `saveOnboardingState`, `clearOnboardingState`), default initial state with high quality sample data, and `generateDraftFromOnboarding(data, slug)` mapping all fields into a valid `StoredPortfolio` and `FolioBlock[]`.
  2. 5-step UI in `app/onboarding/[step]/page.tsx`, `app/onboarding/page.tsx`, and `components/onboarding-shell.tsx` (or dedicated onboarding components) for:
     - Step 1: Identity & Contact (Studio Name, Hero Headline Line 1, Hero Line 2, Contact Email)
     - Step 2: Creative Disciplines / Filters (Interactive chip selection with custom category add)
     - Step 3: Project Showcase (Add/edit/remove projects with title, category select, runtime/meta, image URL/upload, description)
     - Step 4: Statement & Ethos (Statement Headline, Manifesto Bio, Services tag list)
     - Step 5: Template & Launch (Frame taste presentation and prominent "Launch Studio Portfolio" button invoking `generateDraftFromOnboarding()`, saving to draft, and navigating to `/edit/{slug}`).
  3. Ensure `/onboarding` defaults/redirects cleanly to Step 1.
  4. Ensure Back/Next transitions persist state seamlessly across steps.
- **Success criteria**: Complete form UX, perfect persistence, draft generator creates rich `StoredPortfolio` compatible with `FrameFolio` and `PortfolioEditor`, 0 build/lint errors.
- **Interface contracts**: `PROJECT.md` § Interface Contracts, `lib/portfolio-store.ts`, `lib/blocks.ts`.

## Change Tracker
- **Files modified**: None yet
- **Build status**: Untested
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Pending
- **Tests added/modified**: Pending

## Loaded Skills
- None

## Key Decisions Made
- [TBD]

## Artifact Index
- `.agents/worker_m3_1/DISPATCH.md` — Assignment & requirements
- `.agents/worker_m3_1/progress.md` — Liveness & task progress
- `.agents/worker_m3_1/BRIEFING.md` — Situational awareness
