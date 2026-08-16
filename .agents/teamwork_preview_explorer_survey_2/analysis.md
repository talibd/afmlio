# Requirement 2: Reference-Based Template Integration — Analysis Report

**Investigator**: Explorer 2 (Survey Phase)  
**Target Milestone**: Survey  
**Reference File**: `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`  
**Working Directory**: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_explorer_survey_2`  
**Project Root**: `c:\Users\talib\OneDrive\Documents\my apps\afmlio`

---

## 1. Executive Summary

Requirement 2 mandates implementing a new portfolio taste template ("Frame") based on the reference HTML file at `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`, applying custom branding and ensuring dynamic rendering from portfolio draft data across both the editor live preview canvas and public routes (`/p/[slug]`).

Our survey reveals that:
1. **Reference HTML Architecture**: The reference document is an editorial, high-contrast, minimalist portfolio layout featuring:
   - Georgia serif typography paired with Arial sans-serif micro-copy.
   - Electric chartreuse accent highlight (`#dfff45`) on key headline spans.
   - Distinctive 6-part section sequence: (1) Minimal Nav, (2) Hero with 2:1 Featured project banner, (3) Selected Work grid with category filters and lightbox modal, (4) 2-column "Less noise. More work." About section, (5) CTA/Contact section with accent highlight, and (6) 2-item Footer.
2. **Existing Codebase Architecture**:
   - Template registry is centralized in `lib/tastes.ts` with `"frame"` as the primary `TemplateId`.
   - The block system in `lib/blocks.ts` and `lib/demo.ts` supports all content blocks required by the template (`hero`, `still`, `about`, `featured`, `contact`/`cta`, `skills`, `why`, `reviews`, `faq`, `footer`).
   - `components/taste-folio.tsx` contains the specialized `FrameFolio` renderer and dispatches `TasteFolio` when `template === "frame"`.
   - `app/tastes.css` contains the complete scoped styling rules for `.taste[data-taste="frame"]` and `.taste-frame-*` classes matching the reference file layout and responsive breakpoints (`@media (max-width: 700px)`).
3. **Dynamic Data Binding**: The template seamlessly binds to the `Portfolio` / `StoredPortfolio` data model:
   - Dynamic work items are extracted from `portfolio.media.stills`, block images, or fallback to the reference's `STUDENT_WORK` pieces.
   - Filter categories are computed dynamically from piece metadata.
   - Interactive Lightbox modal provides full image inspection.
   - Custom blocks added in the editor (`skills`, `why`, `reviews`, `faq`) render in harmony with the Frame editorial serif aesthetic.
4. **Editor & Public View Compatibility**: `FolioCanvas` (editor live preview) and `FolioView` (public `/p/[slug]` route) both invoke `TasteFolio`, guaranteeing 100% visual parity between editor and live output.

---

## 2. Reference HTML Specification Analysis

### 2.1 Color Palette & Design Tokens
| Variable | Value | Role in Reference |
|---|---|---|
| `--bg` | `#ffffff` | Page and card surface background |
| `--text` | `#111111` | Primary typography and solid buttons |
| `--muted` | `#777777` / `#666666` | Secondary body text and subtitles |
| `--line` | `#e8e8e8` | Section dividers and nav border |
| `--accent` | `#dfff45` | Chartreuse/neon lime highlight on CTA headline `<span>` |

