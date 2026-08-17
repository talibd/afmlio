"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, ChevronDown, ExternalLink, Loader2, Plus, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TasteFolio } from "@/components/taste-folio"
import { createBlock } from "@/lib/blocks"
import type { Portfolio } from "@/lib/demo"
import { FRAME_VARIANTS, type FrameVariantId, frameVariant } from "@/lib/frame-variants"
import { defaultChrome, defaultMedia, defaultSettings } from "@/lib/portfolio-store"

type Step = 1 | 2 | 3 | 4
type Asset = { id?: string; key?: string; url: string; type: "image" | "video"; fileName?: string }
type Project = { id: string; title: string; category: string; description: string; media: Asset | null }
export type FrameOnboardingState = {
  identity: { displayName: string; headline: string; intro: string; email: string }
  /** Page copy the template otherwise hardcodes. All optional — every field
   *  falls back to the template's own line. */
  copy: { heroCta: string; aboutHeading: string; aboutBody: string; contactHeading: string; footerNote: string }
  /** Handles or full URLs; empty platforms never render. Normalized to
   *  absolute links only when the draft is built. */
  socials: { instagram: string; whatsapp: string; youtube: string; vimeo: string; tiktok: string; linkedin: string }
  branding: {
    logoMode: "wordmark" | "mark" | "both"; wordmark: string; logo: Asset | null
    frameVariant: FrameVariantId
    accentColor: string; backgroundColor: string; textColor: string
    fontPairing: "editorial" | "modern" | "gallery"; buttonStyle: "pill" | "square" | "outline"
  }
  projects: Project[]
  presentation: {
    showWorkNav: boolean; showAboutNav: boolean; showContactNav: boolean; showContactCta: boolean
    seoTitle: string; seoDescription: string; allowIndexing: boolean
  }
}

const DEFAULTS: FrameOnboardingState = {
  identity: { displayName: "", headline: "", intro: "", email: "" },
  copy: { heroCta: "VIEW WORK →", aboutHeading: "Less noise. / More work.", aboutBody: "", contactHeading: "Have an idea? / Let's make it.", footerNote: "" },
  socials: { instagram: "", whatsapp: "", youtube: "", vimeo: "", tiktok: "", linkedin: "" },
  branding: { logoMode: "wordmark", wordmark: "", logo: null, frameVariant: "frame", accentColor: "#DFFF45", backgroundColor: "#FFFFFF", textColor: "#111111", fontPairing: "editorial", buttonStyle: "square" },
  projects: [{ id: "project-1", title: "", category: "Film", description: "", media: null }],
  presentation: { showWorkNav: true, showAboutNav: true, showContactNav: true, showContactCta: true, seoTitle: "", seoDescription: "", allowIndexing: true },
}

/* Stand-in copy and synthetic stills so a style card reads as a page before the
   student has typed anything. Replaced field by field as they fill step 2. */
const SEED: FrameOnboardingState = {
  ...DEFAULTS,
  identity: {
    displayName: "Your studio",
    headline: "AI made visual. / Human made creative.",
    intro: "Two sentences about your practice, the work you take on, and who you make it with.",
    email: "hello@example.com",
  },
  branding: { ...DEFAULTS.branding, wordmark: "Your studio" },
  projects: [
    { id: "seed-1", title: "Night path", category: "Film", description: "Short film", media: { url: "/work/work-night-path.png", type: "image" } },
    { id: "seed-2", title: "Screening", category: "Photography", description: "Series", media: { url: "/work/work-screening.png", type: "image" } },
    { id: "seed-3", title: "Vessels", category: "Design", description: "Studies", media: { url: "/work/work-vessels.png", type: "image" } },
  ],
}

/* The progress rail already names and numbers the step, so each step carries
   only one short description — no second title, no countdown. */
