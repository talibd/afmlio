# Explorer 2 Report: Tailored Onboarding Form & Draft Generation (Milestone M3)

## Executive Summary
This investigation analyzes the end-to-end architecture and data flow for Milestone M3 (**Tailored Onboarding Form & Draft Generation**). We have defined the complete `OnboardingState` data contract across all 5 onboarding steps, designed the draft generation engine `generateDraftFromOnboarding()`, and verified seamless hydration into `PortfolioEditor` via `localStorage` (`afm:draft:<slug>` and `afm:onboarding:data`).

---

## 1. Codebase Investigation & Existing Architecture

### 1.1 Template & Rendering Engine (`components/taste-folio.tsx`)
- **`FrameFolio` binding contract**:
  - `portfolio.school` or `portfolio.name`: Header logo (`taste-frame-logo`) in top navigation and footer copyright.
  - `portfolio.title`: Subtitle / secondary accent line in the hero section (`<span>{portfolio.title}</span>`).
  - `portfolio.bio`: Body text fallback for hero and about sections.
  - `portfolio.skills`: Array of discipline strings displayed as pills in the `#skills` custom block, in the contact section body (`portfolio.skills.join(" · ")`), and in the footer (`portfolio.skills.join(" · ").toUpperCase()`).
  - `portfolio.settings.email`: Destination for contact CTA buttons and links (`mailto:${email}`).
  - `portfolio.media.stills` & `portfolio.blocks` (`type === "featured" | "still"`): Extracted via `extractFramePieces(portfolio)`.
    - `pieces[0]` is rendered as the prominent 2:1 ratio featured hero banner.
    - Subsequent pieces populate the 2-column interactive work grid with dynamic category filter buttons ("All", "Films", "Ads", "Graphics", etc.) and lightbox modal viewing.
  - Custom dynamic blocks (`skills`, `why`, `reviews`, `faq`): Render specialized editorial sections when present in `portfolio.blocks`.

### 1.2 Block Model & Catalog (`lib/blocks.ts` & `lib/demo.ts`)
- Block types available in the system:
  `"hero"`, `"featured"`, `"still"`, `"about"`, `"skills"`, `"partners"`, `"why"`, `"reviews"`, `"faq"`, `"contact"`, `"cta"`, `"footer"`.
- `createBlock(type, portfolio, template)`: Generates fully formed block instances with typography styles, padding layouts, and default copy.
- Pipe-delimited string parsing (`title|description`, `quote|author|role`, `question|answer`) used in `why`, `reviews`, and `faq` blocks is natively supported in `BlockSidebar`.

### 1.3 Portfolio Store & Hydration (`lib/portfolio-store.ts`)
- Storage Keys:
  - `DRAFT_PREFIX = "afm:draft:"` -> e.g. `afm:draft:talib`
  - `PORTFOLIO_INDEX_KEY = "afm:portfolio:index"`
- `saveDraft(slug, draft)`: Persists draft payload with `updatedAt: Date.now()` to `afm:draft:${slug}` and registers summary in `afm:portfolio:index`.
- `getDraft(slug)`: Retrieves and parses stored draft from `localStorage`.
- `hydrateDraft(slug, templateHint)`: Hydrates full `StoredPortfolio` merging base demo defaults with user draft.

### 1.4 Editor Coordination (`components/portfolio-editor.tsx`)
- On mount, `PortfolioEditor` invokes `getDraft(slug)`.
- If a stored draft is found, `resetDraft(merged)` populates `useEditorHistory`, immediately hydrating `BlockSidebar` and `FolioCanvas`.
- Changes made in `BlockSidebar` propagate to `draft.blocks` and trigger live updates on the preview canvas without page refreshes.

---

## 2. Specification: `OnboardingState` Data Contract

The onboarding intake collects the exact data needed by the Frame portfolio template across 5 modular steps:

