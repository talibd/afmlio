# Milestone M3: End-to-End Onboarding-to-Editor Journey & Draft Generation Analysis

## 1. Executive Summary

Milestone M3 establishes the **Tailored Onboarding Form & Draft Generation** system for AFMLIO. It bridges user intake directly to the newly implemented **Frame taste template** and the **form-based BlockSidebar editor**.

This investigation maps the complete user journey:
1. **Intake Flow (`/onboarding` & `/onboarding/[step]`)**: A 5-step creative studio questionnaire with real-time state retention, split-screen live preview, and rich pre-filled sample defaults enabling instantaneous previewing.
2. **Draft Generation (`lib/onboarding.ts`)**: Transformation of `OnboardingState` into a fully populated `StoredPortfolio` draft saved to `localStorage` under `afm:draft:talib` (and portfolio index).
3. **Editor Hydration (`/edit/talib`)**: Immediate hydration inside `PortfolioEditor`, rendering the seeded draft in `FolioCanvas` with authentic Frame taste (Georgia typography, `#dfff45` accents, 2:1 hero featured banner, 2-column work grid, 2-column manifesto) and presenting all seeded blocks in `BlockSidebar` for direct form editing.

---

## 2. End-to-End User Journey Walkthrough

```
[ User Lands on /onboarding ]
          │
          ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Onboarding Flow (app/onboarding/[step]/page.tsx)                       │
│ ────────────────────────────────────────────────────────────────────── │
│ Step 1: Studio Identity & Hero (Brand name, Headline, Subline, Intro)  │
│ Step 2: Creative Disciplines (Films, Ads, Graphics, Custom tags)       │
│ Step 3: Multi-Project Showcase (3 Pre-filled projects + upload/URL)    │
│ Step 4: Statement & Manifesto (2-Column About headline & body copy)    │
│ Step 5: Contact & Taste Review (Email, Template choice, Draft trigger) │
└────────────────────────────────────────────────────────────────────────┘
          │
          │ User clicks "Create Portfolio" / "Launch Editor"
          ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Draft Generator (lib/onboarding.ts -> generateDraftFromOnboarding)    │
│ ────────────────────────────────────────────────────────────────────── │
│ - Constructs StoredPortfolio with:                                     │
│   • hero block (Headline \n Subline, bio, featured banner)             │
│   • featured blocks (1 per project with title, category, media)        │
│   • about block (2-column headline & manifesto copy)                   │
│   • skills block (discipline tags)                                     │
│   • contact block (email mailto CTA)                                   │
│ - Saves to localStorage['afm:draft:talib']                             │
│ - Upserts record to localStorage['afm:portfolio:index']                │
│ - Clears temporary onboarding session                                  │
└────────────────────────────────────────────────────────────────────────┘
          │
          │ router.push('/edit/talib?welcome=1')
          ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Portfolio Editor (/edit/talib)                                         │
│ ────────────────────────────────────────────────────────────────────── │
│ 1. Editor mounts, reads getDraft('talib') from localStorage            │
│ 2. FolioCanvas renders FrameFolio with Georgia type, #dfff45 accents,  │
│    2:1 featured piece, 2-column work grid, category filters, about     │
│ 3. BlockSidebar displays populated inline form rows for each block:    │
│    [Hero] [Project 1] [Project 2] [Project 3] [About] [Skills] [Contact│
│ 4. Typing in any sidebar input immediately updates live canvas preview │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Intake Form Specification

### Step 1: Studio Identity & Hero Headlines
- **Route**: `/onboarding/1` (and default view for `/onboarding`)
- **Title**: *Make the page yours*
- **Subtitle**: *These words appear directly in the Frame portfolio preview.*
- **Fields**:
  | Field | Key | Default Value | Purpose / Template Mapping |
  |---|---|---|---|
  | Studio / Creator Name | `studioName` | `"FRAME"` | Top nav logo badge, portfolio metadata, footer mark |
  | Main Headline | `heroLine1` | `"AI made visual."` | First line of Hero `<h1>` (Georgia, bold italic/serif) |
  | Secondary Headline | `heroLine2` | `"Human made creative."` | Second line of Hero `<h1>` (Georgia, highlighted/accent) |
  | Short Introduction | `intro` | `"A simple portfolio of films, advertisements, graphics and visual experiments."` | Hero subtitle `<p>`, SEO description, bio |
- **Live Preview**: Split-pane preview updates in real time on desktop viewports.

---

### Step 2: Creative Disciplines & Category Filters
- **Route**: `/onboarding/2`
- **Title**: *Creative disciplines & categories*
- **Subtitle**: *Choose the categories for your portfolio work filters and skill tags.*
- **Fields**:
  | Field | Key | Default Value | Purpose / Template Mapping |
  |---|---|---|---|
  | Disciplines | `disciplines` | `["Films", "Ads", "Graphics", "Visual Experiments"]` | Frame work category filter buttons (`All`, `Films`, `Ads`, `Graphics`) and `skills` block tags |
- **UI Components**: Interactive chips with remove buttons (`x`), quick-add suggested tags (`["3D Motion", "Creative Direction", "VFX", "Editorial", "Sound Design"]`), and custom text input.

---

### Step 3: Multi-Project Showcase (Selected Works)
- **Route**: `/onboarding/3`
- **Title**: *Curate selected work*
- **Subtitle**: *The first project serves as the large hero featured showcase. Projects populate the 2-column work grid.*
- **Fields** (per project item in `projects[]`):
  | Field | Key | Sample Defaults | Purpose / Template Mapping |
  |---|---|---|---|
  | Project Title | `title` | `"After Tomorrow"` | Card title and featured overlay title |
  | Category | `category` | `"film"` (from `disciplines` or dropdown) | Filter tag and eyebrow |
  | Short Detail / Runtime | `runtimeOrMeta` | `"AI short film · 04:18"` | Card metadata subtitle / runtime |
  | Media (Image / Video) | `imageUrl`, `mediaKind` | Curated sample Unsplash URL / `STUDENT_WORK[i].src` | Card media / hero banner (supports file upload & URL) |
  | Description | `description` | Speculative synopsis | Card body copy and modal lightbox copy |
- **Pre-filled Default Projects** (3 curated projects):
  1. *Project 1*: `"After Tomorrow"` (Category: `"film"`, Detail: `"AI short film · 04:18"`, Image: `STUDENT_WORK[0].src` / high-res cinematic still)
  2. *Project 2*: `"Tokyo Neon"` (Category: `"ad"`, Detail: `"Spec commercial · 00:30"`, Image: `STUDENT_WORK[1].src` / neon commercial still)
  3. *Project 3*: `"Metropolis 2099"` (Category: `"graphic"`, Detail: `"Generative visual identity"`, Image: `STUDENT_WORK[2].src` / geometric identity still)
- **Controls**: Add project button, delete project button (minimum 1), project reordering.

---

### Step 4: Statement & Manifesto (About Section)
- **Route**: `/onboarding/4`
- **Title**: *Artist statement & manifesto*
- **Subtitle**: *The 2-column About section pairs a bold editorial headline with your creative manifesto.*
- **Fields**:
  | Field | Key | Default Value | Purpose / Template Mapping |
  |---|---|---|---|
  | Statement Headline | `statementHeadline` | `"Less noise.\nMore work."` | Left column of Frame About section (`<h2>` with line break) |
  | Manifesto / Story | `statementBody` | `"FRAME is a visual archive for selected creative work. Films, ads and graphics are presented first. Everything else stays secondary so the work gets the attention."` | Right column of Frame About section (`<p>` editorial story) |

---

### Step 5: Contact, Taste & Draft Generation
- **Route**: `/onboarding/5`
- **Title**: *Contact & publish ready*
- **Subtitle**: *Set your studio contact email and review your portfolio draft before launching the editor.*
- **Fields**:
  | Field | Key | Default Value | Purpose / Template Mapping |
  |---|---|---|---|
  | Contact Email | `contactEmail` | `"talib@afm.edu"` | Top nav contact button mailto, Contact block CTA, footer mail link |
  | Taste Template | `templateId` | `"frame"` | Pre-selected primary template |
  | Summary Review Card | Visual confirmation | Studio name, project count, disciplines, contact email | Visual confirmation of draft contents before redirect |
- **Primary CTA**: *"Create My Portfolio →"* / *"Launch Editor"*
  - Executes `generateDraftFromOnboarding(state, "talib")`
  - Saves draft to `localStorage` under `afm:draft:talib`
  - Upserts to `afm:portfolio:index`
  - Clears `afm:onboarding:state`
  - Redirects via `router.push('/edit/talib?welcome=1')`

---

## 4. State Management & Navigation Architecture

### Storage Key: `afm:onboarding:state`
The onboarding state is persisted continuously to `localStorage` on every keystroke/change, guaranteeing that page reloads or back-button navigation preserve all entered data.

### Typed Interface (`lib/onboarding.ts`)
```typescript
export interface OnboardingProject {
  id: string
  title: string
  category: string
  runtimeOrMeta: string
  imageUrl: string
  mediaKind?: "image" | "video"
  description?: string
}