const STEPS = [
  ["Style", "Pick how your page should feel — you can change it anytime."],
  ["Content", "Your name, story, and the words on your page."],
  ["Projects", "Add your work. The first project leads the page."],
  ["Review", "Check the last details, then create your page."],
] as const

function apiErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object" || !("error" in body)) return fallback
  const error = (body as { error?: unknown }).error
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message
  }
  return fallback
}

function mergeDraft(value?: Partial<FrameOnboardingState>): FrameOnboardingState {
  if (!value) return DEFAULTS
  return {
    identity: { ...DEFAULTS.identity, ...value.identity }, branding: { ...DEFAULTS.branding, ...value.branding },
    copy: { ...DEFAULTS.copy, ...value.copy }, socials: { ...DEFAULTS.socials, ...value.socials },
    projects: value.projects?.length ? value.projects : DEFAULTS.projects,
    presentation: { ...DEFAULTS.presentation, ...value.presentation },
  }
}

async function uploadToR2(file: File): Promise<Asset> {
  const response = await fetch("/api/uploads/authorize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentType: file.type, size: file.size }) })
  if (!response.ok) throw new Error(apiErrorMessage(await response.json().catch(() => null), "Could not prepare the upload."))
  const result = (await response.json()) as { key: string; uploadUrl: string; ticket: string; headers?: Record<string, string> }
  const upload = await fetch(result.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type, ...result.headers }, body: file })
  if (!upload.ok) throw new Error("The file could not be uploaded.")
  const completed = await fetch("/api/uploads/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticket: result.ticket }) })
  if (!completed.ok) throw new Error(apiErrorMessage(await completed.json().catch(() => null), "The upload could not be verified."))
  const asset = (await completed.json()) as { id: string; key: string; url: string; kind: "image" | "video" }
  return { id: asset.id, key: asset.key, url: asset.url, type: asset.kind, fileName: file.name }
}

/** Accepts a handle, phone number, or pasted URL per platform and returns
 *  "Label|https://…" pipe entries — the list format footer links render from. */
function socialItems(socials: FrameOnboardingState["socials"]): string[] {
  const url = (raw: string, build: (bare: string) => string) => {
    const v = raw.trim()
    if (!v) return ""
    return /^https?:\/\//i.test(v) ? v : build(v.replace(/^@/, ""))
  }
  const entries: Array<[string, string]> = [
    ["Instagram", url(socials.instagram, (h) => `https://instagram.com/${h}`)],
    ["WhatsApp", url(socials.whatsapp, (h) => `https://wa.me/${h.replace(/[^\d]/g, "")}`)],
    ["YouTube", url(socials.youtube, (h) => `https://youtube.com/@${h}`)],
    ["Vimeo", url(socials.vimeo, (h) => `https://vimeo.com/${h}`)],
    ["TikTok", url(socials.tiktok, (h) => `https://www.tiktok.com/@${h}`)],
    ["LinkedIn", url(socials.linkedin, (h) => `https://linkedin.com/in/${h}`)],
  ]
  return entries.filter(([, href]) => href).map(([label, href]) => `${label}|${href}`)
}

