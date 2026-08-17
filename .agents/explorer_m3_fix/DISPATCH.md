## 2026-08-16T17:18:48Z

<USER_REQUEST>
You are Remediation Explorer for Milestone M3 (Tailored Onboarding Form & Draft Generation).
Your working directory: c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\explorer_m3_fix
Project root: c:\Users\talib\OneDrive\Documents\my apps\afmlio
Authoritative request: c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\ORIGINAL_REQUEST.md
Project plan: c:\Users\talib\OneDrive\Documents\my apps\afmlio\PROJECT.md

FULL FORENSIC AUDIT EVIDENCE REPORT:
The Forensic Auditor reported INTEGRITY VIOLATION with the following exact findings:
1. Build Failure: Running `npm run build` exits with code 1:
   ```
   ✓ Compiled successfully in 41s
     Running TypeScript ...
   Failed to type check.
   Type error: File '.../.next/dev/types/cache-life.d.ts' not found.
   ```
   Root Cause: `tsconfig.json` includes `".next/dev/types/**/*.ts"` which does not exist during a production build.
2. Missing Contract File: `lib/onboarding.ts` was not created as contracted in `PROJECT.md`; onboarding state types and draft building logic were embedded directly in `components/frame-onboarding.tsx`.
3. Genuine State Flow: Static analysis confirms no fake facades or hardcoded mock bypasses in the onboarding logic itself. All user fields are genuinely collected and saved to `localStorage` under `afm:draft:<slug>`.

YOUR TASK:
1. Read `ORIGINAL_REQUEST.md`, `PROJECT.md`, `tsconfig.json`, `components/frame-onboarding.tsx`, `app/onboarding/` and existing codebase.
2. Formulate the exact fix strategy:
   - Detail the changes needed for `tsconfig.json` to ensure `npm run build` type-checks cleanly without erroring on missing dev types.
   - Detail the exact implementation of `lib/onboarding.ts` (extracting `OnboardingState`, `DEFAULT_ONBOARDING_STATE`, persistence helpers, and `generateDraftFromOnboarding`) and updating all import sites in `components/frame-onboarding.tsx`, `app/onboarding/[step]/page.tsx`, etc.
3. Write your report to `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\explorer_m3_fix\report.md` and handoff to `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\explorer_m3_fix\handoff.md`.
4. Send a message to the orchestrator when complete.
</USER_REQUEST>