export interface OnboardingState {
  studioName: string
  heroLine1: string
  heroLine2: string
  disciplines: string[]
  projects: OnboardingProject[]
  statementHeadline: string
  statementBody: string
  contactEmail: string
  templateId: TemplateId
}
```

### Pre-filled Sample Defaults (`DEFAULT_ONBOARDING_STATE`)
To provide zero-friction onboarding, all 5 steps are initialized with comprehensive, publication-ready defaults. The user can either customize fields or simply click "Continue" through all 5 steps to produce a draft.

### Navigation Rules
- **Forward**: Validation ensures non-empty required fields; proceeds to next step (`/onboarding/[step+1]`).
- **Backward**: Navigates to previous step (`/onboarding/[step-1]`), retaining state.
- **Root URL (`/onboarding`)**: Automatically resolves to Step 1 or coordinates the step flow.
- **Direct Deep-Link**: Visiting `/onboarding/3` directly hydrates state from `localStorage` or falls back gracefully to `DEFAULT_ONBOARDING_STATE`.

---

## 5. Draft Generator Architecture (`generateDraftFromOnboarding`)

When Step 5 is submitted, `generateDraftFromOnboarding(state, slug)` builds a `StoredPortfolio` conforming to `lib/portfolio-store.ts`.

### Block Generation Logic
1. **Hero Block (`id: "hero-intro"`, `type: "hero"`)**:
   - `heading`: `${state.heroLine1}\n${state.heroLine2}`
   - `eyebrow`: `state.studioName`
   - `body`: `state.intro || state.statementBody`
   - `image`: `state.projects[0]?.imageUrl || STUDENT_WORK[0].src`
   - `mediaKind`: `state.projects[0]?.mediaKind || "image"`
   - `cta`: `"VIEW WORK →"`
   - `ctaHref`: `"#work"`

2. **Featured Project Blocks (`id: "featured-${i+1}"`, `type: "featured"`)**:
   - For each project in `state.projects`:
     - `heading`: `project.title`
     - `eyebrow`: `project.category`
     - `body`: `project.runtimeOrMeta || project.description || "Selected work"`
     - `image`: `project.imageUrl`
     - `mediaKind`: `project.mediaKind || "image"`
     - `imageAlt`: `project.title`
     - `cta`: `"WATCH →"`
     - `ctaHref`: `"#"`

3. **About Block (`id: "about-statement"`, `type: "about"`)**:
   - `heading`: `state.statementHeadline`
   - `body`: `state.statementBody`
   - `cta`: `"CONTACT ↗"`
   - `ctaHref`: `"#contact"`

4. **Skills Block (`id: "skills-disciplines"`, `type: "skills"`)**:
   - `heading`: `"Disciplines & Focus"`
   - `items`: `state.disciplines`

5. **Contact Block (`id: "contact-cta"`, `type: "contact"`)**:
   - `heading`: `"Have an idea?\nLet's make it."`
   - `body`: `state.disciplines.join(" · ")`
   - `cta`: `${state.contactEmail.toUpperCase()} ↗`
   - `ctaHref`: `mailto:${state.contactEmail}`

### Top-Level Draft Properties
- `slug`: `"talib"` (or generated custom slug)
- `name`: `state.studioName`
- `school`: `state.studioName`
- `title`: `state.heroLine2`
- `bio`: `state.statementBody`
- `template`: `"frame"`
- `project`: `{ name: state.projects[0]?.title, copy: state.projects[0]?.runtimeOrMeta }`
- `skills`: `state.disciplines`
- `media`: `{ stills: state.projects.map(p => p.imageUrl), clips: [] }`
- `settings`: `{ email: state.contactEmail, showEmail: true, notifyViews: false }`
- `blocks`: `[heroBlock, ...featuredBlocks, aboutBlock, skillsBlock, contactBlock]`
- `seo`: `defaultSeo(...)`
- `chrome`: `defaultChrome()`

---

## 6. Editor Hydration & Live Canvas Verification

### Hydration Sequence in `PortfolioEditor`
1. `PortfolioEditor` mounts on route `/edit/talib`.
2. `useEffect` triggers on client mount:
   ```typescript
   const stored = getDraft(slug) // reads localStorage.getItem("afm:draft:talib")
   if (stored) {
     const merged = {
       ...initial,
       ...stored,
       template: "frame",
       blocks: stored.blocks?.length && !isStaleLayout(stored.blocks)
         ? stored.blocks
         : initial.blocks
     }
     resetDraft(merged)
   }
   ```
3. Because `stored.blocks` contains valid work types (`"hero"`, `"featured"`, `"about"`, `"skills"`, `"contact"`), `isStaleLayout` returns `false`, ensuring 100% preservation of all onboarding-generated blocks.

### Canvas Rendering (`FolioCanvas` -> `FrameFolio`)
- **Navigation**: Renders studio name as brand logo and "Contact" mail button.
- **Hero**: Renders two-line headline with Georgia styling, `#dfff45` highlight, and large 2:1 featured piece.
- **Work Grid**: `extractFramePieces` dynamically aggregates all `featured` blocks into the 2-column card grid, generating dynamic category filter buttons (`All`, `Films`, `Ads`, `Graphics`).
- **About**: Renders 2-column editorial grid with bold statement heading and manifesto paragraph.
- **Skills**: Renders uppercase discipline tags.
- **Contact**: Renders closing invitation with email mailto button.