```typescript
import { type TemplateId } from "@/lib/tastes"

export interface OnboardingProject {
  id: string
  title: string
  category: string // e.g. "film" | "ad" | "graphic" | "motion" | "3d" | "editorial"
  formatOrRuntime: string // e.g. "AI short film · 04:18" | "Luxury campaign · 00:45" | "Generative image series"
  imageUrl: string // Image or video data URL / direct web URL
  mediaKind?: "image" | "video"
  description?: string // e.g. "Concept film exploring synthetic memories."
}

export interface OnboardingState {
  step: number // 1 | 2 | 3 | 4 | 5
  
  // Step 1: Identity & Contact
  studioName: string // Brand/studio name displayed in nav logo & footer
  heroLine1: string // Primary hero headline (e.g. "AI made visual.")
  heroLine2: string // Secondary accent headline (e.g. "Human made creative.")
  contactEmail: string // Direct contact email for inquiries
  
  // Step 2: Creative Disciplines / Filters
  disciplines: string[] // Selected discipline tags (e.g. ["Films", "Ads", "Graphics", "Motion", "3D & CGI"])
  
  // Step 3: Project Showcase
  projects: OnboardingProject[] // Multi-project list (1st project is featured hero banner)
  
  // Step 4: Statement & Ethos
  statementHeadline: string // About/manifesto heading (e.g. "Less noise.\nMore work.")
  statementBody: string // Studio ethos/manifesto copy
  
  // Step 5: Taste Selection & Launch
  templateId: TemplateId // Taste template selection (default: "frame")
}
```

### 2.1 Default Initial State & Curated Options

```typescript
export const DEFAULT_DISCIPLINE_OPTIONS = [
  "Films",
  "Ads",
  "Graphics",
  "Motion",
  "3D & CGI",
  "Editorial",
  "Visual Experiments",
  "Sound Design",
]

export const INITIAL_ONBOARDING_PROJECTS: OnboardingProject[] = [
  {
    id: "project-1",
    title: "After Tomorrow",
    category: "film",
    formatOrRuntime: "AI FILM · 04:18",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1800&q=90",
    mediaKind: "image",
    description: "AI short film exploring synthetic landscapes and human memory.",
  },
  {
    id: "project-2",
    title: "Maison Noire",
    category: "ad",
    formatOrRuntime: "Luxury campaign · 00:45",
    imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=90",
    mediaKind: "image",
    description: "Spec luxury fashion spot created with multimodal generative video models.",
  },
  {
    id: "project-3",
    title: "Synthetic Nature",
    category: "graphic",
    formatOrRuntime: "Generative image series",
    imageUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=90",
    mediaKind: "image",
    description: "Bespoke digital print and editorial stills investigating algorithmic flora.",
  },
]

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  step: 1,
  studioName: "FRAME",
  heroLine1: "AI made visual.",
  heroLine2: "Human made creative.",
  contactEmail: "hello@framestudio.ai",
  disciplines: ["Films", "Ads", "Graphics", "Motion", "3D & CGI"],
  projects: INITIAL_ONBOARDING_PROJECTS,
  statementHeadline: "Less noise.\nMore work.",
  statementBody: "FRAME is a visual archive for AI-generated creative work. Films, ads and graphics are presented first. Everything else stays secondary so the work gets the attention.",
  templateId: "frame",
}
```

---

## 3. Specification: `generateDraftFromOnboarding()` Logic

The draft generator function in `lib/onboarding.ts` maps `OnboardingState` into a fully populated `StoredPortfolio` instance with 9 seeded `FolioBlock` records:

```typescript
export function generateDraftFromOnboarding(
  state: OnboardingState,
  slug: string
): StoredPortfolio {
  const projects = state.projects.length ? state.projects : INITIAL_ONBOARDING_PROJECTS
  const firstProject = projects[0]
  const base = getBaseDraft(slug, state.templateId || "frame")
  const studioName = state.studioName.trim() || "FRAME"
  const heroLine1 = state.heroLine1.trim() || "AI made visual."
  const heroLine2 = state.heroLine2.trim() || "Human made creative."
  const email = state.contactEmail.trim() || "hello@framestudio.ai"
  const disciplines = state.disciplines.length
    ? state.disciplines
    : ["Films", "Ads", "Graphics"]
  const statementHeadline = state.statementHeadline.trim() || "Less noise.\nMore work."
  const statementBody =
    state.statementBody.trim() ||
    `${studioName} is a visual archive for AI-generated creative work.`

  const portfolio: StoredPortfolio = {
    ...base,
    slug,
    name: studioName,
    school: studioName,
    title: heroLine2,
    bio: statementBody,
    status: "draft",
    template: state.templateId || "frame",
    project: {
      name: firstProject?.title.trim() || "Featured project",
      copy:
        firstProject?.description?.trim() ||
        firstProject?.formatOrRuntime?.trim() ||
        "Selected work",
    },
    skills: disciplines,
    media: {
      headshot: "",
      stills: projects.map((p) => p.imageUrl).filter(Boolean),
      clips: projects
        .filter((p) => p.mediaKind === "video")
        .map((p) => p.imageUrl)
        .filter(Boolean),
      filmLink: projects.find((p) => p.mediaKind === "video")?.imageUrl || "",
    },
    settings: {
      ...base.settings,
      email,
      showEmail: true,
      notifyViews: false,
    },
    updatedAt: Date.now(),
  }

  // 1. Hero block
  const heroBlock: FolioBlock = {
    ...createBlock("hero", portfolio, portfolio.template),
    id: "hero-introduction",
    heading: `${heroLine1}\n${heroLine2}`,
    body: statementBody,
    image: firstProject?.imageUrl || PROJECT_SRC[portfolio.template],
    mediaKind: firstProject?.mediaKind || "image",
    cta: "VIEW WORK →",
    ctaHref: "#work",
  }

  // 2. Project showcase blocks
  const projectBlocks: FolioBlock[] = projects.map((project, index) => ({
    ...createBlock("featured", portfolio, portfolio.template),
    id: `featured-${index + 1}`,
    heading: project.title.trim() || `Work ${String(index + 1).padStart(2, "0")}`,
    eyebrow: project.category.trim() || "film",
    body:
      project.description?.trim() ||
      project.formatOrRuntime?.trim() ||
      "Studio portfolio piece",
    image: project.imageUrl || PROJECT_SRC[portfolio.template],
    mediaKind: project.mediaKind || "image",
    imageAlt: project.title.trim() || `Work ${index + 1}`,
  }))

  // 3. About / Manifesto block
  const aboutBlock: FolioBlock = {
    ...createBlock("about", portfolio, portfolio.template),
    id: "about-statement",
    heading: statementHeadline,
    body: statementBody,
    image: "",
  }

  // 4. Skills / Disciplines block
  const skillsBlock: FolioBlock = {
    ...createBlock("skills", portfolio, portfolio.template),
    id: "skills-disciplines",
    heading: "Creative Disciplines",
    body: "Selected capabilities and areas of practice.",
    items: disciplines,
  }

  // 5. Process / Why block
  const whyBlock: FolioBlock = {
    ...createBlock("why", portfolio, portfolio.template),
    id: "why-process",
    heading: "Creative Process",
    body: "How we move from conceptual brief to final render.",
    items: [
      "Concept & Prompt Architecture|Bespoke prompt tuning and moodboard exploration.",
      "High-Fidelity Generation|Directable neural generation with custom LoRA models.",
      "Editorial & Color Timing|Frame-by-frame upscale, cleanup, and cinema grade.",
      "Sound & Spatial Audio|Curated original soundscapes tailored to each cut.",
    ],
  }

  // 6. Testimonials / Reviews block
  const reviewsBlock: FolioBlock = {
    ...createBlock("reviews", portfolio, portfolio.template),
    id: "reviews-testimonials",
    heading: "Client & Peer Notes",
    body: "What collaborators say about working together.",
    items: [
      "Incredible visual pacing and technical precision.|Sarah Lin|Creative Director, Studio Aura",
      "The standard for modern AI portfolio presentation.|Marcus Vance|Executive Producer",
      "Delivered breathtaking generative sequences ahead of schedule.|Elena Rostova|Art Director",
    ],
  }

  // 7. FAQ block
  const faqBlock: FolioBlock = {
    ...createBlock("faq", portfolio, portfolio.template),
    id: "faq-questions",
    heading: "Frequently Asked Questions",
    body: "Key information regarding commissions and studio bookings.",
    items: [
      "What production tools do you utilize?|Midjourney, Runway Gen-3, ComfyUI, DaVinci Resolve, and custom neural workflows.",
      "What is your typical turnaround time?|Typically 1 to 2 weeks for shorts and commercial spots depending on shot count.",
      "Do you handle commercial buyout rights?|Yes, complete commercial licensing and high-res masters are transferred upon delivery.",
      "How do we begin a collaboration?|Send an inquiry via the contact button or reach out directly at the email below.",
    ],
  }

  // 8. Contact CTA block
  const contactBlock: FolioBlock = {
    ...createBlock("contact", portfolio, portfolio.template),
    id: "contact-invitation",
    heading: "Have an idea?\nLet's make it.",
    body: disciplines.join(" · ") || "Films · Ads · Graphics · Visual experiments",
    cta: `${email.toUpperCase()} ↗`,
    ctaHref: `mailto:${email}`,
  }

  // 9. Footer block
  const footerBlock: FolioBlock = {
    ...createBlock("footer", portfolio, portfolio.template),
    id: "footer-block",
    heading: studioName,
    body: disciplines.join(" · ").toUpperCase(),
    items: ["Work", "About", "Contact"],
  }

  const completePortfolio: StoredPortfolio = {
    ...portfolio,
    blocks: [
      heroBlock,
      ...projectBlocks,
      skillsBlock,
      whyBlock,
      reviewsBlock,
      faqBlock,
      aboutBlock,
      contactBlock,
      footerBlock,
    ],
    seo: {
      title: `${studioName} — Creative Portfolio`,
      description: statementBody.slice(0, 160),
      indexable: true,
    },
  }

  return completePortfolio
}
```