### 2.2 Typography Hierarchy
| Element | Font Family | Size / Leading | Weight / Style | Letter Spacing |
|---|---|---|---|---|
| Nav Logo | `Georgia, serif` | `20px` | `400` Regular | `-0.02em` |
| Nav Links | `Arial, sans-serif` | `12px` | `400` Regular | Normal |
| Nav Contact Btn | `Arial, sans-serif` | `11px` | `500` Medium | `0.05em` (caps) |
| Hero Headline | `Georgia, serif` | `clamp(55px, 8vw, 100px)`, `line-height: 0.9` | `400` Regular (2nd line grey `#888`) | `-0.07em` |
| Hero Body | `Arial, sans-serif` | `14px`, `line-height: 1.7` | `400` Regular (`#666`) | Normal |
| Hero Link CTA | `Arial, sans-serif` | `11px`, `padding: 12px 16px` | `500` Medium (`#fff` on `#111`) | `0.05em` (caps) |
| Featured Title | `Georgia, serif` | `32px` | `400` Regular | Normal |
| Featured Meta | `Arial, sans-serif` | `10px` | `400` Regular (`#ddd`) | `0.05em` (caps) |
| Section Title | `Georgia, serif` | `48px` | `400` Regular | `-0.05em` |
| Filter Buttons | `Arial, sans-serif` | `10px`, `padding: 8px 12px` | `400` / `500` (Active: `#111` bg) | `0.05em` (caps) |
| Card Title | `Georgia, serif` | `20px` | `400` Regular | Normal |
| Card Type Tag | `Arial, sans-serif` | `9px` | `400` Regular (`#888`) | `0.05em` (caps) |
| About Headline | `Georgia, serif` | `52px`, `line-height: 0.95` | `400` Regular | `-0.04em` |
| About Body | `Arial, sans-serif` | `14px`, `line-height: 1.8` | `400` Regular (`#666`) | Normal |
| CTA Headline | `Georgia, serif` | `clamp(50px, 7vw, 80px)`, `line-height: 0.9` | `400` Regular | `-0.06em` |
| CTA Highlight | `Georgia, serif` | Same as CTA Headline | Highlight bg `#dfff45`, text `#111` | `-0.06em` |
| Footer | `Arial, sans-serif` | `10px` | `400` Regular (`#888`) | `0.05em` (caps) |
| Modal Title | `Georgia, serif` | `28px` | `400` Regular | Normal |
| Modal Body | `Arial, sans-serif` | `12px` | `400` Regular (`#777`) | `0.02em` |

### 2.3 Component & Section Structure
1. **Container**: `width: min(1100px, calc(100% - 40px)); margin: auto;`
2. **Navigation (`<nav>`)**: Fixed 64px height flexbox row with bottom border `#e8e8e8`. Logo on left, nav anchor links (`#work`, `#about`, `#skills`, `#faq`) in center/right, and `#contact` button on right.
3. **Hero Section (`.hero`)**:
   - Two-line headline with grayed second line: `"AI made visual."` + `"Human made creative."`.
   - Blurb text and black rectangular CTA button (`VIEW WORK →`).
   - 2:1 aspect ratio featured banner with image hover scale (`1.02`), dark bottom gradient overlay, left-aligned title & category/duration, and right-aligned counter `01 / 06`.
4. **Selected Work Grid (`.work`)**:
   - "Selected work" section heading.
   - Filter buttons row (`All`, `Films`, `Ads`, `Graphics`).
   - 2-column grid of cards with 1.3:1 aspect ratio images, smooth hover zoom (`scale(1.03)`), and bottom info row.
   - Card click opens Lightbox Modal.
5. **About Section (`.about`)**:
   - Bounded by top and bottom 1px `#e8e8e8` borders.
   - 2-column grid (`1fr 1fr`, 70px gap).
   - Left: `"Less noise.<br>More work."`
   - Right: Studio philosophy description.
6. **CTA / Contact Section (`.cta`)**:
   - Center-aligned layout.
   - Headline `"Have an idea?<br><span>Let's make it.</span>"` with electric chartreuse background on span.
   - Skill summary list and high-contrast email button link (`HELLO@FRAMESTUDIO.AI ↗`).
7. **Footer (`<footer>`)**:
   - Border-top `#e8e8e8`, 20px padding.
   - Copyright on left, format tags on right.
8. **Lightbox Modal (`.modal`)**:
   - Fixed full-screen overlay with blur and dark backdrop (`rgba(0,0,0,0.75)`).
   - White modal box (`width: min(900px, 100%)`) with image (`max-height: 560px`) and info caption.
   - Close button (`×`), close on ESC, backdrop click.