### Sidebar Form Editing (`BlockSidebar`)
- Each block generated from onboarding is mapped to an expandable form row in `BlockSidebar`.
- Editing project titles, headlines, image URLs, or adding skills in `BlockSidebar` synchronously calls `onBlocks` / `setDraft`, instantly re-rendering `FolioCanvas`.

---

## 7. Edge Cases & Defensive Engineering

| # | Edge Case | Potential Failure Mode | Mitigation Strategy |
|---|---|---|---|
| 1 | Empty form fields | User clears input and submits | Provide robust fallback values in `generateDraftFromOnboarding` so draft never renders `undefined` or broken layouts |
| 2 | SSR / `window` undefined | Next.js pre-rendering crashes on `localStorage` access | Wrap all storage reads/writes in `typeof window !== "undefined"` and `try...catch` blocks |
| 3 | LocalStorage quota exceeded | Large base64 image uploads cause `QuotaExceededError` | Cap image upload size to 1.5 MB, video to 3 MB; provide direct URL paste inputs; fallback gracefully |
| 4 | Invalid / Out-of-bounds step URL | User enters `/onboarding/99` or `/onboarding/invalid` | Validate step parameter (`1`..`5`) and redirect invalid steps to `/onboarding/1` |
| 5 | Browser back/forward navigation | State lost between step transitions | Continuous persistence to `afm:onboarding:state` on change; load saved state on step mount |
| 6 | Slug mismatch on redirect | User redirected to `/edit/talib` but draft saved under custom slug | Save draft to BOTH `afm:draft:${slug}` AND `afm:draft:talib`, or redirect directly to `/edit/${slug}` with index registration |
| 7 | Zero projects configured | User deletes all projects in Step 3 | Enforce minimum 1 project in UI, and backfill with `DEFAULT_ONBOARDING_STATE.projects` if array is empty |

