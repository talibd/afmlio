# Technical Architecture & UI Implementation Report: 5-Step Tailored Onboarding Form & Draft Generation

**Milestone**: M3 (Tailored Onboarding Form & Draft Generation)  
**Author**: Explorer 1  
**Project**: AFMLIO Portfolio Builder  
**Date**: 2026-08-16  

---

## 1. Executive Summary

Milestone M3 delivers a tailored, 5-step creative studio intake flow that captures all content required by the new editorial **Frame** taste template (`C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`). The onboarding flow persists user state across steps in `localStorage` under `afm:onboarding:data` and generates a fully populated `StoredPortfolio` draft saved to `afm:draft:talib` (and `afm:draft:${slug}`) upon completion, immediately hydrating all sections and blocks in `PortfolioEditor` (`/edit/talib`).

This report provides the exact component architecture, routing mechanics, form UI layouts, validation rules, live preview synchronization, and code blueprints needed to implement the 5-step onboarding flow.

---

## 2. Codebase Investigation & Current State Analysis

### 2.1 Existing Onboarding Files & Routing
1. `app/onboarding/page.tsx`:
   - Currently mounts `<FrameOnboarding />` directly (an interim 2-step prototype).
2. `app/onboarding/[step]/page.tsx`:
   - Currently redirects directly to `/onboarding` without processing dynamic step params (`params: Promise<{ step: string }>`).
3. `app/onboarding/media/page.tsx`:
   - Legacy redirect to `/onboarding`.
4. `components/frame-onboarding.tsx`:
   - Contains a 2-step form that couples step logic, project array manipulation, and live preview rendering (`ScaledFramePreview`).
   - Missing dedicated step routes (`/onboarding/1` through `/onboarding/5`), discipline filter chip selection, and multi-template review.
5. `components/onboarding-shell.tsx`:
   - Contains outdated `AuthSplit` step definitions (`media`, `1`, `2`, `3`, `4`, `5`) and static image split.
6. `components/taste-folio.tsx` (`FrameFolio`):
   - Successfully extracts and renders portfolio fields:
     - `portfolio.school` / `portfolio.name` -> Nav logo, Footer copyright
     - `portfolio.title` / `heroBlock.heading` -> 2-line Georgia Hero headline (`${heroLine1}\n${heroLine2}`)
     - `portfolio.bio` / `heroBlock.body` -> Hero intro copy and About copy
     - `portfolio.media.stills` / `portfolio.blocks` (`featured`, `still`) -> 2:1 Hero Featured Banner and 2-column Selected Work Grid with category filters
     - `portfolio.skills` -> Category filter buttons (`All`, `Films`, `Ads`, `Graphics`), Footer discipline list, and Contact subtitle
     - `about` block (`heading`, `body`) -> 2-column manifesto section ("Less noise.\nMore work.")
     - `contact` block / `portfolio.settings.email` -> CTA section with electric accent highlight and email action button

---

## 3. 5-Step Creative Studio Intake Architecture

### 3.1 Step Breakdown & Content Mapping

| Step # | Route | Step Name | Primary Form Fields | Frame Template Mapping |
|---|---|---|---|---|
| **Step 1** | `/onboarding/1` | **Studio Identity & Hero** | • Studio / Brand Name (`brand`)<br>• Primary Headline (`heroLine1`)<br>• Secondary Accent Headline (`heroLine2`)<br>• Short Bio / Intro (`intro`)<br>• Contact Email (`contactEmail`) | • Nav Logo & Footer Copyright (`name`, `school`)<br>• Hero `h1` Line 1 (`heroLine1`)<br>• Hero `h1` Line 2 (`title`)<br>• Hero `p` intro copy (`bio`)<br>• Contact CTA button & email (`settings.email`) |
| **Step 2** | `/onboarding/2` | **Creative Disciplines** | • Multi-select discipline chips (`Films`, `Ads`, `Graphics`, `Motion`, `3D & CGI`, `Editorial`, `Direction`, `Generative AI`, etc.)<br>• Custom category adder input | • Dynamic Category Filter Tabs in Work Grid (`All`, `Films`, `Ads`, `Graphics`)<br>• Contact section subtitle (`Films · Ads · Graphics`)<br>• Portfolio skills array (`skills`)<br>• Footer tagline |
| **Step 3** | `/onboarding/3` | **Project Showcase** | • Multi-project collection (Default 6 curated pieces from `STUDENT_WORK`)<br>• For each project:<br>  - Title (`title`)<br>  - Category dropdown/tag (`category`)<br>  - Format / Runtime / Detail (`detail`)<br>  - Media Still URL / Upload (`image`, `mediaKind`)<br>• Add / Remove / Reorder actions | • **Project 1**: Featured 2:1 Hero Banner (`featured.src`, `featured.title`, `featured.slug`)<br>• **Projects 2..N**: 2-Column Work Grid Cards with category tags and runtime meta<br>• Lightbox Modal full-resolution media and metadata |
| **Step 4** | `/onboarding/4` | **Statement & Ethos** | • Statement Headline (2-line textarea, default `"Less noise.\nMore work."`)<br>• Statement Body / Manifesto (Textarea, default studio archive statement) | • 2-Column About Section (`about` block `heading` & `body`)<br>• Large Georgia display typography with automatic newline break |
| **Step 5** | `/onboarding/5` | **Taste Selection & Launch** | • Template Selector (Visual cards for `frame`, `walk`, `ground`, `aperture`, `folio`, `flood`) with `frame` selected by default<br>• Summary review card of entered data<br>• "Launch Portfolio Editor →" action button | • Sets `portfolio.template = templateId`<br>• Generates `StoredPortfolio` via `generateDraftFromOnboarding()`<br>• Persists to `afm:draft:${slug}` and `afm:draft:talib`<br>• Redirects to `/edit/talib?welcome=1` |

