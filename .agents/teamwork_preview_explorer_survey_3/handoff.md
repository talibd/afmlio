# Handoff Report — Requirement 3: Tailored Onboarding Form & Draft Generation

**Agent**: Explorer Survey 3  
**Working Directory**: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_explorer_survey_3`  
**Target Document**: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_explorer_survey_3\analysis.md`

---

## 1. Observation

1. **Onboarding Page Implementation (`app/onboarding/[step]/page.tsx:39-44, 62, 101, 153`)**:
   - Lines 39-44:
     ```ts
     async function next() {
       "use server"
       if (n >= 5) redirect("/dashboard")
       redirect(`/onboarding/${n + 1}`)
     }
     ```
   - Forms in steps 1, 2, and 4 call `action={next}` without reading `FormData` or persisting user input to cookies, localStorage, or database.
   - Steps 3 (`SkillChips`) and 5 (`TemplateChoices`) are client widgets with component-local state that do not write to any persistent store before navigation.

2. **Editor Hydration Logic (`lib/portfolio-store.ts:139-185`, `components/portfolio-editor.tsx:96-140`)**:
   - `getBaseDraft(slug)` in `lib/portfolio-store.ts:143-155` loads `getDemoPortfolio(slug)` (`PORTFOLIOS[0]` in `lib/demo.ts:100-113`) and seeds blocks using `blocksOf()` with hardcoded AFM demo text.
   - `getStoredOnboardingMedia()` exists in `lib/portfolio-store.ts:116-133` but is **never invoked** anywhere in `portfolio-store.ts` or `portfolio-editor.tsx`.
   - Completing onboarding and opening `/edit/talib` results in loading the hardcoded demo draft ("Talib Khan", "Night path", "Campus Connect") rather than any user-provided data.

3. **Frame Reference Template Content Requirements (`C:/Users/talib/Downloads/frame-ai-simple-portfolio.html:22-36`)**:
   - Nav: Logo brand text (`FRAME`), Work (`#work`), About (`#about`), Contact button (`#contact`).
   - Hero: Two-line heading `<h1>AI made visual.<br><span>Human made creative.</span></h1>`, manifesto paragraph, `VIEW WORK →` button, and featured showcase overlay (`After Tomorrow`, `AI FILM · 04:18`, `01 / 06`, cover image).
   - Selected Work: Filter buttons (`All`, `Films`, `Ads`, `Graphics`), 2-column grid of 6 project cards with category badges, titles, descriptions, and click-to-open lightbox modal.
   - About: Large statement `<h2>Less noise.<br>More work.</h2>` and bio paragraph.
   - CTA / Contact: Heading `<h2>Have an idea?<br><span>Let's make it.</span></h2>`, discipline tag string (`Films · Ads · Graphics · Visual experiments`), and email mailto link (`HELLO@FRAMESTUDIO.AI ↗`).
   - Footer: `© 2026 FRAME` and `AI FILMS · ADS · GRAPHICS`.

4. **Existing Frame Folio Implementation (`components/taste-folio.tsx:63-103, 136-202`)**:
   - `extractFramePieces()` pulls images from `portfolio.media.stills` and blocks of type `still`, `featured`, and `hero`, falling back to `STUDENT_WORK` if empty.
   - `FrameFolio` dynamically renders hero heading split on `\n` or ` / `, dynamic filter buttons based on `piece.category`, custom blocks (`skills`, `why`, `features`, `reviews`, `faq`, `still`), and contact email from `portfolio.settings.email`.

---

## 2. Logic Chain

1. **From Observation 1 & 2**: The current onboarding flow discards all user input across steps, and the editor has no connection to onboarding data. Therefore, completing the current onboarding flow cannot produce a personalized draft in the editor.
2. **From Observation 3 & 4**: The new Frame template relies on specific data entities:
   - Studio/Brand Name (Nav & Footer)
   - 2-Part Hero Headline & Accent
   - Multi-Project Work Grid with category slugs (`film`, `ad`, `graphic`)
   - About Statement Headline & Studio Manifesto
   - Direct Contact Email
3. **From 1 & 2**: To ensure that finishing onboarding immediately populates the Frame template with all required data, onboarding must:
   - Collect these exact fields across dedicated, clear steps.
   - Maintain client-side state across steps in `localStorage` under a dedicated key (e.g. `"afm:onboarding:data"`).
   - Execute a draft generator (`generateDraftFromOnboarding()`) on final completion that creates a fully populated `StoredPortfolio` with seeded `FolioBlock[]` records (`hero`, `still`/`featured`, `about`, `contact`) and writes it directly to `"afm:draft:talib"`.
4. **Conclusion**: When the editor mounts, it reads `"afm:draft:talib"` and immediately renders a 100% complete, rich Frame portfolio matching the reference HTML.

---

## 3. Caveats

- **Slug Identification**: The current prototype hardcodes the primary user slug as `"talib"`. The draft generator should populate `"afm:draft:talib"` (and dynamically support custom slugs if generated from the user's studio name).
- **Image Upload Storage Limits**: LocalStorage has a ~5MB quota. Uploaded project stills must be resized/compressed using `persistImageFile()` in `lib/image-utils.ts` or fallback to high-res Unsplash URLs.
- **Cross-Template Compatibility**: The generated `StoredPortfolio` must remain compatible with other tastes (`walk`, `ground`, `aperture`, `folio`, `flood`) by generating standard `FolioBlock` types (`hero`, `still`, `about`, `contact`).

---

## 4. Conclusion

The onboarding flow must be updated from asking generic academic questions to a 5-step creative studio intake:
1. **Identity & Contact**: Studio/Portfolio Name, Hero Headline (Line 1), Hero Accent (Line 2), Contact Email.
2. **Creative Disciplines & Filters**: Multi-select chips for `Films`, `Ads`, `Graphics`, `Motion`, `3D & CGI`, `Editorial`.
3. **Project Showcase**: 3-6 curated projects with title, category, format/note, and image still (pre-loaded with high-quality defaults from `STUDENT_WORK`).
4. **Statement & Ethos**: Statement Headline ("Less noise. / More work.") and Manifesto Bio.
5. **Taste Selection & Launch**: Frame taste selected by default, generating the draft and redirecting to `/edit/talib`.

Draft generation is achieved via `generateDraftFromOnboarding(onboardingData, "talib")` saving directly to `localStorage.setItem("afm:draft:talib", ...)` to ensure instant, complete hydration in `PortfolioEditor`.

---

## 5. Verification Method

1. **Codebase Inspection**:
   - Review detailed specification and data model in `.agents/teamwork_preview_explorer_survey_3/analysis.md`.
   - Inspect `app/onboarding/[step]/page.tsx`, `components/onboarding-shell.tsx`, `components/taste-folio.tsx`, and `lib/portfolio-store.ts`.
2. **Independent Verification Flow**:
   - Complete onboarding through steps 1 to 5 with custom answers.
   - Inspect `localStorage.getItem("afm:draft:talib")` in browser devtools to verify that all fields, blocks, media stills, and settings are populated.
   - Navigate to `/edit/talib` and verify that the canvas live preview and sidebar display the exact onboarding data matching `frame-ai-simple-portfolio.html`.
3. **Build & Type Check**:
   - Execute `npm run build` to confirm zero lint or TypeScript compilation errors.
