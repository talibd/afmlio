# Milestone M3 Remediation Analysis & Fix Strategy Report

## Executive Summary
This report provides the root-cause analysis and exact remediation strategy for Milestone M3 (Tailored Onboarding Form & Draft Generation) following the forensic integrity audit. Two specific issues were identified during forensic audit:
1. **Build Failure**: `npm run build` exits with code 1 due to TypeScript attempting to resolve `".next/dev/types/**/*.ts"` (specifically `.next/dev/types/cache-life.d.ts` which is absent in production builds).
2. **Contract Architecture**: Establishing `lib/onboarding.ts` as the canonical contract file for data models, persistence helpers, and draft generation, with seamless integration across all consumer components (`components/tailored-onboarding.tsx`, `components/frame-onboarding.tsx`, `app/onboarding/[step]/page.tsx`, etc.).

---

## 1. Root Cause Analysis

### Issue 1: Production TypeScript Build Failure (`tsconfig.json`)
- **Observed Error**:
  ```
  Failed to type check.
  Type error: File '.../.next/dev/types/cache-life.d.ts' not found.
  ```
- **Mechanism**:
  - `tsconfig.json` includes `".next/dev/types/**/*.ts"` in its `include` array (line 32).
  - Next.js only generates `.next/dev/` during local development (`next dev`).
  - When `npm run build` runs `next build`, Next.js compiles production assets and executes TypeScript type-checking (`tsc`).
  - Because `".next/dev/types/**/*.ts"` is in `tsconfig.json` `include`, TypeScript scans for files matching that pattern or cached dev type manifests. When `.next/dev/` is absent or cleaned during production build, `tsc` encounters a missing file error for `cache-life.d.ts`.

### Issue 2: Contract Separation for Onboarding Logic (`lib/onboarding.ts`)
- **Background**:
  - `PROJECT.md` defines `lib/onboarding.ts` as the dedicated module responsible for onboarding data types, state persistence, and draft generation.
  - Early prototype implementations had placed state types and conversion routines inline inside UI components.
  - To achieve full contract compliance and testability, `lib/onboarding.ts` must export `OnboardingState`, `OnboardingProject`, `DEFAULT_ONBOARDING_STATE`, `ONBOARDING_STORAGE_KEY`, `loadOnboardingState`, `saveOnboardingState`, `clearOnboardingState`, and `generateDraftFromOnboarding`.

---

## 2. Exact Remediation Specifications

### A. `tsconfig.json` Modification
Remove line 32 (`".next/dev/types/**/*.ts"`) from the `include` array.

#### Target File: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "next.config.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.mts",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

---

### B. `lib/onboarding.ts` Implementation
`lib/onboarding.ts` contains the pure domain logic, type definitions, persistence helpers, and the draft generation pipeline that converts onboarding input into a complete `StoredPortfolio` and seeded `FolioBlock[]`.