---

## 4. UI Layout & Visual Styling

### 4.1 Split-Screen Architecture
The onboarding UI adopts a high-polish 2-column layout matching the Frame studio aesthetic:
- **Left Column (Form & Navigation)**:
  - Width: `w-full lg:max-w-xl xl:max-w-2xl`
  - Sticky Header:
    - AFM logo icon + brand link (`/dashboard`)
    - "Studio Intake" badge (`bg-sidebar-accent text-xs px-2.5 py-1 rounded-md font-medium`)
    - Step Indicator (`Step X of 5`)
    - Linear Progress Bar (`components/ui/progress.tsx`, tracking `value = (step / 5) * 100`)
  - Scrollable Step Form Body:
    - Step Title (`text-3xl font-semibold tracking-[-0.03em]`)
    - Step Subtitle (`text-sm leading-6 text-muted-foreground`)
    - Form Fields (`Field`, `FieldLabel`, `Input`, `Textarea`, `Badge`, `Button`)
    - Real-time validation feedback and error states
  - Sticky Bottom Navigation Dock:
    - "Back" button (`variant="ghost"`, `<ArrowLeft className="size-4" />`), disabled on Step 1.
    - "Next Step / Continue" button (`<Button className="h-11 justify-between px-4 font-normal">`, `<ArrowRight className="size-4" />`) or "Launch Studio Portfolio →" on Step 5.
- **Right Column (Live Reactive Preview)**:
  - Desktop-only (`hidden lg:block bg-[#d7ccb7] dark:bg-[#1a1917] relative`):
    - Scaled canvas viewport hosting `<FolioCanvas portfolio={preview} template="frame" />`.
    - Auto-scales using `ResizeObserver` / `window.requestAnimationFrame` to fit the viewport width (`scale = clientWidth / 1120`).
    - Floats a subtle "Live preview — updates as you type" badge.
    - Real-time reactive updates: As user types any character in the left form, the canvas on the right updates instantly without lag or jumpiness.

---

## 5. State Management & Data Contract (`lib/onboarding.ts`)

### 5.1 Interface Specifications

```typescript
import { coerceTemplate, type FolioBlock, type TemplateId } from "@/lib/demo"
import { STUDENT_WORK } from "@/lib/tastes"
import {
  defaultSeo,
  getBaseDraft,
  saveDraft,
  uniquePortfolioSlug,
  type StoredPortfolio,
} from "@/lib/portfolio-store"
import { createBlock } from "@/lib/blocks"

export const ONBOARDING_STORAGE_KEY = "afm:onboarding:data"

export interface OnboardingProject {
  id: string
  title: string
  category: "film" | "ad" | "graphic" | string
  detail: string
  image: string
  mediaKind: "image" | "video"
  description?: string
}

export interface OnboardingState {
  step: number
  studioName: string
  heroLine1: string
  heroLine2: string
  intro: string
  disciplines: string[]
  projects: OnboardingProject[]
  statementHeadline: string
  statementBody: string
  contactEmail: string
  templateId: TemplateId
}

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  step: 1,
  studioName: "FRAME",
  heroLine1: "AI made visual.",
  heroLine2: "Human made creative.",
  intro: "A simple portfolio of AI-generated films, advertisements, graphics and visual experiments.",
  disciplines: ["Films", "Ads", "Graphics"],
  projects: [
    {
      id: "proj-1",
      title: "After Tomorrow",
      category: "film",
      detail: "AI short film · 04:18",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1800&q=90",
      mediaKind: "image",
    },
    {
      id: "proj-2",
      title: "Maison Noire",
      category: "ad",
      detail: "Luxury campaign · 00:45",
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=90",
      mediaKind: "image",
    },
    {
      id: "proj-3",
      title: "Synthetic Nature",
      category: "graphic",
      detail: "Generative image series",
      image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=90",
      mediaKind: "image",
    },
    {
      id: "proj-4",
      title: "Human / Machine",
      category: "graphic",
      detail: "Editorial visual series",
      image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=90",
      mediaKind: "image",
    },
    {
      id: "proj-5",
      title: "Parallel",
      category: "film",
      detail: "Concept film · 02:40",
      image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=90",
      mediaKind: "image",
    },
    {
      id: "proj-6",
      title: "Future Product",
      category: "ad",
      detail: "Product campaign · 00:30",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=90",
      mediaKind: "image",
    },
  ],
  statementHeadline: "Less noise.\nMore work.",
  statementBody: "FRAME is a visual archive for AI-generated creative work. Films, ads and graphics are presented first. Everything else stays secondary so the work gets the attention.",
  contactEmail: "hello@framestudio.ai",
  templateId: "frame",
}
```

