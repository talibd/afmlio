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

  const whyBlock: FolioBlock = {
    ...createBlock("why", base, "frame"),
    id: "why-process",
    heading: "Studio Process & Approach",
    body: "How we move from conceptual premise to high-fidelity visual delivery.",
    items: [
      "01 / Conceptual Worldbuilding|Developing cohesive visual languages, tone boards, and narrative treatment.",
      "02 / Rapid Prototyping & Previzi|Iterative camera blocking, style frames, and generative simulation tests.",
      "03 / High-Fidelity Execution|Full-resolution rendering, procedural lighting, and bespoke sound synthesis.",
      "04 / Finishing & Multi-Platform Delivery|Color grading, compositing, and modular format delivery for campaign rollout.",
    ],
    hidden: false,
  }

  const reviewsBlock: FolioBlock = {
    ...createBlock("reviews", base, "frame"),
    id: "reviews-testimonials",
    heading: "Collaborator Notes & Acclaim",
    body: "Feedback from creative directors, curators, and production partners.",
    items: [
      "The visual precision and rhythm in their direction elevated our entire launch campaign.|Elena Rostova|Executive Creative Director, Kroma|https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      "Uncompromising attention to lighting and atmosphere. A rare cinematic voice in digital CGI.|Marcus Vance|Head of Design, Hyperform|https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      "Delivered a breathtaking visual identity system on an impossible turnaround.|Aria Chen|Senior Producer, Aura Systems|https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    ],
    hidden: false,
  }

  const faqBlock: FolioBlock = {
    ...createBlock("faq", base, "frame"),
    id: "faq-questions",
    heading: "Frequently Asked Questions",
    body: "Common inquiries regarding commissions, production timelines, and licensing.",
    items: [
      "What types of commissions do you accept?|We partner on narrative film direction, commercial spots, brand visual identities, 3D CGI campaigns, and interactive digital experiences.",
      "What is your typical production timeline?|Focused project sprints typically run 2 to 4 weeks for concept and motion tests, with full campaign production spanning 4 to 8 weeks.",
      "Do you collaborate with agency teams or direct-to-brand?|Both. We often operate as the specialist visual direction partner for agencies or lead direct-to-client creative development.",
      "How do we initiate a new project or brief?|Send us an initial note via the contact section below with your timeline, scope, and reference materials to schedule a kickoff.",
    ],
    hidden: false,
  }

  const aboutBlock: FolioBlock = {
    ...createBlock("about", base, "frame"),
    id: "about-manifesto",
    heading: statementHeadline,
    body: statementBio,
    image: firstProject?.imageUrl || "",
    hidden: false,
  }

  const contactBlock: FolioBlock = {
    ...createBlock("contact", base, "frame"),
    id: "contact-studio",
    heading: "Have an idea?\nLet's make it.",
    body:
      (disciplines.length > 0 ? disciplines : services).join(" · ") ||
      "Films · Commercials · Motion · 3D & CGI · Editorial",
    cta: `${email.toUpperCase()} ↗`,
    ctaHref: `mailto:${email}`,
    image: "",
    hidden: false,
  }

  const footerBlock: FolioBlock = {
    ...createBlock("footer", base, "frame"),
    id: "footer-studio",
    heading: studioName,
    body: `© ${new Date().getFullYear()} ${studioName}. All rights reserved.`,
    items: services.length > 0 ? services : disciplines,
    cta: "Back to Top ↑",
    ctaHref: "#top",
    hidden: false,
  }

  const allBlocks: FolioBlock[] = [
    heroBlock,
    ...projectBlocks,
    skillsBlock,
    whyBlock,
    reviewsBlock,
    faqBlock,
    aboutBlock,
    contactBlock,
    footerBlock,
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