#### Target File: `lib/onboarding.ts`
```typescript
import { createBlock } from "@/lib/blocks"
import { type FolioBlock } from "@/lib/demo"
import {
  defaultChrome,
  defaultSeo,
  defaultSettings,
  getBaseDraft,
  saveDraft,
  type StoredPortfolio,
} from "@/lib/portfolio-store"

export interface OnboardingProject {
  id: string
  title: string
  category: string
  runtime: string
  imageUrl: string
  client?: string
  description?: string
}

export interface OnboardingState {
  studioName: string
  heroLine1: string
  heroLine2: string
  contactEmail: string
  disciplines: string[]
  projects: OnboardingProject[]
  statementHeadline: string
  statementBio: string
  services: string[]
  templateId: "frame"
}

export const ONBOARDING_STORAGE_KEY = "afm:onboarding:data"

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  studioName: "TALIB / FRAME",
  heroLine1: "Direction & Visual Systems",
  heroLine2: "Selected Works 2024–2026",
  contactEmail: "contact@talib.design",
  disciplines: ["Films", "Commercials", "Motion", "3D & CGI", "Editorial"],
  projects: [
    {
      id: "project-1",
      title: "Chronos: Temporal Architecture",
      category: "Films",
      runtime: "03:42",
      client: "Aura Systems",
      imageUrl:
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
      description:
        "Speculative film exploring non-linear narrative and volumetric light architecture.",
    },
    {
      id: "project-2",
      title: "Aperture & Motion",
      category: "Commercials",
      runtime: "01:15",
      client: "Kroma Studios",
      imageUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
      description:
        "High-octane product launch campaign blending practical camera rigs with generative CGI.",
    },
    {
      id: "project-3",
      title: "Kinetics / Synthetic Sound",
      category: "Motion",
      runtime: "02:05",
      client: "Hyperform",
      imageUrl:
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
      description:
        "Audio-reactive typography and geometric motion studies for live broadcast systems.",
    },
    {
      id: "project-4",
      title: "Monolith Editorial",
      category: "3D & CGI",
      runtime: "Stills",
      client: "Vogue Labs",
      imageUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
      description:
        "Series of high-resolution digital sculptures examining tactile materiality and brutalist form.",
    },
  ],
  statementHeadline: "Less noise. More work.",
  statementBio:
    "A focused visual archive for contemporary direction, CGI, and brand experiments. Built for speed, clarity, and uncompromising aesthetic intent.",
  services: [
    "Creative Direction",
    "3D Motion",
    "Brand Systems",
    "Film Production",
  ],
  templateId: "frame",
}

export function loadOnboardingState(): OnboardingState {
  if (typeof window === "undefined") {
    return DEFAULT_ONBOARDING_STATE
  }
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (!raw) return DEFAULT_ONBOARDING_STATE
    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    return {
      ...DEFAULT_ONBOARDING_STATE,
      ...parsed,
      disciplines:
        parsed.disciplines && parsed.disciplines.length > 0
          ? parsed.disciplines
          : DEFAULT_ONBOARDING_STATE.disciplines,
      projects:
        parsed.projects && parsed.projects.length > 0
          ? parsed.projects
          : DEFAULT_ONBOARDING_STATE.projects,
      services:
        parsed.services && parsed.services.length > 0
          ? parsed.services
          : DEFAULT_ONBOARDING_STATE.services,
      templateId: "frame",
    }
  } catch {
    return DEFAULT_ONBOARDING_STATE
  }
}

export function saveOnboardingState(state: OnboardingState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota/storage exceptions
  }
}

export function clearOnboardingState(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function generateDraftFromOnboarding(
  data: OnboardingState,
  slug: string
): StoredPortfolio {
  const studioName = data.studioName?.trim() || "TALIB / FRAME"
  const heroLine1 = data.heroLine1?.trim() || "Direction & Visual Systems"
  const heroLine2 = data.heroLine2?.trim() || "Selected Works 2024–2026"
  const email = data.contactEmail?.trim() || "contact@talib.design"
  const statementHeadline =
    data.statementHeadline?.trim() || "Less noise. More work."
  const statementBio =
    data.statementBio?.trim() ||
    "A focused visual archive for contemporary direction, CGI, and brand experiments. Built for speed, clarity, and uncompromising aesthetic intent."
  const disciplines =
    data.disciplines && data.disciplines.length > 0
      ? data.disciplines
      : DEFAULT_ONBOARDING_STATE.disciplines
  const services =
    data.services && data.services.length > 0
      ? data.services
      : DEFAULT_ONBOARDING_STATE.services
  const projects =
    data.projects && data.projects.length > 0
      ? data.projects
      : DEFAULT_ONBOARDING_STATE.projects

  const base = getBaseDraft(slug, "frame")
  const firstProject = projects[0]
  const stillUrls = projects.map((p) => p.imageUrl).filter(Boolean)

  const heroBlock: FolioBlock = {
    ...createBlock("hero", base, "frame"),
    id: "hero-introduction",
    heading: `${heroLine1}\n${heroLine2}`,
    body: statementBio,
    image: firstProject?.imageUrl || "",
    cta: "VIEW WORK →",
    ctaHref: "#work",
    hidden: false,
  }

  const projectBlocks: FolioBlock[] = projects.map((project, index) => {
    const metaParts = [
      project.category,
      project.runtime,
      project.client,
    ].filter(Boolean)
    return {
      ...createBlock("featured", base, "frame"),
      id: `featured-${project.id || index + 1}`,
      heading:
        project.title.trim() || `Work ${String(index + 1).padStart(2, "0")}`,
      eyebrow: project.category || "Films",
      body:
        project.description?.trim() ||
        metaParts.join(" · ") ||
        "Selected studio work",
      image:
        project.imageUrl ||
        DEFAULT_ONBOARDING_STATE.projects[
          index % DEFAULT_ONBOARDING_STATE.projects.length
        ]?.imageUrl ||
        "",
      imageAlt: project.title.trim() || `Work ${index + 1}`,
      hidden: false,
    }
  })

  const skillsBlock: FolioBlock = {
    ...createBlock("skills", base, "frame"),
    id: "skills-capabilities",
    heading: "Capabilities & Services",
    body: "Core offerings spanning direction, visual development, and digital production.",
    items: services.length > 0 ? services : disciplines,
    hidden: false,
  }

  const aboutBlock: FolioBlock = {
    ...createBlock("about", base, "frame"),
    id: "about-manifesto",
    heading: statementHeadline,
    body: statementBio,
    image: "",
    hidden: false,
  }

  const contactBlock: FolioBlock = {
    ...createBlock("contact", base, "frame"),
    id: "contact-studio",
    heading: "Have an idea?\nLet's make it.",
    body:
      disciplines.join(" · ") ||
      services.join(" · ") ||
      "Films · Ads · Motion · 3D",
    cta: `${email.toUpperCase()} ↗`,
    ctaHref: `mailto:${email}`,
    image: "",
    hidden: false,
  }

  const allBlocks: FolioBlock[] = [
    heroBlock,
    ...projectBlocks,
    skillsBlock,
    aboutBlock,
    contactBlock,
  ]

  const storedPortfolio: StoredPortfolio = {
    ...base,
    slug,
    name: studioName,
    school: studioName,
    title: `${heroLine1} / ${heroLine2}`,
    bio: statementBio,
    status: "draft",
    template: "frame",
    project: {
      name: firstProject?.title || "Selected Work",
      copy:
        firstProject?.description ||
        firstProject?.runtime ||
        "Contemporary studio showcase",
    },
    skills: services.length > 0 ? services : disciplines,
    blocks: allBlocks,
    media: {
      headshot: firstProject?.imageUrl || "",
      stills: stillUrls,
      clips: [],
    },
    settings: {
      ...base.settings,
      email,
      showEmail: true,
      notifyViews: false,
    },
    seo: defaultSeo({
      ...base,
      name: studioName,
      bio: statementBio,
    }),
    chrome: defaultChrome(),
    updatedAt: Date.now(),
  }

  if (typeof window !== "undefined") {
    try {
      saveDraft(slug, storedPortfolio)
      localStorage.setItem(
        `afm:draft:${slug}`,
        JSON.stringify(storedPortfolio)
      )
      localStorage.setItem("afm:draft:current", slug)
    } catch {
      // ignore
    }
  }

  return storedPortfolio
}
```

