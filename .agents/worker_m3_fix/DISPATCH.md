## 2026-08-16T17:18:55Z

<USER_REQUEST>
You are Remediation Worker for Milestone M3 (Tailored Onboarding Form & Draft Generation).
Your working directory: c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\worker_m3_fix
Project root: c:\Users\talib\OneDrive\Documents\my apps\afmlio
Authoritative request: c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\ORIGINAL_REQUEST.md
Project plan: c:\Users\talib\OneDrive\Documents\my apps\afmlio\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

SCOPE & IMPLEMENTATION TASK:
1. Fix `tsconfig.json`:
   - In `tsconfig.json`, remove `".next/dev/types/**/*.ts"` from the `include` array so it is:
     ```json
     "include": [
       "next-env.d.ts",
       "**/*.ts",
       "**/*.tsx",
       ".next/types/**/*.ts"
     ]
     ```
2. Create `lib/onboarding.ts`:
   - Define `OnboardingState` TypeScript interface capturing all 5 steps (Studio Name, Hero Lines 1 & 2, Contact Email, Disciplines, Projects list with category/runtime/stills, Statement Headline, Manifesto Bio, Services list, templateId: 'frame').
   - Define `DEFAULT_ONBOARDING_STATE` with high-quality studio sample defaults.
   - Implement `loadOnboardingState(): OnboardingState`, `saveOnboardingState(state: OnboardingState): void`, `clearOnboardingState(): void`.
   - Implement `generateDraftFromOnboarding(state: OnboardingState, slug: string): StoredPortfolio`:
     - Creates complete `StoredPortfolio` (with `templateId: 'frame'`, `hero`, `about`, `skills`, `media.stills`, `contact`, `settings`, `blocks`).
     - Saves draft to `localStorage.setItem('afm:draft:' + slug, JSON.stringify(draft))` and `localStorage.setItem('afm:draft:current', slug)`.
     - Returns `draft`.
3. Update `components/frame-onboarding.tsx`, `app/onboarding/[step]/page.tsx`, and any other onboarding consumers to import `OnboardingState`, `DEFAULT_ONBOARDING_STATE`, `loadOnboardingState`, `saveOnboardingState`, `generateDraftFromOnboarding` from `@/lib/onboarding`.
4. Run build verification:
   - Run `npx tsc --noEmit` to verify 0 type errors.
   - Run `npm run build` to verify production build succeeds cleanly with 0 errors.
5. Write your report to `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\worker_m3_fix\report.md` and handoff to `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\worker_m3_fix\handoff.md`.
6. Send a message to the orchestrator when finished.
</USER_REQUEST>