9. **Responsive Breakpoint (`@media (max-width: 700px)`)**:
   - Container width: `calc(100% - 28px)`.
   - Nav links hidden.
   - Hero padding reduced to 70px/45px, headline font size scaled to 55px.
   - Featured banner aspect ratio becomes 1:1.
   - Work grid and about grid collapse to single column (1fr).
   - Footer collapses to column with 8px gap.

---

## 3. Existing Codebase Template Architecture

### 3.1 Template Registration
- **`lib/tastes.ts`**:
  - `TASTE_IDS = ["frame", "walk", "ground", "aperture", "folio", "flood"] as const`
  - `coerceTemplate(id)`: Defaults to `"frame"`.
  - `TEMPLATES`: Lists Frame as `"Editorial AI archive. Clean grid, category filters, and electric accents."`
  - `STUDENT_WORK`: Contains 6 sample pieces matching the reference HTML items.
  - `PROJECT_SRC.frame`: Provides the default high-resolution hero still.

### 3.2 Block System & Layout
- **`lib/blocks.ts`**:
  - `BLOCK_CATALOG`: Catalogs all block types (`hero`, `about`, `contact`, `still`, `featured`, `skills`, `why`, `reviews`, `faq`, `cta`, `footer`, `partners`, `features`).
  - `createBlock()`: Generates seeded blocks with default copy, layout margins, and typography style tokens.
  - `blocksOf()`: Extracts current blocks or generates defaults.
  - `reapplyTemplateChrome()`: Allows switching templates while preserving custom user text.

### 3.3 Block Rendering Pipeline
- **`components/taste-folio.tsx`**:
  - Acts as the central template dispatcher.
  - For `template === "frame"`, renders `<FrameFolio portfolio={portfolio} ... />`.
  - `FrameFolio`:
    - Handles dynamic work extraction via `extractFramePieces(portfolio)`.
    - Handles active category filter state (`filter`).
    - Handles modal lightbox state (`modalPiece`) and ESC keybinding.
    - Binds block and element hit helpers for editor integration (when interactive selection is enabled).
    - Renders dynamic custom blocks (`skills`, `why`, `reviews`, `faq`, `still`) using scoped editorial styling.
- **`components/folio-view.tsx`**:
  - `FolioCanvas`: Renders `TasteFolio` inside the editor preview container (`PREVIEW_WIDTH[size]`).
  - `FolioView`: Renders `TasteFolio` inside the public view route (`/p/[slug]`).

### 3.4 Styling Engine
- **`app/tastes.css`**:
  - Declares `--taste-ink: #111111`, `--taste-paper: #ffffff`, `--taste-accent: #dfff45`, `--taste-line: #e8e8e8`, `--taste-mute: #777777`.
  - Declares all `.taste-frame-*` classes matching the reference HTML structure and responsive rules.

---

## 4. Dynamic Data Structures & Content Mapping

