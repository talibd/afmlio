# Comprehensive Survey & Analysis: Requirement 3 (Tailored Onboarding Form & Draft Generation)

**Explorer**: Explorer Survey 3  
**Date**: 2026-08-16  
**Scope**: Requirement 3 of Original Request (`.agents/ORIGINAL_REQUEST.md`)  
**Target Reference**: `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html` (FRAME AI Portfolio Template)

---

## 1. Executive Summary

This investigation analyzes the onboarding flow and draft generation pipeline in `afmlio` to enable complete, seamless creation of a portfolio populated with all data required by the new **FRAME** taste template (`C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`).

### Key Findings:
1. **Disconnected Onboarding Flow**: The current onboarding flow (`app/onboarding/[step]/page.tsx`, `components/onboarding-shell.tsx`) is largely non-functional with respect to data persistence. Steps 1, 2, and 4 use server actions that redirect without capturing form data; Steps 3 and 5 maintain unpersisted client state. Completing onboarding does not create or update any draft in localStorage or the database.
2. **Missing Editor Seeding Pipeline**: `PortfolioEditor` (`components/portfolio-editor.tsx`) hydrates exclusively from `localStorage.getItem("afm:draft:" + slug)` or falls back to static hardcoded demo portfolios (`PORTFOLIOS[0]` in `lib/demo.ts`). There is currently no mechanism linking onboarding answers to the editor draft.
3. **Severe Content Mismatch with Reference Template**:
   - The reference template showcases an editorial AI creative archive featuring:
     - Multi-project visual gallery (6 items) with interactive category filters (`Films`, `Ads`, `Graphics`).
     - Hero featured showcase with metadata (title, category/runtime, counter `01 / 06`).
     - Punchy two-line hero headline (`AI made visual. / Human made creative.`).
     - Studio statement (`Less noise. / More work.`) and manifesto bio.
     - Direct CTA with email action (`hello@framestudio.ai`) and categorized skill tags.
     - Studio branding / logo in nav and footer.
   - The current onboarding flow asks generic AFM student questions (single project name, generic engineering/analytics skills, student headshot) that leave the Frame template devoid of essential content.
4. **Actionable Solution**: A revamped, unified onboarding state manager (via client-persisted localStorage state or cookie-backed store) with tailored question steps and an explicit `generateDraftFromOnboarding()` transformer function will guarantee that 100% of the reference template's dynamic fields are populated upon onboarding completion.

---

## 2. Current Onboarding Architecture & Codebase Trace

### 2.1 Route Structure & Pages

| Route | File Path | Current Purpose | Persistence Mechanism |
|---|---|---|---|
| `/onboarding/media` | `app/onboarding/media/page.tsx` | Drag & drop media upload (stills, clips, link) | Writes to `localStorage.getItem("afm:onboarding:media")` |
| `/onboarding/1` | `app/onboarding/[step]/page.tsx` | Name & Professional Title + Headshot | **None** (Server action `next()` ignores form data and redirects to `/onboarding/2`) |
| `/onboarding/2` | `app/onboarding/[step]/page.tsx` | Short Intro Textarea | **None** (Server action `next()` ignores form data and redirects to `/onboarding/3`) |
| `/onboarding/3` | `app/onboarding/[step]/page.tsx` | Skill chips | **None** (`SkillChips` uses local `useState`, link goes to `/onboarding/4`) |
| `/onboarding/4` | `app/onboarding/[step]/page.tsx` | One Project (Name + Description) | **None** (Server action `next()` ignores form data and redirects to `/onboarding/5`) |
| `/onboarding/5` | `app/onboarding/[step]/page.tsx` | Template picker (`TemplateChoices`) | **None** (`TemplateGallery` uses local `useState`, link goes to `/dashboard`) |

### 2.2 Component Breakdown

- **`components/onboarding-shell.tsx`** (lines 6-43):
  - Defines `ONBOARDING_STEPS` containing step metadata (`media`, `1`, `2`, `3`, `4`, `5`).
  - `OnboardingShell`: Layout wrapper displaying step position (`position / total`), title, subtitle, content, and `ObNav` footer.