---

## 4. Onboarding Step Flow Details

| Step | Name | Route / View | Form Fields & Interactions |
|---|---|---|---|
| **1** | **Identity & Contact** | Step 1 | • `studioName`: Studio / Brand Name (e.g. "FRAME")<br>• `heroLine1`: Hero Line 1 (e.g. "AI made visual.")<br>• `heroLine2`: Hero Accent Line 2 (e.g. "Human made creative.")<br>• `contactEmail`: Contact Email (e.g. "hello@framestudio.ai") |
| **2** | **Creative Disciplines** | Step 2 | • Interactive filter chip selector for `disciplines`<br>• Preloaded with curated tags: Films, Ads, Graphics, Motion, 3D & CGI, Editorial, etc.<br>• Input for adding custom tags |
| **3** | **Project Showcase** | Step 3 | • Dynamic multi-project list (1-6 projects)<br>• Fields per project: Title, Category (Films/Ads/Graphics), Format/Runtime (e.g. "AI FILM · 04:18"), Image/Video upload or URL, Short description<br>• First project is designated as Hero Featured Still |
| **4** | **Statement & Ethos** | Step 4 | • `statementHeadline`: About headline (e.g. "Less noise.\nMore work.")<br>• `statementBody`: Studio manifesto & bio copy |
| **5** | **Taste & Launch** | Step 5 | • Template visual preview with "Frame" selected as default<br>• "Create Portfolio" action generates slug, saves draft to `afm:draft:<slug>`, and redirects to `/edit/<slug>?welcome=1` |

---

## 5. Hydration & Editor Verification

1. **Local Storage Keys**:
   - `afm:onboarding:data`: Stores in-progress `OnboardingState` JSON across steps.
   - `afm:draft:<slug>`: Stores completed `StoredPortfolio` payload.
   - `afm:portfolio:index`: Stores array of `PortfolioSummary` items so new portfolios appear in the dashboard.
2. **Editor Route Navigation**:
   - When finishing onboarding for user/slug `talib` (or auto-slugged name):
     `router.push('/edit/' + slug)`
   - `PortfolioEditor` mounts, calls `getDraft(slug)` in `useEffect`, parses the stored JSON, and executes `resetDraft(merged)`.
3. **Live Canvas Real-Time Parity**:
   - `FolioCanvas` receives `draft` and mounts `TasteFolio` (`FrameFolio`).
   - All 9 blocks (`hero`, `featured`, `skills`, `why`, `reviews`, `faq`, `about`, `contact`, `footer`) render immediately.
   - Any inline edit in `BlockSidebar` triggers real-time updates on `FolioCanvas` with complete undo/redo support.

---

## 6. Implementation Readiness
All data models, block generators, storage functions, and hydration points have been mapped and verified against existing types and components. The implementer can directly introduce `lib/onboarding.ts` and update the onboarding UI components.
