"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Clapperboard, Plus, Trash2 } from "lucide-react"

import { FolioCanvas } from "@/components/folio-view"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createBlock } from "@/lib/blocks"
import { PROJECT_SRC, type FolioBlock } from "@/lib/demo"
import { STUDENT_WORK } from "@/lib/tastes"
import {
  defaultSeo,
  getBaseDraft,
  saveDraft,
  uniquePortfolioSlug,
  type StoredPortfolio,
} from "@/lib/portfolio-store"
import { cn } from "@/lib/utils"

const ONBOARDING_KEY = "afm:onboarding:frame"
const MAX_IMAGE_BYTES = 1_500_000
const MAX_VIDEO_BYTES = 3_000_000

type ProjectCategory = "film" | "ad" | "graphic"

type ProjectInput = {
  id: string
  title: string
  category: ProjectCategory
  detail: string
  image: string
  mediaKind: "image" | "video"
}

type FrameOnboardingState = {
  step: 1 | 2
  brand: string
  heroPrimary: string
  heroSecondary: string
  intro: string
  aboutHeading: string
  aboutBody: string
  email: string
  projects: ProjectInput[]
}

const INITIAL_STATE: FrameOnboardingState = {
  step: 1,
  brand: "",
  heroPrimary: "",
  heroSecondary: "Human made creative.",
  intro: "",
  aboutHeading: "Less noise.\nMore work.",
  aboutBody: "",
  email: "",
  projects: [
    {
      id: "project-1",
      title: "",
      category: "film",
      detail: "",
      image: "",
      mediaKind: "image",
    },
  ],
}

function categoryLabel(category: ProjectCategory) {
  if (category === "film") return "Films"
  if (category === "ad") return "Ads"
  return "Graphics"
}

function buildPortfolio(
  state: FrameOnboardingState,
  slug: string
): StoredPortfolio {
  const projects = state.projects.length
    ? state.projects
    : INITIAL_STATE.projects
  const first = projects[0]
  const base = getBaseDraft(slug, "frame")
  const categories = Array.from(
    new Set(projects.map((project) => categoryLabel(project.category)))
  )
  const portfolio: StoredPortfolio = {
    ...base,
    slug,
    name: state.brand.trim() || "FRAME",
    school: state.brand.trim() || "FRAME",
    title: state.heroSecondary.trim() || "Human made creative.",
    bio:
      state.intro.trim() ||
      "A simple portfolio of films, advertisements, graphics and visual experiments.",
    status: "draft",
    template: "frame",
    project: {
      name: first?.title.trim() || "Untitled project",
      copy: first?.detail.trim() || "Selected work",
    },
    skills: categories,
    settings: {
      ...base.settings,
      email: state.email.trim() || "hello@example.com",
    },
    updatedAt: Date.now(),
  }

  const hero = {
    ...createBlock("hero", portfolio, "frame"),
    id: "hero-introduction",
    heading: `${state.heroPrimary.trim() || "AI made visual."}\n${state.heroSecondary.trim() || "Human made creative."}`,
    body: portfolio.bio,
    image: "",
    cta: "VIEW WORK →",
    ctaHref: "#work",
  }
  const projectBlocks: FolioBlock[] = projects.map((project, index) => ({
    ...createBlock("featured", portfolio, "frame"),
    id: `featured-${index + 1}`,
    heading:
      project.title.trim() || `Work ${String(index + 1).padStart(2, "0")}`,
    eyebrow: project.category,
    body: project.detail.trim() || categoryLabel(project.category),
    image:
      project.image ||
      STUDENT_WORK[index % STUDENT_WORK.length]?.src ||
      PROJECT_SRC.frame,
    mediaKind: project.image ? project.mediaKind : "image",
    imageAlt: project.title.trim() || `Work ${index + 1}`,
  }))
  const about = {
    ...createBlock("about", portfolio, "frame"),
    id: "about-story",
    heading: state.aboutHeading.trim() || "Less noise.\nMore work.",
    body:
      state.aboutBody.trim() ||
      `${portfolio.name} is a visual archive for selected creative work.`,
    image: "",
  }
  const contact = {
    ...createBlock("contact", portfolio, "frame"),
    id: "contact-invitation",
    heading: "Have an idea?\nLet's make it.",
    body: categories.join(" · ") || "Films · Ads · Graphics",
    cta: `${portfolio.settings.email.toUpperCase()} ↗`,
    ctaHref: `mailto:${portfolio.settings.email}`,
    image: "",
  }

  const next = {
    ...portfolio,
    blocks: [hero, ...projectBlocks, about, contact],
  }
  return { ...next, seo: defaultSeo(next) }
}