- **`components/media-list.tsx`** (lines 68-322):
  - `MediaList`: Supports dragging/uploading files and pasting external links. Saves `{ stills: string[], clips: string[], filmLink?: string }` under key `"afm:onboarding:media"`.
  - `HeadshotField`: Avatar uploader with local preview.
- **`components/skill-chips.tsx`** (lines 15-52):
  - Hardcoded list: `Engineering`, `Product design`, `Data & analytics`, `Content & writing`, `Markets & research`, `Something else`.
  - State `picked` is purely local to the component.
- **`components/template-choices.tsx` & `components/template-gallery.tsx`**:
  - Displays grid of taste previews (`frame`, `walk`, `ground`, `aperture`, `folio`, `flood`).
  - Action `"pick"` sets local state `picked` but has no onChange/onSubmit hook to propagate selection to storage or URL.

### 2.3 Draft Generation & Persistence Pipeline (Current vs Missing)

```
[Onboarding Steps: media -> 1 -> 2 -> 3 -> 4 -> 5]
                        │ (Data is discarded on each step transition)
                        ▼
            [Redirect to /dashboard]
                        │ (User clicks "Edit" for /edit/talib)
                        ▼
            [PortfolioEditor (app/edit/[slug]/page.tsx)]
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
[localStorage.getItem("afm:draft:talib")] [getBaseDraft("talib") from lib/demo.ts]
 (Found? Use stored draft)                (Not found? Use hardcoded Talib Khan demo)
```

- In `lib/portfolio-store.ts`:
  - `getStoredOnboardingMedia()` (lines 116-133) parses `"afm:onboarding:media"`, but it is **never called** in `getBaseDraft()` or `hydrateDraft()`.
  - `getBaseDraft()` (lines 139-156) loads default portfolio constants from `PORTFOLIOS[0]` in `lib/demo.ts`.
  - `saveDraft(slug, draft)` (lines 198-203) writes to `localStorage.getItem("afm:draft:" + slug)`.

---

## 3. Reference Template (`frame-ai-simple-portfolio.html`) Data Requirements

Deconstructing `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html` yields the following comprehensive content schema:

### Section 1: Navigation (`<nav>`)
- **Logo / Brand Name**: Georgia serif 20px (e.g. `FRAME` or Studio Brand Name).
- **Navigation Links**: Direct anchor links (`#work`, `#about`).
- **Header Action Button**: `Contact` button linking to `#contact` or `mailto:...`.

### Section 2: Hero Section (`.hero`)
- **Main Heading (`h1`)**: Split into two lines / punchy statement with muted highlight span:
  - Line 1: `AI made visual.`
  - Line 2 / Highlight span: `Human made creative.`
- **Description Paragraph (`p`)**: Subtitle / positioning copy (e.g. `A simple portfolio of AI-generated films, advertisements, graphics and visual experiments.`).
- **Hero Action (`.hero-link`)**: Button labeled `VIEW WORK →` anchored to `#work`.
- **Featured Hero Showcase (`.featured`)**:
  - Image URL (`img` with cover fit, aspect ratio `2/1` on desktop, `1/1` on mobile).
  - Overlay Title: e.g. `After Tomorrow`.
  - Overlay Metadata / Tag: e.g. `AI FILM · 04:18`.
  - Overlay Counter: `01 / 06` (current featured index / total work items).

### Section 3: Selected Work (`.work` #work)
- **Section Title**: `Selected work`
- **Category Filter Tabs (`.filters`)**:
  - `All`
  - Dynamic category list: `Films` (`film`), `Ads` (`ad`), `Graphics` (`graphic`), etc.
- **Work Cards Grid (`.grid`)**: 2-column responsive grid of articles:
  - Each Card (`.card`):
    - `data-category`: Category slug (`film`, `ad`, `graphic`).
    - `data-title`: Project Name (`After Tomorrow`, `Maison Noire`, `Synthetic Nature`, `Human / Machine`, `Parallel`, `Future Product`).
    - `data-desc`: Short summary / format (`AI short film · 04:18`, `Luxury campaign · 00:45`, `Generative image series`, etc.).
    - `image`: Image URL (high-res still).
    - `card-type`: Category display label (`Film`, `Ad`, `Graphics`).