function buildPortfolioDraft(value: FrameOnboardingState) {
  const featured = value.projects[0]
  const portfolio: Portfolio = {
    slug: "pending",
    template: "frame",
    status: "draft",
    name: value.identity.displayName,
    school: value.identity.displayName,
    title: value.identity.headline,
    bio: value.identity.intro,
    project: { name: featured?.title || "", copy: featured?.description || "" },
    skills: Array.from(new Set(value.projects.map((project) => project.category))),
  }
  const work = value.projects.map((project) => ({
    ...createBlock("featured", portfolio, "frame"),
    id: `featured-${project.id}`,
    heading: project.title,
    eyebrow: project.category,
    body: project.description,
    image: project.media?.url || "",
    mediaKind: project.media?.type || "image",
    imageAlt: project.title,
    hidden: false,
  }))
  return {
    ...portfolio,
    media: {
      ...defaultMedia(),
      headshot: "",
      stills: value.projects.filter(project => project.media?.type === "image").map(project => project.media!.url),
      clips: value.projects.filter(project => project.media?.type === "video").map(project => project.media!.url),
    },
    settings: { ...defaultSettings(), email: value.identity.email, showEmail: value.presentation.showContactCta },
    seo: { title: value.presentation.seoTitle, description: value.presentation.seoDescription, indexable: value.presentation.allowIndexing },
    chrome: {
      ...defaultChrome(),
      logoMode: value.branding.logoMode,
      wordmark: value.branding.wordmark || value.identity.displayName,
      logoUrl: value.branding.logo?.url || "",
      showWorkNav: value.presentation.showWorkNav,
      showAboutNav: value.presentation.showAboutNav,
      showContactNav: value.presentation.showContactNav,
    },
    customization: { ...value.branding, logo: value.branding.logo || null },
    blocks: [
      { ...createBlock("hero", portfolio, "frame"), id: "hero-introduction", heading: value.identity.headline, body: value.identity.intro, image: featured?.media?.url || "", mediaKind: featured?.media?.type || "image", cta: value.copy.heroCta.trim() || "VIEW WORK →", ctaHref: "#work", hidden: false },
      ...work,
      // The about heading uses the same slash-for-line-break convention as the
      // headline field; the template renders "\n" as the break.
      { ...createBlock("about", portfolio, "frame"), id: "about-story", heading: (value.copy.aboutHeading.trim() || "Less noise. / More work.").split("/").map((line) => line.trim()).join("\n"), body: value.copy.aboutBody.trim() || value.identity.intro, hidden: false },
      { ...createBlock("contact", portfolio, "frame"), id: "contact-invitation", heading: (value.copy.contactHeading.trim() || "Have an idea? / Let's make it.").split("/").map((line) => line.trim()).join("\n"), body: Array.from(new Set(value.projects.map((project) => project.category))).join(" · "), cta: `${value.identity.email.toUpperCase()} ↗`, ctaHref: `mailto:${value.identity.email}`, hidden: !value.presentation.showContactCta },
      ...((value.copy.footerNote.trim() || socialItems(value.socials).length)
        // heading stays empty so the template's © line keeps rendering; only
        // the note and social links are authored here.
        ? [{ ...createBlock("footer", portfolio, "frame"), id: "footer-note", heading: "", body: value.copy.footerNote.trim(), items: socialItems(value.socials), hidden: false }]
        : []),
    ],
    updatedAt: Date.now(),
  }
}

/** A style card shows the student's own page once they have content, and the
 *  seeded stand-in before that, so every card is judged on style alone. */
function previewValue(value: FrameOnboardingState, variant: FrameVariantId): FrameOnboardingState {
  const hasOwn = Boolean(value.identity.displayName.trim() || value.identity.headline.trim() || value.projects.some(p => p.media))
  const base = hasOwn ? value : { ...SEED, branding: { ...SEED.branding, ...value.branding } }
  const preset = frameVariant(variant)
  return {
    ...base,
    branding: {
      ...base.branding,
      frameVariant: preset.id,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
      buttonStyle: preset.buttonStyle,
    },
  }
}

function Message({ id, text }: { id: string; text?: string }) {
  return text ? <p id={id} role="alert" className="fo-error">{text}</p> : null
}

function Toggle({ label, note, value, onChange }: { label: string; note: string; value: boolean; onChange: (value: boolean) => void }) {
  return <label className="fo-toggle"><span className="fo-toggle-copy"><strong>{label}</strong><span>{note}</span></span><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="sr-only" /><span className="fo-toggle-box" aria-hidden="true" /></label>
}

function Preview({ value }: { value: FrameOnboardingState }) {
  return <TasteFolio portfolio={buildPortfolioDraft(value)} template="frame" />
}

/* Each style's display face is loaded globally by next/font, so the row name
   can speak in the style's own voice — same trick the old font picker used. */