### 5.2 Draft Generator Implementation (`generateDraftFromOnboarding`)

```typescript
export function generateDraftFromOnboarding(
  state: OnboardingState,
  slug: string
): StoredPortfolio {
  const template = coerceTemplate(state.templateId || "frame")
  const base = getBaseDraft(slug, template)
  const projects = state.projects.length ? state.projects : DEFAULT_ONBOARDING_STATE.projects
  const first = projects[0]

  const portfolio: StoredPortfolio = {
    ...base,
    slug,
    name: state.studioName.trim() || "FRAME",
    school: state.studioName.trim() || "FRAME",
    title: state.heroLine2.trim() || "Human made creative.",
    bio: state.intro.trim() || "A simple portfolio of films, advertisements, graphics and visual experiments.",
    status: "draft",
    template,
    project: {
      name: first?.title.trim() || "Untitled project",
      copy: first?.detail.trim() || "Selected work",
    },
    skills: state.disciplines.length ? state.disciplines : ["Films", "Ads", "Graphics"],
    media: {
      ...base.media,
      stills: projects.map((p) => p.image).filter(Boolean),
    },
    settings: {
      ...base.settings,
      email: state.contactEmail.trim() || "hello@framestudio.ai",
    },
    updatedAt: Date.now(),
  }

  // 1. Hero Block
  const heroBlock: FolioBlock = {
    ...createBlock("hero", portfolio, template),
    id: "hero-introduction",
    heading: `${state.heroLine1.trim() || "AI made visual."}\n${state.heroLine2.trim() || "Human made creative."}`,
    body: portfolio.bio,
    image: first?.image || "",
    cta: "VIEW WORK →",
    ctaHref: "#work",
  }

  // 2. Project Blocks (Featured + Still)
  const projectBlocks: FolioBlock[] = projects.map((proj, idx) => ({
    ...createBlock(idx === 0 ? "featured" : "still", portfolio, template),
    id: `project-work-${idx + 1}`,
    heading: proj.title.trim() || `Work ${String(idx + 1).padStart(2, "0")}`,
    eyebrow: proj.category,
    body: proj.detail.trim() || proj.category,
    image: proj.image || STUDENT_WORK[idx % STUDENT_WORK.length]?.src || "",
    mediaKind: proj.mediaKind || "image",
    imageAlt: proj.title.trim() || `Work ${idx + 1}`,
  }))

  // 3. About Block
  const aboutBlock: FolioBlock = {
    ...createBlock("about", portfolio, template),
    id: "about-manifesto",
    heading: state.statementHeadline.trim() || "Less noise.\nMore work.",
    body: state.statementBody.trim() || `${portfolio.name} is a visual archive for selected creative work.`,
    image: "",
  }

  // 4. Skills Block
  const skillsBlock: FolioBlock = {
    ...createBlock("skills", portfolio, template),
    id: "skills-disciplines",
    heading: "Disciplines",
    body: "Core creative capabilities and technical focus.",
    items: portfolio.skills,
  }

  // 5. Contact CTA Block
  const contactBlock: FolioBlock = {
    ...createBlock("contact", portfolio, template),
    id: "contact-closing",
    heading: "Have an idea?\nLet's make it.",
    body: portfolio.skills.join(" · ") || "Films · Ads · Graphics",
    cta: `${portfolio.settings.email.toUpperCase()} ↗`,
    ctaHref: `mailto:${portfolio.settings.email}`,
    image: "",
  }

  const nextPortfolio: StoredPortfolio = {
    ...portfolio,
    blocks: [heroBlock, ...projectBlocks, aboutBlock, skillsBlock, contactBlock],
  }

  return {
    ...nextPortfolio,
    seo: defaultSeo(nextPortfolio),
  }
}
```