- **Interactive Lightbox Modal (`.modal`)**:
  - Shows full image, title, and description when any card is clicked.

### Section 4: About Section (`.about` #about)
- **Grid Layout**: 2 columns (Headline + Narrative).
- **Headline (`h2`)**: Large serif statement (e.g. `Less noise.<br>More work.`).
- **Bio Copy (`p`)**: Studio ethos / manifesto (e.g. `FRAME is a visual archive for AI-generated creative work. Films, ads and graphics are presented first. Everything else stays secondary so the work gets the attention.`).

### Section 5: CTA / Contact Section (`.cta` #contact)
- **CTA Headline (`h2`)**: Serif heading with accent highlight (`Have an idea?<br><span>Let's make it.</span>`).
- **Category Subtext (`p`)**: Pipe or bullet-separated discipline list (`Films · Ads · Graphics · Visual experiments`).
- **Direct Contact Button (`a`)**: Mailto link with uppercase email (`HELLO@FRAMESTUDIO.AI ↗`, href `mailto:hello@framestudio.ai`).

### Section 6: Footer (`<footer>`)
- **Left**: Copyright string (e.g. `© 2026 FRAME`).
- **Right**: Discipline list in uppercase (e.g. `AI FILMS · ADS · GRAPHICS`).

---

## 4. Gap Analysis: Current Onboarding vs. Reference Template

| Template Requirement | Frame Template Requirement | Current Onboarding Implementation | Identified Gap & Remediation |
|---|---|---|---|
| **Studio / Folio Name** | "FRAME" or Custom Studio Name (Used in Nav, Footer, SEO) | Personal Name ("Talib Khan") | Clarify field to "Portfolio / Studio Name" (e.g. "FRAME Studio" or "Talib Khan"). |
| **Hero Headline & Accent** | 2-part punchy headline: "AI made visual." + "Human made creative." | "Professional title" single input ("Night path") | Replace single title with Headline + Accent Subheading (or split with `/`). |
| **Hero Featured Showcase** | High-res image + title ("After Tomorrow") + runtime/tag ("AI FILM · 04:18") | None (Uses headshot or generic still) | Designate Project #1 as the Hero Featured Showcase with title, runtime/meta, and image. |
| **Work Categories / Filters** | Category buttons: "Films", "Ads", "Graphics", "Motion", etc. | Traditional academic skills: "Engineering", "Design", "Data" | Revamp Step 2 with creative visual categories (`Films`, `Ads`, `Graphics`, `Motion`, `3D & CGI`, `Editorial`). |
| **Multi-Project Portfolio Grid** | 4 to 6 curated projects with title, category, format/note, and image | Single project text fields ("Project name", "What you built") | Support multi-project curation (3-6 projects) with curated visual presets and custom uploads. |
| **About Headline & Manifesto** | Statement ("Less noise. / More work.") + narrative paragraph | Single text intro ("Write a short intro") | Structure About step with Statement Headline + Narrative Bio. |
| **Contact Email & CTA Action** | Direct email CTA ("HELLO@FRAMESTUDIO.AI ↗") + mailto link | None (Hardcoded to talib@afm.edu in default settings) | Add explicit Contact Email field during onboarding step 1 or step 4. |
| **Taste Selection & Generation** | Frame template as primary default | Defaults to "walk"; selection not saved to draft | Set "frame" as default choice, persist selection, and generate draft immediately. |
| **Data Persistence** | Seamless transition from form to editor | Server actions ignore data; editor loads demo defaults | Build unified `OnboardingStore` (localStorage `"afm:onboarding:data"`) + `generateDraftFromOnboarding()`. |

---

## 5. Detailed Specification for Tailored Onboarding Form