function readSavedState(): FrameOnboardingState {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw) as Partial<FrameOnboardingState>
    return {
      ...INITIAL_STATE,
      ...parsed,
      step: parsed.step === 2 ? 2 : 1,
      projects: parsed.projects?.length
        ? parsed.projects
        : INITIAL_STATE.projects,
    }
  } catch {
    return INITIAL_STATE
  }
}

function ScaledFramePreview({ portfolio }: { portfolio: StoredPortfolio }) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [geometry, setGeometry] = React.useState({ scale: 1, height: 0 })

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return

    let frame = 0
    function measure() {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const scale = viewport!.clientWidth / 1120
        const height = Math.ceil(content!.scrollHeight * scale)
        setGeometry((current) =>
          current.scale === scale && current.height === height
            ? current
            : { scale, height }
        )
      })
    }

    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(content)
    measure()

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [portfolio])

  return (
    <div
      ref={viewportRef}
      className="relative w-full overflow-hidden"
      style={{ height: geometry.height || undefined }}
    >
      <div
        ref={contentRef}
        className="absolute top-0 left-0 w-[1120px] origin-top-left"
        style={{
          transform: `scale(${geometry.scale})`,
          visibility: geometry.height ? "visible" : "hidden",
        }}
      >
        <FolioCanvas portfolio={portfolio} template="frame" />
      </div>
    </div>
  )
}