---

## 6. Detailed Route & Component Implementation Plan

### 6.1 `app/onboarding/page.tsx`
- Redirects immediately to `/onboarding/1` (or reads saved step from client side).
```tsx
import { redirect } from "next/navigation"

export default function OnboardingRootPage() {
  redirect("/onboarding/1")
}
```

### 6.2 `app/onboarding/[step]/page.tsx`
- App Router dynamic route with static params generation.
- Handles validation of `step` (`1`..`5`).
- Passes step to client coordinator `<OnboardingFlow currentStep={stepNumber} />`.

```tsx
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { OnboardingFlow } from "@/components/onboarding-flow"
import "@/app/dashboard/dashboard.css"

export const metadata: Metadata = {
  title: "Create your portfolio — AFM",
}

export function generateStaticParams() {
  return [
    { step: "1" },
    { step: "2" },
    { step: "3" },
    { step: "4" },
    { step: "5" },
  ]
}

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>
}) {
  const { step } = await params
  const stepNum = parseInt(step, 10)

  if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
    redirect("/onboarding/1")
  }

  return <OnboardingFlow currentStep={stepNum} />
}
```

### 6.3 Coordinator Component: `components/onboarding-flow.tsx`
- Coordinates:
  1. `state` initialized from `getSavedOnboardingState()`.
  2. Auto-sync to `localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state))`.
  3. Real-time compute of `preview = generateDraftFromOnboarding(state, "preview")`.
  4. Step rendering:
     - Step 1: `<StepIdentity state={state} errors={errors} onChange={patch} />`
     - Step 2: `<StepDisciplines state={state} onChange={patch} />`
     - Step 3: `<StepProjects state={state} errors={errors} onChange={patch} />`
     - Step 4: `<StepStatement state={state} errors={errors} onChange={patch} />`
     - Step 5: `<StepLaunch state={state} onChange={patch} onComplete={handleCreatePortfolio} />`
  5. Navigation handling:
     - `onBack`: navigates `router.push('/onboarding/' + (currentStep - 1))`
     - `onNext`: validates current step fields, if valid navigates `router.push('/onboarding/' + (currentStep + 1))`
  6. Final completion:
     - Computes `slug = uniquePortfolioSlug(state.studioName)`
     - Generates draft: `draft = generateDraftFromOnboarding(state, slug)`
     - Saves to `saveDraft(slug, draft)` and `saveDraft("talib", draft)`
     - Clears `ONBOARDING_STORAGE_KEY`
     - Pushes `router.push('/edit/' + slug + '?welcome=1')` (or `/edit/talib?welcome=1`)

---

## 7. Edge Cases & Verification Strategy

### 7.1 Key Edge Cases Addressed
1. **Direct URL Navigation / Page Refresh**:
   - User refreshes on `/onboarding/3` -> state is read from `localStorage` immediately after mount, preserving all previously entered data.
2. **Invalid Step Parameter**:
   - `/onboarding/abc` or `/onboarding/9` -> Server component redirects safely to `/onboarding/1`.
3. **Empty or Missing Media**:
   - If user provides no custom images, default curated student artwork from `STUDENT_WORK` ensures the preview and editor canvas are never broken.
4. **Large Media Uploads**:
   - Image files restricted to 1.5 MB and videos to 3.0 MB via FileReader data URLs, with clear error messaging if exceeded, plus direct URL fallback.
5. **Next.js 15 Static Prerendering Compliance**:
   - `generateStaticParams` provided for `[step]`.
   - `params` properly awaited as `Promise<{ step: string }>`.
   - Client storage accessed inside `useEffect` with `mounted` guard to guarantee 100% hydration matching.

---

## 8. Summary of Action Items for Worker M3

1. Create `lib/onboarding.ts` with `OnboardingState`, `DEFAULT_ONBOARDING_STATE`, storage helpers, and `generateDraftFromOnboarding()`.
2. Update `app/onboarding/page.tsx` to redirect to `/onboarding/1`.
3. Implement `app/onboarding/[step]/page.tsx` with dynamic step routing and `generateStaticParams`.
4. Create/update `components/onboarding-flow.tsx` (or modular step components in `components/onboarding/`) with high-fidelity UI matching Frame taste.
5. Verify build succeeds with `npm run build` and test complete flow.