To deliver a high-converting, intuitive, and complete onboarding experience, the flow is structured into **5 coherent steps**:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Step 1    │     │    Step 2    │     │    Step 3    │     │    Step 4    │     │    Step 5    │
│   Identity   │ ──► │  Disciplines │ ──► │ Project Work │ ──► │    About     │ ──► │ Taste & Draft│
│  & Contact   │     │  & Filters   │     │   Showcase   │     │  Statement   │     │  Generation  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Step 1: Studio Identity & Contact (`/onboarding/1`)
- **Title**: `Your name and studio`
- **Subtitle**: `This defines your logo, hero headline, and direct contact.`
- **Fields**:
  1. `name` (Text input, Required):
     - **Label**: "Portfolio / Studio Name"
     - **Placeholder**: "FRAME" or "Talib Khan"
     - **Destination**: Nav logo, footer copyright, SEO title.
  2. `headline` (Text input, Required):
     - **Label**: "Hero Headline (Line 1)"
     - **Placeholder**: "AI made visual."
     - **Destination**: Hero `h1` main line.
  3. `headlineAccent` (Text input, Required):
     - **Label**: "Hero Subheading / Highlight (Line 2)"
     - **Placeholder**: "Human made creative."
     - **Destination**: Hero `h1` accent `<span>` and portfolio `title`.
  4. `email` (Email input, Required):
     - **Label**: "Contact Email"
     - **Placeholder**: "hello@framestudio.ai"
     - **Destination**: Contact CTA button (`mailto:`), settings email.

### Step 2: Creative Disciplines & Filters (`/onboarding/2`)
- **Title**: `What kind of work do you create?`
- **Subtitle**: `Pick the categories that will appear on your work filter tabs.`
- **Preset Options (Multi-select Chips)**:
  - 🎬 `Films` (AI Films & Narrative Shorts) — slug: `film`
  - 📢 `Ads` (Commercials & Brand Campaigns) — slug: `ad`
  - 🎨 `Graphics` (Key Visuals & Generative Series) — slug: `graphic`
  - ⚡ `Motion` (Motion Graphics & Title Sequences) — slug: `motion`
  - 🌐 `3D & CGI` (Synthetic Worlds & Assets) — slug: `3d`
  - 📖 `Editorial` (Visual Essays & Concept Art) — slug: `editorial`
  - ➕ `Custom Category` (User can type a custom tag)
- **Default Selection**: `["Films", "Ads", "Graphics"]`
- **Destination**: Filter buttons in `.taste-frame-filters`, footer tags, and contact subtitle.

### Step 3: Curated Project Showcase (`/onboarding/3`)
- **Title**: `Curate your projects`
- **Subtitle**: `Add your key pieces. The first project will be featured prominently in your Hero.`
- **UI Architecture**: Multi-card list (3 to 6 cards) with "Add project" and pre-loaded high-quality starter presets from `STUDENT_WORK`.
- **Fields per Project**:
  1. `title` (Text input): Project Title (e.g. "After Tomorrow", "Maison Noire", "Synthetic Nature").
  2. `category` (Dropdown / Select): Matches selected categories from Step 2 (e.g. `Films` / `film`, `Ads` / `ad`, `Graphics` / `graphic`).
  3. `note` / `meta` (Text input): Subtitle / Format / Runtime (e.g. "AI short film · 04:18", "Luxury campaign · 00:45").
  4. `image` (Image Uploader / Preset Picker): Image URL or uploaded local file (using `persistImageFile` from `lib/image-utils.ts`).
- **Hero Showcase Badge**: The first project in the list is automatically tagged as `Hero Featured Showcase (01 / 06)`.

### Step 4: Statement & Ethos (`/onboarding/4`)
- **Title**: `Your creative statement`
- **Subtitle**: `A clean, confident manifesto for your work.`
- **Fields**:
  1. `aboutHeadline` (Text input, Required):
     - **Label**: "Statement Headline"
     - **Placeholder**: "Less noise. / More work."
     - **Destination**: About section `h2`.
  2. `bio` (Textarea, Required):
     - **Label**: "Studio Manifesto / About Copy"
     - **Placeholder**: "FRAME is a visual archive for AI-generated creative work. Films, ads and graphics are presented first. Everything else stays secondary so the work gets the attention."
     - **Destination**: About section paragraph and hero body copy.