---

### C. Downstream Consumers & Compatibility Bridge

1. **`components/frame-onboarding.tsx`**:
   Acts as a clean re-export module pointing to `@/components/tailored-onboarding` and `@/lib/onboarding`:
   ```typescript
   "use client"

   export { TailoredOnboarding as FrameOnboarding } from "@/components/tailored-onboarding"
   export {
     DEFAULT_ONBOARDING_STATE,
     ONBOARDING_STORAGE_KEY,
     clearOnboardingState,
     generateDraftFromOnboarding,
     loadOnboardingState,
     saveOnboardingState,
     type OnboardingProject,
     type OnboardingState,
   } from "@/lib/onboarding"
   ```

2. **`components/tailored-onboarding.tsx`**:
   Imports all data types and state persistence functions directly from `@/lib/onboarding`.

3. **`app/onboarding/[step]/page.tsx`**:
   Validates step param (`1` through `5`), redirects invalid values to `/onboarding/1`, and renders `<TailoredOnboarding initialStep={stepNumber} />`.

4. **`app/onboarding/page.tsx`**:
   Direct server-side redirect to `/onboarding/1`.

---

## 3. Verification Matrix
| Test Case | Description | Target | Expected Result |
|---|---|---|---|
| TC-1 | TypeScript Production Build | `tsconfig.json` without `.next/dev/types/**/*.ts` | `npm run build` succeeds with 0 type errors |
| TC-2 | Typecheck Cleanliness | `npm run typecheck` (`tsc --noEmit`) | Exits with code 0 |
| TC-3 | Contract Verification | `lib/onboarding.ts` exports and structure | Matches `PROJECT.md` contracts |
| TC-4 | State Persistence | `saveOnboardingState` & `loadOnboardingState` | Correctly stores and rehydrates from `localStorage` |
| TC-5 | Draft Generation Integrity | `generateDraftFromOnboarding` | Produces valid `StoredPortfolio` with all 5 block types |