---

## 8. Implementation & Verification Checklist for Worker M3

### Phase 1: Core Onboarding Logic (`lib/onboarding.ts`)
- [ ] Create `lib/onboarding.ts`.
- [ ] Export `OnboardingProject`, `OnboardingState` interfaces.
- [ ] Export `DEFAULT_ONBOARDING_STATE` with high-aesthetic default content.
- [ ] Export client persistence helpers: `getSavedOnboardingState()`, `saveOnboardingState(state)`, `clearOnboardingState()`.
- [ ] Export `generateDraftFromOnboarding(data: OnboardingState, slug: string): StoredPortfolio`.

### Phase 2: 5-Step Intake UI (`app/onboarding/[step]/page.tsx` & `components/`)
- [ ] Implement/refactor `app/onboarding/[step]/page.tsx` supporting steps `1` to `5`.
- [ ] Implement Step 1 (Identity & Hero Headlines) with live preview.
- [ ] Implement Step 2 (Creative Disciplines & Tag Chips).
- [ ] Implement Step 3 (Multi-Project Showcase with file upload / URL input).
- [ ] Implement Step 4 (Statement Headline & Manifesto Body).
- [ ] Implement Step 5 (Contact Email, Taste Selection, Summary Review, and Draft Creation Trigger).
- [ ] Update `/onboarding/page.tsx` to redirect or render the step flow.
- [ ] Verify back and forward navigation across all steps.

### Phase 3: Draft Generation & Editor Redirection
- [ ] On Step 5 completion, execute `generateDraftFromOnboarding`.
- [ ] Save draft to `afm:draft:talib` via `saveDraft()`.
- [ ] Upsert portfolio index in `localStorage`.
- [ ] Clear temporary onboarding state.
- [ ] Redirect to `/edit/talib?welcome=1`.

### Phase 4: Editor Hydration & Sidebar Verification
- [ ] Verify `/edit/talib` hydrates the newly generated draft immediately on load.
- [ ] Verify `FolioCanvas` renders the Frame template with all seeded projects in the 2-column grid.
- [ ] Verify `BlockSidebar` displays inline form rows for all generated blocks.
- [ ] Verify editing any field in `BlockSidebar` updates `FolioCanvas` in real time.
- [ ] Run `npm run build` to verify 0 type or lint errors.