### Step 5: Visual Taste & Final Generation (`/onboarding/5`)
- **Title**: `Choose your visual taste`
- **Subtitle**: `Select Frame for the editorial AI archive, or explore alternative layouts.`
- **Choices**:
  - `frame` (Default & Highlighted with "Recommended" badge)
  - `walk`, `ground`, `aperture`, `folio`, `flood`
- **Finish Button**: `Generate & Open Portfolio Editor`
  - Action: Invokes `createDraftFromOnboarding()`, saves to `localStorage.setItem("afm:draft:talib", ...)` and redirects to `/edit/talib`.

---

## 6. Draft Transformation & State Persistence Architecture

### 6.1 Unified Onboarding Data Model (`lib/onboarding.ts`)

```typescript
export type OnboardingProject = {
  id: string
  title: string
  category: string
  categorySlug: "film" | "ad" | "graphic" | string
  note: string
  image: string
}

export type OnboardingState = {
  name: string
  headline: string
  headlineAccent: string
  email: string
  categories: string[]
  projects: OnboardingProject[]
  aboutHeadline: string
  bio: string
  template: TemplateId
}
```

### 6.2 Default Preset State (Ensures Instant Zero-Friction Completion)

```typescript
export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  name: "FRAME",
  headline: "AI made visual.",
  headlineAccent: "Human made creative.",
  email: "hello@framestudio.ai",
  categories: ["Films", "Ads", "Graphics"],
  projects: [
    {
      id: "p1",
      title: "After Tomorrow",
      category: "Films",
      categorySlug: "film",
      note: "AI short film · 04:18",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1800&q=90",
    },
    {
      id: "p2",
      title: "Maison Noire",
      category: "Ads",
      categorySlug: "ad",
      note: "Luxury campaign · 00:45",
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=90",
    },
    {
      id: "p3",
      title: "Synthetic Nature",
      category: "Graphics",
      categorySlug: "graphic",
      note: "Generative image series",
      image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=90",
    },
    {
      id: "p4",
      title: "Human / Machine",
      category: "Graphics",
      categorySlug: "graphic",
      note: "Editorial visual series",
      image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=90",
    },
    {
      id: "p5",
      title: "Parallel",
      category: "Films",
      categorySlug: "film",
      note: "Concept film · 02:40",
      image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=90",
    },
    {
      id: "p6",
      title: "Future Product",
      category: "Ads",
      categorySlug: "ad",
      note: "Product campaign · 00:30",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=90",
    },
  ],
  aboutHeadline: "Less noise.\nMore work.",
  bio: "FRAME is a visual archive for AI-generated creative work. Films, ads and graphics are presented first. Everything else stays secondary so the work gets the attention.",
  template: "frame",
}
```

### 6.3 Pure Transformer Function: `generateDraftFromOnboarding()`