const STYLE_ROW_FONT: Record<FrameVariantId, string> = {
  frame: 'Georgia, "Times New Roman", serif',
  press: "var(--font-folio), Didot, serif",
  void: 'var(--font-walk), "Palatino Linotype", serif',
  studio: "var(--font-flood), ui-sans-serif, sans-serif",
  column: "var(--font-aperture), Georgia, serif",
}

function StylePicker({ selected, onSelect }: { selected: FrameVariantId; onSelect: (id: FrameVariantId) => void }) {
  return (
    <ul className="fo-styles">
      {FRAME_VARIANTS.map((variant) => {
        const on = selected === variant.id
        return (
          <li key={variant.id}>
            <button type="button" className="fo-style" aria-pressed={on} onClick={() => onSelect(variant.id)}>
              <span className="fo-style-copy">
                <span className="fo-style-name" style={{ fontFamily: STYLE_ROW_FONT[variant.id] }}>{variant.name}</span>
                <span className="fo-style-blurb">{variant.blurb}</span>
              </span>
              <span className="fo-style-side">
                <span className="fo-style-swatches" aria-hidden="true">
                  <span className="fo-style-swatch" style={{ background: variant.backgroundColor }} />
                  <span className="fo-style-swatch" style={{ background: variant.textColor }} />
                  <span className="fo-style-swatch" style={{ background: variant.accentColor }} />
                </span>
                {on && <span className="fo-style-check"><Check className="size-3" /></span>}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function FrameOnboarding({ initialStep = 1 }: { initialStep?: Step }) {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>(initialStep), [value, setValue] = React.useState(DEFAULTS)
  const [errors, setErrors] = React.useState<Record<string, string>>({}), [loading, setLoading] = React.useState(true)
  const [launching, setLaunching] = React.useState(false), [uploading, setUploading] = React.useState<string | null>(null)
  const [save, setSave] = React.useState<"" | "Saving…" | "Saved" | "Changes not saved">("")
  const hydrated = React.useRef(false)

  React.useEffect(() => { let active = true; void fetch("/api/onboarding/draft", { cache: "no-store" }).then(async r => { if (!r.ok) throw new Error(); const b = await r.json() as { onboarding?: Partial<FrameOnboardingState> }; if (active) setValue(mergeDraft(b.onboarding)) }).catch(() => active && setSave("Changes not saved")).finally(() => { if (active) { hydrated.current = true; setLoading(false) } }); return () => { active = false } }, [])
  React.useEffect(() => { if (!hydrated.current) return; const controller = new AbortController(), timer = window.setTimeout(() => { setSave("Saving…"); void fetch("/api/onboarding/draft", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value), signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); setSave("Saved") }).catch(e => { if (e?.name !== "AbortError") setSave("Changes not saved") }) }, 650); return () => { clearTimeout(timer); controller.abort() } }, [value, step])

  const identity = (u: Partial<FrameOnboardingState["identity"]>) => setValue(v => ({ ...v, identity: { ...v.identity, ...u } }))
  const branding = (u: Partial<FrameOnboardingState["branding"]>) => setValue(v => ({ ...v, branding: { ...v.branding, ...u } }))
  const presentation = (u: Partial<FrameOnboardingState["presentation"]>) => setValue(v => ({ ...v, presentation: { ...v.presentation, ...u } }))
  const copy = (u: Partial<FrameOnboardingState["copy"]>) => setValue(v => ({ ...v, copy: { ...v.copy, ...u } }))
  const socials = (u: Partial<FrameOnboardingState["socials"]>) => setValue(v => ({ ...v, socials: { ...v.socials, ...u } }))
  const project = (id: string, u: Partial<Project>) => setValue(v => ({ ...v, projects: v.projects.map(p => p.id === id ? { ...p, ...u } : p) }))
  const go = (s: Step) => { setStep(s); setErrors({}); router.push(`/onboarding/${s}`, { scroll: false }) }

  /* Picking a style writes the preset's palette and action shape into branding
     so they stay a single source of truth and remain editable later. */
  const pickVariant = (id: FrameVariantId) => {
    const preset = frameVariant(id)
    branding({ frameVariant: preset.id, accentColor: preset.accentColor, backgroundColor: preset.backgroundColor, textColor: preset.textColor, buttonStyle: preset.buttonStyle })
  }

  /* Navigating between /onboarding/[step] segments remounts this component and
     rehydrates from the server draft, so anything decided inside a handler must
     be persisted as the payload — local setValue alone is discarded. */
  async function persistOnboarding(payload: FrameOnboardingState = value) {
    setSave("Saving…")
    const response = await fetch("/api/onboarding/draft", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (!response.ok) throw new Error(apiErrorMessage(await response.json().catch(() => null), "Your changes could not be saved."))
    setSave("Saved")
  }

  async function back() {
    if (step === 1) return router.push("/dashboard")
    try {
      await persistOnboarding()
      go((step - 1) as Step)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your changes could not be saved.")
    }
  }

  async function attach(file: File, target: string) { const logo = target === "logo"; if (logo ? !file.type.startsWith("image/") : !(file.type.startsWith("image/") || file.type.startsWith("video/"))) return toast.error(logo ? "Choose an image for your logo." : "Choose an image or video."); setUploading(target); try { const asset = await uploadToR2(file); if (logo) branding({ logo: asset }); else project(target, { media: asset }); toast.success("Upload complete.") } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed.") } finally { setUploading(null) } }
  function validate() { const e: Record<string, string> = {}; if (step === 2) { if (!value.identity.displayName.trim()) e.displayName = "Add the name visitors should see."; if (!value.identity.headline.trim()) e.headline = "Add a short headline."; if (!value.identity.intro.trim()) e.intro = "Add a short introduction."; if (!/^\S+@\S+\.\S+$/.test(value.identity.email)) e.email = "Enter a valid email."; if (value.branding.logoMode !== "mark" && !value.branding.wordmark.trim() && !value.identity.displayName.trim()) e.wordmark = "Add your wordmark."; if (value.branding.logoMode === "mark" && !value.branding.logo) e.logo = "Upload a logo or choose Wordmark." } if (step === 3) value.projects.forEach((p, i) => { if (!p.title.trim()) e[`${p.id}-title`] = `Add a title for project ${i + 1}.`; if (!p.media) e[`${p.id}-media`] = `Add media for project ${i + 1}.` }); if (step === 4) { if (!value.presentation.seoTitle.trim()) e.seoTitle = "Add a page title."; if (!value.presentation.seoDescription.trim()) e.seoDescription = "Add a search description." } setErrors(e); return !Object.keys(e).length }
  async function next() { if (!validate()) return; if (step < 4) { /* Arriving at Review with the search fields already filled from earlier
       answers turns the last step into a confirm, not a form. */ let payload = value; if (step === 3) { payload = { ...value, presentation: { ...value.presentation, seoTitle: value.presentation.seoTitle || `${value.identity.displayName} — Portfolio`, seoDescription: value.presentation.seoDescription || value.identity.intro.slice(0, 160) } }; setValue(payload) } try { await persistOnboarding(payload); go((step + 1) as Step) } catch (error) { toast.error(error instanceof Error ? error.message : "Your changes could not be saved.") } return } setLaunching(true); try { await persistOnboarding(); const r = await fetch("/api/portfolios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ template: "frame", name: value.identity.displayName, onboarding: value, draftSnapshot: buildPortfolioDraft(value) }) }); if (!r.ok) throw new Error(apiErrorMessage(await r.json().catch(() => null), "Portfolio could not be created.")); const b = await r.json() as { slug?: string; portfolio?: { slug?: string } }; const slug = b.portfolio?.slug || b.slug; if (!slug) throw new Error("No portfolio address was returned."); router.push(`/edit/${encodeURIComponent(slug)}?welcome=1`) } catch (e) { toast.error(e instanceof Error ? e.message : "Portfolio could not be created."); setLaunching(false) } }

  if (loading) return <div className="frame-onboarding grid place-items-center"><span className="flex items-center gap-3 text-xs uppercase tracking-[.08em]"><Loader2 className="size-4 animate-spin" />Preparing your Frame</span></div>
  const meta = STEPS[step - 1]
  const activeVariant = frameVariant(value.branding.frameVariant)
  return <div className="afm-dashboard no-scrollbar frame-onboarding"><div className="fo-shell">
    <section className="fo-panel" aria-labelledby="onboarding-title">
      <header className="fo-header"><button type="button" onClick={() => router.push("/dashboard")} className="fo-brand" aria-label="Return to dashboard"><span className="fo-brand-mark" aria-hidden="true" /><strong>AFM</strong><span className="fo-brand-badge">Onboarding</span></button><span className="fo-save" data-state={save} aria-live="polite">{save}</span></header>
      <ol className="fo-progress" aria-label="Onboarding progress">{STEPS.map((s, i) => <li key={s[0]}><button type="button" disabled={i + 1 > step} onClick={() => i + 1 < step && go((i + 1) as Step)} aria-current={i + 1 === step ? "step" : undefined} className="fo-step"><span>{String(i + 1).padStart(2, "0")}</span>{s[0]}</button></li>)}</ol>
      <div className="fo-content"><div className="fo-form"><h1 id="onboarding-title" className="sr-only">{meta[0]}</h1><p className="fo-intro">{meta[1]}</p>
        {step === 1 && <StylePicker selected={activeVariant.id} onSelect={pickVariant} />}
        {step === 2 && <div className="fo-fields">
          <label className="fo-label">Name or studio name<Input className="fo-input" value={value.identity.displayName} onChange={e => identity({ displayName: e.target.value })} placeholder="Nadia Rahman" aria-invalid={!!errors.displayName} /><Message id="displayName-error" text={errors.displayName} /></label>
          <label className="fo-label">Portfolio headline<Input className="fo-input" value={value.identity.headline} onChange={e => identity({ headline: e.target.value })} placeholder="AI made visual. / Human made creative." aria-invalid={!!errors.headline} /><Message id="headline-error" text={errors.headline} /><span className="fo-hint">Use a slash to create the template&apos;s two-line headline.</span></label>
          <label className="fo-label">Short introduction<Textarea className="fo-textarea" value={value.identity.intro} onChange={e => identity({ intro: e.target.value })} maxLength={320} placeholder="Two sentences about your practice." /><Message id="intro-error" text={errors.intro} /></label>
          <label className="fo-label">Contact email<Input className="fo-input" type="email" value={value.identity.email} onChange={e => identity({ email: e.target.value })} placeholder="hello@example.com" /><Message id="email-error" text={errors.email} /></label>
          <fieldset><legend className="fo-legend">Page copy</legend><div className="fo-fields mt-2">
            <label className="fo-label">Work button label<Input className="fo-input" value={value.copy.heroCta} onChange={e => copy({ heroCta: e.target.value })} placeholder="VIEW WORK →" /><span className="fo-hint">The button under your headline that jumps to your projects.</span></label>
            <label className="fo-label">About heading<Input className="fo-input" value={value.copy.aboutHeading} onChange={e => copy({ aboutHeading: e.target.value })} placeholder="Less noise. / More work." /><span className="fo-hint">Use a slash to create the two-line heading.</span></label>
            <label className="fo-label">About description<Textarea className="fo-textarea" value={value.copy.aboutBody} onChange={e => copy({ aboutBody: e.target.value })} maxLength={480} placeholder="A longer note about your practice for the About section." /><span className="fo-hint">Optional — defaults to your short introduction.</span></label>
            <label className="fo-label">Contact heading<Input className="fo-input" value={value.copy.contactHeading} onChange={e => copy({ contactHeading: e.target.value })} placeholder="Have an idea? / Let's make it." /><span className="fo-hint">Use a slash — the second line gets the highlight.</span></label>
            <label className="fo-label">Footer line<Input className="fo-input" value={value.copy.footerNote} onChange={e => copy({ footerNote: e.target.value })} placeholder="AI FILMS · ADS · GRAPHICS" /><span className="fo-hint">Optional — defaults to your project disciplines.</span></label>
          </div></fieldset>
          <fieldset><legend className="fo-legend">Social links</legend><span className="fo-hint">Paste a handle, number, or full link — only filled platforms appear in your footer.</span><div className="fo-socials">
            {([["instagram", "Instagram", "@yourstudio"], ["whatsapp", "WhatsApp", "+91 98765 43210"], ["youtube", "YouTube", "@yourstudio"], ["vimeo", "Vimeo", "yourstudio"], ["tiktok", "TikTok", "@yourstudio"], ["linkedin", "LinkedIn", "yourstudio"]] as const).map(([key, label, ph]) => (
              <label key={key} className="fo-label">{label}<Input className="fo-input" value={value.socials[key]} onChange={e => socials({ [key]: e.target.value })} placeholder={ph} /></label>
            ))}
          </div></fieldset>
          <fieldset><legend className="fo-legend">How your name appears</legend><div className="fo-choices">{(["wordmark", "mark", "both"] as const).map(m => <button type="button" key={m} onClick={() => branding({ logoMode: m })} className="fo-choice" data-selected={value.branding.logoMode === m}>{m}</button>)}</div></fieldset>
          {value.branding.logoMode !== "mark" && <label className="fo-label">Wordmark<Input className="fo-input" value={value.branding.wordmark} onChange={e => branding({ wordmark: e.target.value })} placeholder={value.identity.displayName || "Your studio"} /><span className="fo-hint">Optional — defaults to your display name.</span><Message id="wordmark-error" text={errors.wordmark} /></label>}
          {value.branding.logoMode !== "wordmark" && <label className="fo-upload">{uploading === "logo" ? <span className="fo-upload-inner"><Loader2 className="size-5 animate-spin" />Uploading logo</span> : <span className="fo-upload-inner"><Upload className="size-5" />{value.branding.logo ? "Replace logo mark" : "Upload logo mark"}<small>PNG, JPG, WebP, SVG</small></span>}<input className="sr-only" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) void attach(f, "logo") }} /><Message id="logo-error" text={errors.logo} /></label>}
        </div>}
        {step === 3 && <div className="fo-fields">{value.projects.map((p, i) => <fieldset key={p.id} className="fo-project" aria-labelledby={`${p.id}-legend`}><div className="fo-project-head" id={`${p.id}-legend`}><span><small>{String(i + 1).padStart(2, "0")} / {i === 0 ? "Featured" : "Selected work"}</small>{i === 0 ? "Featured project" : `Project ${i + 1}`}</span>{value.projects.length > 1 && <button type="button" className="fo-remove" onClick={() => setValue(v => ({ ...v, projects: v.projects.filter(x => x.id !== p.id) }))} aria-label={`Remove ${p.title || `project ${i + 1}`}`}><Trash2 className="size-4" /></button>}</div><div className="fo-fields mt-6">
          <label className="fo-label">Title<Input className="fo-input" value={p.title} onChange={e => project(p.id, { title: e.target.value })} /><Message id={`${p.id}-title-error`} text={errors[`${p.id}-title`]} /></label>
          <label className="fo-label">Discipline<span className="fo-select-wrap"><select value={p.category} onChange={e => project(p.id, { category: e.target.value })} className="fo-select appearance-none px-3"><option>Film</option><option>Photography</option><option>Animation</option><option>Design</option><option>Other</option></select><ChevronDown aria-hidden="true" /></span></label>
          <label className="fo-label">Short description<Input className="fo-input" value={p.description} onChange={e => project(p.id, { description: e.target.value })} /></label>
          <label className="fo-upload">{p.media ? <span className="fo-upload-inner"><Check className="size-5" />{p.media.fileName || "Media uploaded"}<small>Choose another file to replace it</small></span> : <span className="fo-upload-inner"><Upload className="size-5" />Upload image or video<small>JPG, PNG, WebP, MP4, WebM, or MOV</small></span>}<input className="sr-only" type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={e => { const f = e.target.files?.[0]; if (f) void attach(f, p.id) }} /></label><Message id={`${p.id}-media-error`} text={errors[`${p.id}-media`]} />
        </div></fieldset>)}<button type="button" className="fo-add" onClick={() => setValue(v => ({ ...v, projects: [...v.projects, { id: crypto.randomUUID(), title: "", category: "Film", description: "", media: null }] }))}><Plus className="size-4" />Add another project</button></div>}
        {step === 4 && <div className="fo-fields"><div className="fo-toggles"><Toggle label="Work link" note="Jump visitors directly to your projects." value={value.presentation.showWorkNav} onChange={v => presentation({ showWorkNav: v })} /><Toggle label="About link" note="Keep your introduction easy to find." value={value.presentation.showAboutNav} onChange={v => presentation({ showAboutNav: v })} /><Toggle label="Contact link" note="Show contact in the navigation." value={value.presentation.showContactNav} onChange={v => presentation({ showContactNav: v })} /><Toggle label="Contact section" note="Show the closing inquiry section and email action." value={value.presentation.showContactCta} onChange={v => presentation({ showContactCta: v })} /></div><label className="fo-label">Page title<Input className="fo-input" value={value.presentation.seoTitle} onChange={e => presentation({ seoTitle: e.target.value })} onFocus={() => !value.presentation.seoTitle && presentation({ seoTitle: `${value.identity.displayName} — Portfolio` })} /><span className="fo-hint">Prefilled from your name — adjust anytime.</span><Message id="seo-title-error" text={errors.seoTitle} /></label><label className="fo-label">Search description<Textarea className="fo-textarea" maxLength={160} value={value.presentation.seoDescription} onChange={e => presentation({ seoDescription: e.target.value })} onFocus={() => !value.presentation.seoDescription && presentation({ seoDescription: value.identity.intro.slice(0, 160) })} /><span className="fo-count">{value.presentation.seoDescription.length}/160</span><Message id="seo-description-error" text={errors.seoDescription} /></label><div className="fo-toggles"><Toggle label="Allow search indexing" note="Search engines may list your published portfolio." value={value.presentation.allowIndexing} onChange={v => presentation({ allowIndexing: v })} /></div></div>}
      </div></div>
      <footer className="fo-footer"><button type="button" className="fo-back" onClick={() => void back()}><ArrowLeft className="size-4" />{step === 1 ? "Exit" : "Back"}</button><button type="button" className="fo-action" onClick={() => void next()} disabled={launching || !!uploading}>{launching ? <Loader2 className="size-4 animate-spin" /> : step === 4 ? <ExternalLink className="size-4" /> : null}{step === 4 ? "Create portfolio" : "Continue"}{step < 4 && <ArrowRight className="size-4" />}</button></footer>
    </section>
    <aside className="fo-preview" aria-label="Live portfolio preview"><div className="fo-preview-head"><span className="fo-preview-label">Live preview</span><span className="fo-preview-template">{activeVariant.name} style</span></div><div className="fo-preview-canvas">{/* On the style step the preview wears seeded stand-in content until the
        student has typed their own, so switching styles always shows a full page. */}
      <Preview value={step === 1 ? previewValue(value, activeVariant.id) : value} /></div></aside>
  </div></div>
}
