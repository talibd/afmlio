## 2026-08-16T17:10:10Z

You are Worker 1 for Milestone M3: Tailored Onboarding Form & Dynamic Draft Generation.
Working directory: c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_worker_m3_1
Project root: c:\Users\talib\OneDrive\Documents\my apps\afmlio

Read:
- c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\ORIGINAL_REQUEST.md
- c:\Users\talib\OneDrive\Documents\my apps\afmlio\PROJECT.md
- c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_explorer_survey_3\analysis.md
- `app/onboarding/[step]/page.tsx`, `components/onboarding-shell.tsx`, `components/template-choices.tsx`, `lib/portfolio-store.ts`, `lib/blocks.ts`, `components/taste-folio.tsx`, `components/portfolio-editor.tsx`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks:
1. Implement `lib/onboarding.ts`:
   - Define `OnboardingProject`, `OnboardingState`, and `DEFAULT_ONBOARDING_STATE` matching the reference Frame template requirements:
     - `name`: Portfolio / Studio name (default: "FRAME")
     - `headline`: Hero line 1 (default: "AI made visual.")
     - `headlineAccent`: Hero line 2 (default: "Human made creative.")
     - `email`: Contact email (default: "hello@framestudio.ai")
     - `categories`: Creative category list (default: ["Films", "Ads", "Graphics"])
     - `projects`: List of 3-6 curated projects with `id`, `title`, `category`, `categorySlug`, `note`, `image`
     - `aboutHeadline`: Statement headline (default: "Less noise.\nMore work.")
     - `bio`: Studio manifesto / about copy (default: "FRAME is a visual archive for AI-generated creative work. Films, ads and graphics are presented first. Everything else stays secondary so the work gets the attention.")
     - `template`: TasteId (default: "frame")
   - Implement storage helpers:
     - `loadOnboardingState(): OnboardingState` (reads from `localStorage` under key `"afm:onboarding:data"`, falls back to `DEFAULT_ONBOARDING_STATE`)
     - `saveOnboardingState(patch: Partial<OnboardingState>): OnboardingState` (saves updated state to `"afm:onboarding:data"`)
     - `generateDraftFromOnboarding(state: OnboardingState, slug?: string): StoredPortfolio` (constructs a complete `StoredPortfolio` with `hero`, `still`/`featured`, `about`, `contact` blocks, `media.stills`, `settings.email`, `chrome`, etc.)
     - `finalizeOnboardingAndSaveDraft(slug?: string): StoredPortfolio` (generates draft and saves directly to `localStorage.setItem("afm:draft:" + slug, JSON.stringify(draft))`).

2. Implement Tailored 5-Step Onboarding in `app/onboarding/[step]/page.tsx` & related components:
   - Ensure the onboarding UI is fully functional, styled consistently with the dark editorial aesthetic, and captures all data:
     - Step 1 (`/onboarding/1`): Brand/Studio Name, Hero Headline Line 1, Hero Subheading/Accent Line 2, Contact Email.
     - Step 2 (`/onboarding/2`): Creative Disciplines & Filters with toggleable chips (`Films`, `Ads`, `Graphics`, `Motion`, `3D & CGI`, `Editorial`) and custom category addition.
     - Step 3 (`/onboarding/3`): Curated Project Showcase editor supporting 3-6 projects (editable title, category selector matching Step 2 categories, note/format field, image URL / uploader / preset chooser). First project tagged as Hero Featured.
     - Step 4 (`/onboarding/4`): Statement Headline and Studio Manifesto / Bio textarea.
     - Step 5 (`/onboarding/5`): Taste Selection gallery with `Frame` selected as default / recommended, and a primary CTA "Generate & Open Portfolio Editor" that saves the draft and navigates to `/edit/talib`.
   - Ensure navigation between steps (Next / Back / Skip) persists all entered form fields to `localStorage` via `lib/onboarding.ts`.
   - If `/onboarding` or `/onboarding/media` is visited, redirect smoothly or integrate into the cohesive flow.

3. Verify Editor Hydration & Public Route Parity:
   - Ensure that when user lands on `/edit/talib` after onboarding, `PortfolioEditor` immediately hydrates the newly generated draft from `localStorage` (`afm:draft:talib`).
   - Confirm that the read-only live canvas (`FolioCanvas` -> `TasteFolio` with `FrameFolio`) and `BlockSidebar` display the exact custom content from onboarding.

4. Run `npm run build` using `run_command` in powershell:
   - Ensure 0 errors, 0 lint/type issues, and clean static page generation.

5. Write detailed report to `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_worker_m3_1\handoff.md` and send completion message back.
