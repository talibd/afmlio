# Execution Plan — Orchestrator 2 (Successor)

## Context & Objectives
Resuming from Orchestrator 1 (Milestones M1 & M2 completed and verified).
Executing Milestones M3 and M4:
- **Milestone M3: Tailored Onboarding Form & Draft Generation**
  - Implement 5-step onboarding intake flow mapping directly to Frame taste requirements.
  - Implement state persistence across steps in `lib/onboarding.ts` and `generateDraftFromOnboarding()` saving to `afm:draft:talib`.
  - Ensure finishing onboarding redirects to `/edit/talib` with fully hydrated draft.
  - Full Gate verification (Worker, 2 Reviewers, 2 Challengers, 1 Auditor).
- **Milestone M4: E2E Integration & Final Build Verification**
  - Verify complete lifecycle: Onboarding -> Seeded Draft -> Editor Canvas & Form Sidebar -> Real-time updates -> Public route `/p/[slug]`.
  - Validate `npm run build` with 0 type errors, 0 lint errors, and all routes building cleanly.
  - Final Gate verification and Victory Audit submission to Sentinel.

## Step-by-Step Execution Sequence

### Phase 1: Milestone M3 Implementation & Gate Loop
1. **Explorer Investigation (M3)**:
   - Spawn Explorer to inspect `app/onboarding/[step]/page.tsx`, `components/onboarding-shell.tsx`, `lib/onboarding.ts`, `lib/portfolio-store.ts`, `lib/blocks.ts`, and `components/taste-folio.tsx`.
   - Provide concrete implementation plan for the 5 steps and draft seeding.
2. **Worker Implementation (M3)**:
   - Spawn Worker to implement `lib/onboarding.ts`, `app/onboarding/[step]/page.tsx`, and supporting components.
   - Run typecheck and build to verify clean compilation.
3. **Multi-Agent Gate Verification (M3)**:
   - Spawn Reviewer 1 & Reviewer 2.
   - Spawn Challenger 1 & Challenger 2.
   - Spawn Forensic Auditor.
   - Evaluate gate criteria in `GATE_STATUS.md`.

### Phase 2: Milestone M4 E2E Integration & Build Verification
1. **E2E Worker / Integration Verification (M4)**:
   - Verify complete user journey: Onboarding -> Seeded Draft -> Editor Canvas & Form Sidebar -> Real-time updates -> Public route `/p/[slug]`.
   - Execute and verify `npm run build`.
2. **Multi-Agent Final Gate Verification (M4)**:
   - Spawn Reviewers, Challengers, and Forensic Auditor.
   - Evaluate gate criteria in `GATE_STATUS.md`.

### Phase 3: Final Delivery & Reporting
1. Synthesize final report and update `PROJECT.md`.
2. Write final `handoff.md` and notify parent/sentinel via `send_message`.