| Frame Template Section | Portfolio / Block Data Source | Fallback / Default Value |
|---|---|---|
| **Nav Logo** | `portfolio.school` → `portfolio.name` | `"FRAME"` |
| **Nav Links** | Static links (`#work`, `#about`) + conditional links (`#skills`, `#faq` if custom blocks exist) | Standard nav anchors |
| **Nav Contact** | `contactBlock.cta` or `#contact` anchor | `"Contact"` |
| **Hero Title** | `heroBlock.heading` (supports `\n` or ` / ` split) | `"AI made visual.\nHuman made creative."` |
| **Hero Tagline** | `heroBlock.body` → `portfolio.bio` | `"A simple portfolio of AI-generated films, advertisements, graphics and visual experiments."` |
| **Hero CTA Link** | `heroBlock.cta` → `heroBlock.ctaHref` | `"VIEW WORK →"` (`#work`) |
| **Featured Project Banner** | `pieces[0]` (from `portfolio.media.stills` or `heroBlock.image`) | `STUDENT_WORK[0]` ("After Tomorrow") |
| **Featured Banner Title** | `featured.title` (`portfolio.project.name` or item title) | `"After Tomorrow"` |
| **Featured Banner Meta** | `featured.slug` | `"AI FILM · 04:18"` |
| **Featured Counter** | `01 / ${pieces.length}` | `"01 / 06"` |
| **Work Filter Categories** | Dynamic set of `category` from all pieces (`film`, `ad`, `graphic`, etc.) | `["film", "ad", "graphic"]` |
| **Work Cards Grid** | Array of pieces from `portfolio.media.stills` / blocks / `STUDENT_WORK` | 6 reference cards |
| **Card Image** | `piece.src` | High-res Unsplash reference images |
| **Card Title** | `piece.title` | Project name / title |
| **Card Type Tag** | `piece.category` | `"Film"`, `"Ad"`, `"Graphics"` |
| **About Headline** | `aboutBlock.heading` | `"Less noise.\nMore work."` |
| **About Copy** | `aboutBlock.body` → `portfolio.bio` | Reference about description |
| **CTA Headline** | `contactBlock.heading` (with highlighted span) | `"Have an idea?\nLet's make it."` |
| **CTA Skills Summary** | `contactBlock.body` → `portfolio.skills.join(" · ")` | `"Films · Ads · Graphics · Visual experiments"` |
| **CTA Action Button** | `contactBlock.cta` → `mailto:${portfolio.settings.email}` | `"${email.toUpperCase()} ↗"` |
| **Footer Copyright** | `portfolio.name` | `"© 2026 FRAME"` |
| **Footer Tagline** | `portfolio.skills.join(" · ").toUpperCase()` | `"AI FILMS · ADS · GRAPHICS"` |

---

## 5. File Inventory & Modification Map

| File Path | Status | Role & Required Action |
|---|---|---|
| `lib/tastes.ts` | Existing / Verified | Primary template registry. Contains `"frame"`, `TEMPLATES`, `STUDENT_WORK`, and `PROJECT_SRC.frame`. |
| `lib/demo.ts` | Existing / Verified | Core data types (`Portfolio`, `FolioBlock`, `BlockType`, `ElementKind`). Re-exports template definitions. |
| `lib/blocks.ts` | Existing / Verified | Block factory, layout rules, and block reset/creation functions for all block types. |
| `components/taste-folio.tsx` | Existing / Verified | Houses `FrameFolio` component and `TasteFolio` template switcher. Supports dynamic work extraction, category filtering, lightbox modal, and custom blocks. |
| `app/tastes.css` | Existing / Verified | Houses scoped CSS classes and custom property tokens for `.taste-frame` and responsive media queries. |
| `components/folio-view.tsx` | Existing / Verified | Exposes `FolioCanvas` (live preview) and `FolioView` (public view). |
| `components/portfolio-editor.tsx` | Existing / Verified | Integrates `FolioCanvas` in editor. (Note: R1 disables canvas dial inspector, making canvas a pure live preview). |
| `components/portfolio-public-view.tsx` | Existing / Verified | Client component rendering public and preview routes using `FolioView`. |
| `app/p/[slug]/page.tsx` | Existing / Verified | Next.js Server Component route for `/p/[slug]` supporting published view, draft preview (`?preview=1`), and edit redirect (`?edit=1`). |
| `components/template-gallery.tsx` | Existing / Verified | Renders template gallery preview cards with thumbnail scaling. |
| `components/template-picker.tsx` | Existing / Verified | Settings dialog template picker. |
| `app/onboarding/[step]/page.tsx` | Existing / Scope of R3 | Onboarding steps to collect data tailored for the Frame template. |

---

## 6. Verification and Build Status

- **Build Check**: Executed `npm run build` using Next.js 16.2.6 (Turbopack).
- **Compilation Result**:
  - TypeScript type check: Passed with 0 errors.
  - Page generation: All static and dynamic routes (`/`, `/dashboard`, `/dashboard/templates`, `/edit/[slug]`, `/onboarding/[step]`, `/onboarding/media`, `/p/[slug]`, `/signup`) compiled successfully.
  - Exit code: `0`.
