import {
  DEFAULT_ONBOARDING_STATE,
  generateDraftFromOnboarding,
  type OnboardingState,
} from "./lib/onboarding"

console.log("--- TEST 1: Default Onboarding Draft Generation ---")
const draft1 = generateDraftFromOnboarding(DEFAULT_ONBOARDING_STATE, "talib")
console.log("Draft 1 Name:", draft1.name)
console.log("Draft 1 Template:", draft1.template)
console.log("Draft 1 Blocks Count:", draft1.blocks?.length)
console.log(
  "Draft 1 Block Types:",
  draft1.blocks?.map((b) => b.type)
)
console.log("Draft 1 Media Stills:", draft1.media?.stills)
console.log("Draft 1 Settings Email:", draft1.settings?.email)
console.log("Draft 1 Skills:", draft1.skills)

console.log("\n--- TEST 2: Custom Onboarding State ---")
const customState: OnboardingState = {
  studioName: "KROMA LABS",
  heroLine1: "Cinematic AI Direction",
  heroLine2: "Next Generation Visuals",
  contactEmail: "hello@kromalabs.co",
  disciplines: ["Films", "VFX", "Spatial"],
  projects: [
    {
      id: "p1",
      title: "Hyperion Protocol",
      category: "Films",
      runtime: "05:12",
      imageUrl: "https://example.com/p1.jpg",
      client: "Sony Music",
      description: "Sci-fi music film.",
    },
    {
      id: "p2",
      title: "Neon Horizon",
      category: "VFX",
      runtime: "01:30",
      imageUrl: "https://example.com/p2.jpg",
      client: "Nike",
      description: "Futuristic ad campaign.",
    },
    {
      id: "p3",
      title: "Echoes of Void",
      category: "Spatial",
      runtime: "Stills",
      imageUrl: "https://example.com/p3.jpg",
      description: "Generative spatial art.",
    },
  ],
  statementHeadline: "Crafting the Unreal.",
  statementBio: "A boutique creative studio exploring high-fidelity visual experiments.",
  services: ["Creative Direction", "CGI & VFX", "Worldbuilding"],
  templateId: "frame",
}

const draft2 = generateDraftFromOnboarding(customState, "kroma")
console.log("Draft 2 Name:", draft2.name)
console.log("Draft 2 Title:", draft2.title)
console.log("Draft 2 Project Name:", draft2.project.name)
console.log("Draft 2 Stills Count:", draft2.media.stills.length)
console.log(
  "Draft 2 Blocks:",
  draft2.blocks?.map((b) => `${b.type}: ${b.heading}`)
)

console.log("\n--- TEST 3: Edge Case (Empty State Fallbacks) ---")
const emptyState = {} as unknown as OnboardingState
const draft3 = generateDraftFromOnboarding(emptyState, "fallback")
console.log("Draft 3 Fallback Name:", draft3.name)
console.log("Draft 3 Fallback Template:", draft3.template)
console.log("Draft 3 Fallback Blocks Count:", draft3.blocks?.length)
console.log("Draft 3 Fallback Status:", draft3.status)
console.log("ALL TESTS COMPLETED SUCCESSFULLY!")