```typescript
import { createBlock } from "@/lib/blocks"
import type { StoredPortfolio } from "@/lib/portfolio-store"

export function generateDraftFromOnboarding(
  state: OnboardingState,
  slug = "talib",
): StoredPortfolio {
  const template = state.template || "frame"
  const heroImage = state.projects[0]?.image || DEFAULT_ONBOARDING_STATE.projects[0].image
  const combinedTitle = `${state.headline} / ${state.headlineAccent}`

  const basePortfolio = {
    slug,
    name: state.name,
    title: combinedTitle,
    school: state.name,
    bio: state.bio,
    status: "draft" as const,
    template,
    project: {
      name: state.projects[0]?.title ?? "After Tomorrow",
      copy: state.projects[0]?.note ?? "AI short film · 04:18",
    },
    skills: state.categories,
  }

  // Generate blocks tailored for Frame template
  const heroBlock = {
    ...createBlock("hero", basePortfolio, template),
    id: "hero-1",
    heading: `${state.headline}\n${state.headlineAccent}`,
    body: state.bio,
    image: heroImage,
    cta: "VIEW WORK →",
    ctaHref: "#work",
  }

  const aboutBlock = {
    ...createBlock("about", basePortfolio, template),
    id: "about-1",
    heading: state.aboutHeadline,
    body: state.bio,
  }

  const contactBlock = {
    ...createBlock("contact", basePortfolio, template),
    id: "contact-1",
    heading: "Have an idea?\nLet's make it.",
    body: state.categories.join(" · "),
    cta: `${state.email.toUpperCase()} ↗`,
    ctaHref: `mailto:${state.email}`,
  }

  const stillBlocks = state.projects.map((p, idx) => ({
    ...createBlock("still", basePortfolio, template),
    id: `still-${idx + 1}`,
    heading: p.title,
    body: p.note,
    image: p.image,
  }))

  const draft: StoredPortfolio = {
    ...basePortfolio,
    blocks: [heroBlock, ...stillBlocks, aboutBlock, contactBlock],
    media: {
      stills: state.projects.map((p) => p.image),
      clips: [],
      filmLink: undefined,
    },
    settings: {
      email: state.email,
      showEmail: true,
      notifyViews: false,
    },
    seo: {
      title: `${state.name} — AI Portfolio`,
      description: state.bio,
      indexable: true,
    },
    chrome: {
      navLinks: [
        { label: "Work", href: "#work" },
        { label: "About", href: "#about" },
      ],
      navCta: { label: "Contact", href: "#contact" },
      footerColumns: [],
    },
    updatedAt: Date.now(),
  }

  return draft
}
```

---

## 7. Concrete Implementation Plan

### Step 1: Storage & State Management Helper (`lib/onboarding.ts`)
- Implement `loadOnboardingState()`, `saveOnboardingState(patch)`, `generateDraftFromOnboarding()`, and `finalizeOnboardingAndSaveDraft(slug)`.
- Use `localStorage.getItem("afm:onboarding:data")` so state is safely preserved across browser refreshes and back/forward navigation.

### Step 2: Update Onboarding Steps in `app/onboarding/[step]/page.tsx`
- Convert steps to interactive client-connected views or cohesive forms:
  - Step 1: Inputs for `name`, `headline`, `headlineAccent`, `email`.
  - Step 2: Creative discipline chips (`Films`, `Ads`, `Graphics`, etc.) with multi-select toggling.
  - Step 3: Curated project showcase editor with preset work items and image uploaders.
  - Step 4: Text inputs for `aboutHeadline` and `bio`.
  - Step 5: `TemplateChoices` showing `Frame` as default, with a "Finish & Open Editor" button that calls `finalizeOnboardingAndSaveDraft("talib")` and navigates to `/edit/talib`.

### Step 3: Ensure Clean Editor & Public Hydration
- Ensure `hydrateDraft("talib")` in `lib/portfolio-store.ts` seamlessly reads the generated draft.
- Ensure `FrameFolio` in `components/taste-folio.tsx` maps `pieces`, `featured`, `heroBlock`, `aboutBlock`, and `contactBlock` directly from the generated draft's blocks and media arrays.

---

## 8. Verification Strategy

1. **Onboarding End-to-End Test**:
   - Navigate to `/onboarding/1`.
   - Enter custom studio name (`"NOVA STUDIO"`), custom headline (`"Generative Worlds. / Pure Vision."`), and contact email (`"contact@novastudio.ai"`).
   - Select categories `["Films", "Motion", "Editorial"]`.
   - Add/edit 4 project cards with distinct titles and images.
   - Set custom about headline (`"Crafting the unseen."`).
   - Select `Frame` template and click "Generate".
2. **Editor Verification**:
   - Verify `/edit/talib` opens with:
     - Nav logo showing `"NOVA STUDIO"`.
     - Hero headline showing `"Generative Worlds."` and accent `"Pure Vision."`.
     - Filter tabs showing `All`, `Films`, `Motion`, `Editorial`.
     - Work grid rendering all 4 custom project cards.
     - About section showing `"Crafting the unseen."`.
     - Contact section displaying `"contact@novastudio.ai"` mailto link.
3. **Build & Type Check**:
   - Run `npm run build` to confirm zero TypeScript, lint, or Next.js build errors.
