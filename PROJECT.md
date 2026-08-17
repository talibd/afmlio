# Project: AFMLIO Portfolio Builder — Form Sidebar, Frame Template & Tailored Onboarding

## Architecture
AFMLIO is a Next.js (App Router) portfolio builder platform with:
- **Editor System**: Form-based sidebar editor (`components/block-sidebar.tsx`), top bar actions (`components/editor-top-bar.tsx`), bottom preview dock (`components/preview-dock.tsx`), and read-only live preview canvas (`components/folio-canvas.tsx`, `components/folio-view.tsx`).
- **Template System**: Modular taste templates (`lib/tastes.ts`, `components/taste-folio.tsx`, `app/tastes.css`) dynamically driven by `Portfolio` data models (`lib/portfolio-store.ts`, `lib/blocks.ts`). The primary taste is `"frame"`, matching the reference HTML at `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`.
- **Onboarding Flow**: 5-step creative studio intake (`app/onboarding/[step]/page.tsx`, `components/onboarding-shell.tsx`, `lib/onboarding.ts`) that persists user answers and generates a fully populated `StoredPortfolio` draft saved to `afm:draft:talib`.
- **Public Portfolio Route**: `/p/[slug]` renders the portfolio draft using `TasteFolio` with complete visual parity with the editor preview.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| F1 | Form-Based BlockSidebar | Render inline input fields (headings, textareas, links, list items, media) directly inside expanded block rows | M1 | ORIGINAL_REQUEST R1 | VERIFIED |
| F2 | Read-Only Live Canvas | Strip DialKit inspector (`ElementInspector`/`BlockLayoutInspector`) and canvas selection click listeners/outline rings, making canvas purely a live preview | M1 | ORIGINAL_REQUEST R1 | VERIFIED |
| F3 | Real-Time State & History Sync | Synchronous propagation of sidebar form edits to `useEditorHistory` / `setDraft`, immediately re-rendering canvas with full undo/redo support | M1 | ORIGINAL_REQUEST R1 | VERIFIED |
| F4 | Toolbar Cleanup | Remove `selectOn` pointer button and canvas selection mode toggles from `components/preview-dock.tsx` | M1 | Survey Explorer 1 | VERIFIED |
| F5 | Frame Template Fidelity | Faithful implementation of `frame-ai-simple-portfolio.html` (Georgia typography, `#dfff45` accent, 2:1 hero featured banner, 2-column work grid with dynamic category filters, modal lightbox, 2-column about, CTA with highlight, footer) | M2 | ORIGINAL_REQUEST R2 | VERIFIED |
| F6 | Dynamic Data & Block Binding | Dynamic extraction and binding of `Portfolio` fields (`hero`, `media.stills`, `about`, `skills`, `why`, `reviews`, `faq`, `contact`, `settings.email`) into `FrameFolio` | M2 | ORIGINAL_REQUEST R2 | VERIFIED |
| F7 | Canvas & Public Route Visual Parity | Shared rendering pipeline via `TasteFolio` ensuring editor live canvas and `/p/[slug]` public routes look 100% identical | M2 | ORIGINAL_REQUEST R2 | VERIFIED |
| F8 | Tailored Onboarding Intake Form | 5-step creative studio intake flow collecting Studio Name, Hero Headline & Accent, Creative Categories, Multi-project showcase, Statement & Manifesto, and Contact Email | M3 | ORIGINAL_REQUEST R3 | VERIFIED |
| F9 | Onboarding State Persistence & Draft Generator | `lib/onboarding.ts` managing client persistence across steps and `generateDraftFromOnboarding()` creating a fully populated `StoredPortfolio` and seeded `FolioBlock[]` records | M3 | ORIGINAL_REQUEST R3 | VERIFIED |
| F10 | Onboarding to Editor Bridge | Direct hydration of generated draft in `PortfolioEditor` upon completing onboarding, populating all template sections instantly | M3 | ORIGINAL_REQUEST R3 | VERIFIED |
| F11 | End-to-End Build & Flow Verification | Complete validation of onboarding -> editor -> form sidebar edits -> real-time canvas update -> public route preview, passing `npm run build` with 0 errors | M4 | ORIGINAL_REQUEST AC | VERIFIED |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Form-Based Sidebar Editor | Disabling DialKit/canvas inspectors, rendering inline form fields in `BlockSidebar`, instant state & canvas sync, toolbar cleanup | none | DONE |
| M2 | Reference Template Integration | Verifying and refining Frame template in `taste-folio.tsx`, `tastes.css`, `lib/tastes.ts` to 100% match reference HTML with dynamic blocks | none | DONE |
| M3 | Tailored Onboarding & Draft Generation | Implementing `lib/onboarding.ts`, 5-step onboarding UI in `app/onboarding/[step]/page.tsx`, and draft generator saved to `localStorage` | M1, M2 | DONE |
| M4 | E2E Integration & Build Verification | Verifying full onboarding -> editor -> live preview -> public route lifecycle, running builds and forensic integrity audit | M1, M2, M3 | DONE |

## Interface Contracts
### `FolioBlock` ↔ `BlockSidebar`
```typescript
interface FolioBlock {
  id: string
  type: BlockType
  layout?: string
  heading?: string
  eyebrow?: string
  body?: string
  cta?: string
  ctaHref?: string
  cta2?: string
  cta2Href?: string
  image?: string
  items?: string[]
  meta?: Record<string, unknown>
}
```

### `BlockSidebar` Props
```typescript
interface BlockSidebarProps {
  draft: Portfolio
  onBlocks: (blocks: FolioBlock[]) => void
  onAddBlock?: (type: BlockType) => void
  onRemoveBlock?: (id: string) => void
  onReorderBlocks?: (blocks: FolioBlock[]) => void
}
```

### `OnboardingState` & Draft Generator
```typescript
interface OnboardingState {
  studioName: string
  heroLine1: string
  heroLine2: string
  contactEmail: string
  disciplines: string[]
  projects: Array<{
    id: string
    title: string
    category: string
    runtime: string
    imageUrl: string
    client?: string
    description?: string
  }>
  statementHeadline: string
  statementBio: string
  services: string[]
  templateId: 'frame'
}

function generateDraftFromOnboarding(data: OnboardingState, slug: string): StoredPortfolio
```

## Code Layout
- `components/portfolio-editor.tsx` — Main editor coordinator (mounts sidebar and canvas preview, manages draft state & history).
- `components/block-sidebar.tsx` — Form-based sidebar displaying inline inputs for each block row.
- `components/folio-canvas.tsx` — Read-only live preview canvas container.
- `components/folio-view.tsx` — Wrapper rendering `TasteFolio` for given viewport and draft.
- `components/taste-folio.tsx` — Taste template implementations (`FrameFolio`, `WalkFolio`, etc.).
- `app/tastes.css` — Scoped CSS variables and styling for taste templates.
- `lib/tastes.ts` — Template registry and metadata.
- `lib/blocks.ts` — Block catalog, block types, and block seeding helpers.
- `lib/portfolio-store.ts` — Portfolio data types, local storage keys, and hydration logic.
- `lib/onboarding.ts` — Onboarding data models, state persistence, and draft generator function.
- `app/onboarding/[step]/page.tsx` — 5-step tailored onboarding UI.
- `app/onboarding/page.tsx` — Onboarding entry point redirect.
- `components/onboarding-shell.tsx` — Onboarding shell with progress indicators and navigation.
- `app/p/[slug]/page.tsx` — Public portfolio route.