export function FrameOnboarding() {
  const router = useRouter()
  const [state, setState] = React.useState<FrameOnboardingState>(INITIAL_STATE)
  const [mounted, setMounted] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [imageError, setImageError] = React.useState("")

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setState(readSavedState())
      setMounted(true)
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state))
  }, [mounted, state])

  const preview = React.useMemo(() => buildPortfolio(state, "preview"), [state])

  function patch(patchValue: Partial<FrameOnboardingState>) {
    setState((current) => ({ ...current, ...patchValue }))
  }

  function patchProject(id: string, patchValue: Partial<ProjectInput>) {
    patch({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...patchValue } : project
      ),
    })
  }

  function validateIdentity() {
    const next: Record<string, string> = {}
    if (!state.brand.trim())
      next.brand = "Enter the name shown on your portfolio."
    if (!state.heroPrimary.trim()) next.heroPrimary = "Add the main headline."
    if (!state.intro.trim()) next.intro = "Add a short introduction."
    if (!state.email.trim()) next.email = "Add the email visitors should use."
    if (state.email && !/^\S+@\S+\.\S+$/.test(state.email)) {
      next.email = "Enter a valid email address."
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function continueToProjects() {
    if (!validateIdentity()) return
    patch({ step: 2 })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function createPortfolio() {
    const next: Record<string, string> = {}
    state.projects.forEach((project, index) => {
      if (!project.title.trim()) {
        next[`project-${project.id}`] = `Name project ${index + 1}.`
      }
    })
    setErrors(next)
    if (Object.keys(next).length) return

    const slug = uniquePortfolioSlug(state.brand)
    const portfolio = buildPortfolio(state, slug)
    saveDraft(slug, portfolio)
    window.localStorage.removeItem(ONBOARDING_KEY)
    router.push(`/edit/${slug}?welcome=1`)
  }

  async function uploadProjectMedia(id: string, file?: File) {
    if (!file) return
    setImageError("")
    const mediaKind = file.type.startsWith("video/") ? "video" : "image"
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setImageError("Choose an image or video file.")
      return
    }
    const maxBytes = mediaKind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (file.size > maxBytes) {
      setImageError(
        mediaKind === "video"
          ? "Choose a video smaller than 3 MB, or paste a direct video URL."
          : "Choose an image smaller than 1.5 MB."
      )
      return
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error("Media could not be read"))
      reader.readAsDataURL(file)
    }).catch(() => "")
    if (!dataUrl) {
      setImageError("That file could not be read. Try another one.")
      return
    }
    patchProject(id, { image: dataUrl, mediaKind })
  }

  return (
    <div className="afm-dashboard fixed inset-0 grid overflow-hidden bg-background lg:grid-cols-[minmax(24rem,32rem)_1fr]">
      <section className="flex min-h-0 flex-col border-r border-border bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
          <a
            href="/dashboard"
            className="flex items-center gap-2"
            aria-label="AFM dashboard"
          >
            <span className="flex size-5.5 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="size-2 rounded-[2px] bg-current" aria-hidden />
            </span>
            <span className="text-xl font-semibold tracking-tight">AFM</span>
          </a>
          <span className="text-xs text-muted-foreground tabular-nums">
            Step {state.step} of 2
          </span>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-md">
            {state.step === 1 ? (
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-[-0.03em] text-balance">
                    Make the page yours
                  </h1>
                  <p className="max-w-md text-sm leading-6 text-muted-foreground">
                    These words appear directly in the Frame portfolio preview.
                  </p>
                </div>

                <FieldGroup className="gap-5">
                  <Field>
                    <FieldLabel htmlFor="frame-brand">
                      Portfolio or studio name
                    </FieldLabel>
                    <Input
                      id="frame-brand"
                      value={state.brand}
                      placeholder="FRAME"
                      autoComplete="organization"
                      aria-invalid={Boolean(errors.brand)}
                      aria-describedby={
                        errors.brand ? "frame-brand-error" : undefined
                      }
                      onChange={(event) => patch({ brand: event.target.value })}
                    />
                    {errors.brand ? (
                      <p
                        id="frame-brand-error"
                        className="text-xs text-destructive"
                      >
                        {errors.brand}
                      </p>
                    ) : null}
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="frame-headline-primary">
                        Main headline
                      </FieldLabel>
                      <Input
                        id="frame-headline-primary"
                        value={state.heroPrimary}
                        placeholder="AI made visual."
                        aria-invalid={Boolean(errors.heroPrimary)}
                        onChange={(event) =>
                          patch({ heroPrimary: event.target.value })
                        }
                      />
                      {errors.heroPrimary ? (
                        <p className="text-xs text-destructive">
                          {errors.heroPrimary}
                        </p>
                      ) : null}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="frame-headline-secondary">
                        Secondary headline
                      </FieldLabel>
                      <Input
                        id="frame-headline-secondary"
                        value={state.heroSecondary}
                        onChange={(event) =>
                          patch({ heroSecondary: event.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="frame-intro">
                      Short introduction
                    </FieldLabel>
                    <Textarea
                      id="frame-intro"
                      value={state.intro}
                      className="min-h-24"
                      placeholder="A focused archive of films, campaigns and visual experiments."
                      aria-invalid={Boolean(errors.intro)}
                      onChange={(event) => patch({ intro: event.target.value })}
                    />
                    {errors.intro ? (
                      <p className="text-xs text-destructive">{errors.intro}</p>
                    ) : null}
                  </Field>
                  <div className="border-t border-border pt-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="frame-about-heading">
                          About heading
                        </FieldLabel>
                        <Textarea
                          id="frame-about-heading"
                          value={state.aboutHeading}
                          className="min-h-20"
                          onChange={(event) =>
                            patch({ aboutHeading: event.target.value })
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="frame-email">
                          Contact email
                        </FieldLabel>
                        <Input
                          id="frame-email"
                          type="email"
                          value={state.email}
                          placeholder="hello@example.com"
                          autoComplete="email"
                          aria-invalid={Boolean(errors.email)}
                          onChange={(event) =>
                            patch({ email: event.target.value })
                          }
                        />
                        {errors.email ? (
                          <p className="text-xs text-destructive">
                            {errors.email}
                          </p>
                        ) : null}
                      </Field>
                    </div>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="frame-about-body">
                      About description
                    </FieldLabel>
                    <Textarea
                      id="frame-about-body"
                      value={state.aboutBody}
                      className="min-h-24"
                      placeholder="Describe the work you make and what you want visitors to notice."
                      onChange={(event) =>
                        patch({ aboutBody: event.target.value })
                      }
                    />
                  </Field>
                </FieldGroup>

                <Button
                  type="button"
                  className="h-11 justify-between px-4 font-normal"
                  onClick={continueToProjects}
                >
                  Add your work
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-[-0.03em] text-balance">
                    Add selected work
                  </h1>
                  <p className="max-w-md text-sm leading-6 text-muted-foreground">
                    The first project becomes the large featured image. Reorder
                    later in the editor.
                  </p>
                </div>

                <div className="flex flex-col border-y border-border">
                  {state.projects.map((project, index) => (
                    <section
                      key={project.id}
                      className="border-b border-border py-6 last:border-b-0"
                    >
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <h2 className="text-sm font-medium">
                          {index === 0
                            ? "Featured project"
                            : `Project ${index + 1}`}
                        </h2>
                        {state.projects.length > 1 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-10"
                            aria-label={`Remove project ${index + 1}`}
                            onClick={() =>
                              patch({
                                projects: state.projects.filter(
                                  (item) => item.id !== project.id
                                ),
                              })
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                      <div className="grid gap-5">
                        <Field>
                          <FieldLabel htmlFor={`${project.id}-title`}>
                            Project title
                          </FieldLabel>
                          <Input
                            id={`${project.id}-title`}
                            value={project.title}
                            placeholder="After Tomorrow"
                            aria-invalid={Boolean(
                              errors[`project-${project.id}`]
                            )}
                            onChange={(event) =>
                              patchProject(project.id, {
                                title: event.target.value,
                              })
                            }
                          />
                          {errors[`project-${project.id}`] ? (
                            <p className="text-xs text-destructive">
                              {errors[`project-${project.id}`]}
                            </p>
                          ) : null}
                        </Field>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field>
                            <FieldLabel htmlFor={`${project.id}-category`}>
                              Category
                            </FieldLabel>
                            <select
                              id={`${project.id}-category`}
                              value={project.category}
                              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              onChange={(event) =>
                                patchProject(project.id, {
                                  category: event.target
                                    .value as ProjectCategory,
                                })
                              }
                            >
                              <option value="film">Film</option>
                              <option value="ad">Ad</option>
                              <option value="graphic">Graphics</option>
                            </select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor={`${project.id}-detail`}>
                              Short detail
                            </FieldLabel>
                            <Input
                              id={`${project.id}-detail`}
                              value={project.detail}
                              placeholder="AI short film · 04:18"
                              onChange={(event) =>
                                patchProject(project.id, {
                                  detail: event.target.value,
                                })
                              }
                            />
                          </Field>
                        </div>
                        <Field>
                          <FieldLabel htmlFor={`${project.id}-image-url`}>
                            Project media
                          </FieldLabel>
                          {project.image ? (
                            <div className="relative overflow-hidden rounded-xl bg-muted">
                              {project.mediaKind === "video" ? (
                                <video
                                  src={project.image}
                                  className="aspect-[2/1] w-full object-cover"
                                  controls
                                  playsInline
                                  preload="metadata"
                                />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={project.image}
                                  alt=""
                                  className="aspect-[2/1] w-full object-cover"
                                />
                              )}
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="absolute right-2 bottom-2 h-9 bg-background/95"
                                onClick={() =>
                                  patchProject(project.id, {
                                    image: "",
                                    mediaKind: "image",
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 text-center hover:bg-(--card-hover)">
                              <Clapperboard className="size-5 text-muted-foreground" />
                              <span className="mt-2 text-sm font-medium">
                                Upload image or video
                              </span>
                              <span className="mt-1 text-xs text-muted-foreground">
                                Images to 1.5 MB · videos to 3 MB
                              </span>
                              <input
                                type="file"
                                accept="image/*,video/*"
                                className="sr-only"
                                onChange={(event) =>
                                  void uploadProjectMedia(
                                    project.id,
                                    event.target.files?.[0]
                                  )
                                }
                              />
                            </label>
                          )}
                          <Input
                            id={`${project.id}-image-url`}
                            value={
                              project.image.startsWith("data:")
                                ? ""
                                : project.image
                            }
                            placeholder="Or paste a direct image or video URL"
                            aria-label={`Project ${index + 1} media URL`}
                            onChange={(event) =>
                              patchProject(project.id, {
                                image: event.target.value,
                                mediaKind: /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(
                                  event.target.value
                                )
                                  ? "video"
                                  : "image",
                              })
                            }
                          />
                          {imageError ? (
                            <p className="text-xs text-destructive">
                              {imageError}
                            </p>
                          ) : null}
                        </Field>
                      </div>
                    </section>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 gap-2 font-normal"
                  onClick={() =>
                    patch({
                      projects: [
                        ...state.projects,
                        {
                          id: `project-${Date.now()}`,
                          title: "",
                          category: "graphic",
                          detail: "",
                          image: "",
                          mediaKind: "image",
                        },
                      ],
                    })
                  }
                >
                  <Plus className="size-4" />
                  Add another project
                </Button>

                <div className="flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 gap-2 px-2 font-normal"
                    onClick={() => patch({ step: 1 })}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="h-11 gap-2 px-4 font-normal"
                    onClick={createPortfolio}
                  >
                    Create my portfolio
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <aside
        className="relative hidden min-h-0 overflow-hidden bg-[#d7ccb7] lg:block"
        aria-label="Live portfolio preview"
      >
        <div className="absolute inset-5 overflow-y-auto rounded-xl bg-white shadow-[0_18px_50px_rgba(17,17,17,0.16)]">
          <ScaledFramePreview portfolio={preview} />
        </div>
        <div
          className={cn(
            "pointer-events-none absolute right-8 bottom-8 rounded-lg bg-black px-3 py-2 text-xs text-white shadow-lg",
            !mounted && "opacity-0"
          )}
        >
          Live preview
        </div>
      </aside>
    </div>
  )
}
