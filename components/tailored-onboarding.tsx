"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clapperboard,
  Film,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { FolioCanvas } from "@/components/folio-view"
import { OnboardingShell } from "@/components/onboarding-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_ONBOARDING_STATE,
  generateDraftFromOnboarding,
  loadOnboardingState,
  saveOnboardingState,
  type OnboardingProject,
  type OnboardingState,
} from "@/lib/onboarding"
import { type StoredPortfolio } from "@/lib/portfolio-store"
import { cn } from "@/lib/utils"

const SUGGESTED_DISCIPLINES = [
  "Films",
  "Commercials",
  "Motion",
  "3D & CGI",
  "Editorial",
  "Creative Direction",
  "Visual Development",
  "Brand Systems",
  "Sound & Score",
  "Interactive",
]

const SUGGESTED_SERVICES = [
  "Creative Direction",
  "3D Motion",
  "Brand Systems",
  "Film Production",
  "Art Direction",
  "VFX & CGI",
  "Design Engineering",
  "Concept Development",
]

const MAX_IMAGE_BYTES = 2_500_000

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

export function TailoredOnboarding({
  initialStep = 1,
}: {
  initialStep?: 1 | 2 | 3 | 4 | 5
}) {
  const router = useRouter()
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5>(initialStep)
  const [state, setState] = React.useState<OnboardingState>(
    DEFAULT_ONBOARDING_STATE
  )
  const [mounted, setMounted] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [customDiscipline, setCustomDiscipline] = React.useState("")
  const [customService, setCustomService] = React.useState("")
  const [isLaunching, setIsLaunching] = React.useState(false)

  // Hydrate state from localStorage on mount
  React.useEffect(() => {
    const loaded = loadOnboardingState()
    setState(loaded)
    setMounted(true)
  }, [])

  // Sync state to localStorage on every change once mounted
  React.useEffect(() => {
    if (!mounted) return
    saveOnboardingState(state)
  }, [mounted, state])

  // Sync step changes with URL route
  const navigateToStep = React.useCallback(
    (nextStep: 1 | 2 | 3 | 4 | 5) => {
      setStep(nextStep)
      router.push(`/onboarding/${nextStep}`)
    },
    [router]
  )

  const previewPortfolio = React.useMemo(() => {
    return generateDraftFromOnboarding(state, "preview")
  }, [state])

  function patch(updates: Partial<OnboardingState>) {
    setState((curr) => ({ ...curr, ...updates }))
  }

  function patchProject(id: string, updates: Partial<OnboardingProject>) {
    setState((curr) => ({
      ...curr,
      projects: curr.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }))
  }

  function addProject() {
    const newId = `project-${Date.now()}`
    const defaultCat =
      state.disciplines[0] ||
      DEFAULT_ONBOARDING_STATE.disciplines[0] ||
      "Films"
    const newProject: OnboardingProject = {
      id: newId,
      title: "",
      category: defaultCat,
      runtime: "02:00",
      imageUrl: "",
      client: "",
      description: "",
    }
    patch({ projects: [...state.projects, newProject] })
  }

  function removeProject(id: string) {
    if (state.projects.length <= 1) return
    patch({ projects: state.projects.filter((p) => p.id !== id) })
  }

  function toggleDiscipline(disc: string) {
    const exists = state.disciplines.includes(disc)
    if (exists) {
      if (state.disciplines.length <= 1) {
        toast.error("Keep at least one creative discipline.")
        return
      }
      patch({ disciplines: state.disciplines.filter((d) => d !== disc) })
    } else {
      patch({ disciplines: [...state.disciplines, disc] })
    }
  }

  function addCustomDiscipline() {
    const trimmed = customDiscipline.trim()
    if (!trimmed) return
    if (!state.disciplines.includes(trimmed)) {
      patch({ disciplines: [...state.disciplines, trimmed] })
    }
    setCustomDiscipline("")
  }

  function toggleService(serv: string) {
    const exists = state.services.includes(serv)
    if (exists) {
      if (state.services.length <= 1) {
        toast.error("Keep at least one service capability.")
        return
      }
      patch({ services: state.services.filter((s) => s !== serv) })
    } else {
      patch({ services: [...state.services, serv] })
    }
  }

  function addCustomService() {
    const trimmed = customService.trim()
    if (!trimmed) return
    if (!state.services.includes(trimmed)) {
      patch({ services: [...state.services, trimmed] })
    }
    setCustomService("")
  }

  async function handleMediaUpload(projectId: string, file?: File) {
    if (!file) return
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please choose a valid image or video file.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("File exceeds 2.5 MB. Please use a direct URL or smaller file.")
      return
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(file)
      })
      patchProject(projectId, { imageUrl: dataUrl })
      toast.success("Media attached successfully.")
    } catch {
      toast.error("Failed to process media file.")
    }
  }

  function validateStep(currentStep: number): boolean {
    const nextErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!state.studioName.trim()) {
        nextErrors.studioName = "Studio or signature name is required."
      }
      if (!state.heroLine1.trim()) {
        nextErrors.heroLine1 = "Hero Headline Line 1 is required."
      }
      if (!state.contactEmail.trim()) {
        nextErrors.contactEmail = "Contact email is required."
      } else if (!/^\S+@\S+\.\S+$/.test(state.contactEmail)) {
        nextErrors.contactEmail = "Please enter a valid email address."
      }
    }

    if (currentStep === 2) {
      if (!state.disciplines.length) {
        nextErrors.disciplines = "Select at least one creative discipline."
      }
    }

    if (currentStep === 3) {
      state.projects.forEach((proj, idx) => {
        if (!proj.title.trim()) {
          nextErrors[`project-${proj.id}-title`] = `Title is required for Project #${idx + 1}.`
        }
      })
    }

    if (currentStep === 4) {
      if (!state.statementHeadline.trim()) {
        nextErrors.statementHeadline = "Statement headline is required."
      }
      if (!state.statementBio.trim()) {
        nextErrors.statementBio = "Manifesto bio is required."
      }
      if (!state.services.length) {
        nextErrors.services = "Select at least one service capability."
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleNext() {
    if (!validateStep(step)) return

    if (step < 5) {
      navigateToStep((step + 1) as 1 | 2 | 3 | 4 | 5)
    } else {
      handleLaunch()
    }
  }

  function handleBack() {
    if (step > 1) {
      navigateToStep((step - 1) as 1 | 2 | 3 | 4 | 5)
    }
  }

  function handleLaunch() {
    setIsLaunching(true)
    try {
      const slug = "talib"
      generateDraftFromOnboarding(state, slug)
      toast.success("Studio portfolio initialized! Opening editor...")
      router.push(`/edit/${slug}`)
    } catch {
      toast.error("Failed to generate draft portfolio.")
      setIsLaunching(false)
    }
  }

  return (
    <OnboardingShell
      currentStep={step}
      onBack={handleBack}
      onNext={handleNext}
      isSubmitting={isLaunching}
      previewNode={<ScaledFramePreview portfolio={previewPortfolio} />}
    >
      {/* STEP 1: IDENTITY & CONTACT */}
      {step === 1 && (
        <FieldGroup className="gap-6">
          <Field>
            <FieldLabel htmlFor="studio-name">Studio or Signature Name</FieldLabel>
            <Input
              id="studio-name"
              value={state.studioName}
              placeholder="TALIB / FRAME"
              aria-invalid={Boolean(errors.studioName)}
              onChange={(e) => patch({ studioName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Displays as the signature logo and brand identity across your portfolio.
            </p>
            {errors.studioName ? (
              <p className="text-xs text-destructive">{errors.studioName}</p>
            ) : null}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="hero-line-1">Hero Headline (Line 1)</FieldLabel>
              <Input
                id="hero-line-1"
                value={state.heroLine1}
                placeholder="Direction & Visual Systems"
                aria-invalid={Boolean(errors.heroLine1)}
                onChange={(e) => patch({ heroLine1: e.target.value })}
              />
              {errors.heroLine1 ? (
                <p className="text-xs text-destructive">{errors.heroLine1}</p>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="hero-line-2">Hero Headline (Line 2)</FieldLabel>
              <Input
                id="hero-line-2"
                value={state.heroLine2}
                placeholder="Selected Works 2024–2026"
                onChange={(e) => patch({ heroLine2: e.target.value })}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="contact-email">Contact & Inquiry Email</FieldLabel>
            <Input
              id="contact-email"
              type="email"
              value={state.contactEmail}
              placeholder="contact@talib.design"
              aria-invalid={Boolean(errors.contactEmail)}
              onChange={(e) => patch({ contactEmail: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Direct email link wired into the top navigation and bottom contact CTA.
            </p>
            {errors.contactEmail ? (
              <p className="text-xs text-destructive">{errors.contactEmail}</p>
            ) : null}
          </Field>
        </FieldGroup>
      )}

      {/* STEP 2: CREATIVE DISCIPLINES / FILTERS */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground">
              Active Disciplines & Filter Categories
            </label>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              These categories dynamically generate the filter tabs on your Frame work grid.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {SUGGESTED_DISCIPLINES.map((discipline) => {
                const active = state.disciplines.includes(discipline)
                return (
                  <button
                    key={discipline}
                    type="button"
                    onClick={() => toggleDiscipline(discipline)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {active ? <Check className="size-3.5" /> : <Plus className="size-3.5 opacity-50" />}
                    {discipline}
                  </button>
                )
              })}

              {/* Display custom disciplines not in suggested */}
              {state.disciplines
                .filter((d) => !SUGGESTED_DISCIPLINES.includes(d))
                .map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => toggleDiscipline(custom)}
                    className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground shadow-xs"
                  >
                    <Check className="size-3.5" />
                    {custom}
                    <X className="size-3 opacity-70 ml-1" />
                  </button>
                ))}
            </div>
            {errors.disciplines ? (
              <p className="text-xs text-destructive mt-2">{errors.disciplines}</p>
            ) : null}
          </div>

          {/* Add Custom Discipline */}
          <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
            <label htmlFor="custom-discipline-input" className="text-xs font-medium text-foreground">
              Add Custom Discipline
            </label>
            <div className="flex gap-2">
              <Input
                id="custom-discipline-input"
                value={customDiscipline}
                placeholder="e.g. Generative AI, Spatial Audio..."
                className="h-10 text-xs"
                onChange={(e) => setCustomDiscipline(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCustomDiscipline()
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-10 px-4 font-normal"
                onClick={addCustomDiscipline}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PROJECT SHOWCASE */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Project #1 becomes the featured full-width hero banner.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-normal"
              onClick={addProject}
            >
              <Plus className="size-3.5" />
              Add Project
            </Button>
          </div>

          <div className="space-y-6">
            {state.projects.map((project, idx) => (
              <Card
                key={project.id}
                className="border-border bg-card/80 shadow-xs relative overflow-hidden"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-semibold",
                        idx === 0 && "bg-[#dfff45]/20 text-foreground border border-[#dfff45]/40"
                      )}
                    >
                      {idx === 0 ? "Featured Banner (01)" : `Project 0${idx + 1}`}
                    </Badge>
                    <CardTitle className="text-sm font-medium">
                      {project.title || "Untitled Project"}
                    </CardTitle>
                  </div>

                  {state.projects.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove Project ${idx + 1}`}
                      onClick={() => removeProject(project.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </CardHeader>

                <CardContent className="space-y-4 pt-1">
                  <Field>
                    <FieldLabel htmlFor={`proj-${project.id}-title`}>Project Title</FieldLabel>
                    <Input
                      id={`proj-${project.id}-title`}
                      value={project.title}
                      placeholder="e.g. Chronos: Temporal Architecture"
                      aria-invalid={Boolean(errors[`project-${project.id}-title`])}
                      onChange={(e) =>
                        patchProject(project.id, { title: e.target.value })
                      }
                    />
                    {errors[`project-${project.id}-title`] ? (
                      <p className="text-xs text-destructive">
                        {errors[`project-${project.id}-title`]}
                      </p>
                    ) : null}
                  </Field>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field>
                      <FieldLabel htmlFor={`proj-${project.id}-category`}>Category</FieldLabel>
                      <select
                        id={`proj-${project.id}-category`}
                        value={project.category}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onChange={(e) =>
                          patchProject(project.id, { category: e.target.value })
                        }
                      >
                        {state.disciplines.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`proj-${project.id}-runtime`}>Runtime / Format</FieldLabel>
                      <Input
                        id={`proj-${project.id}-runtime`}
                        value={project.runtime}
                        placeholder="03:42 or Stills"
                        className="h-9 text-xs"
                        onChange={(e) =>
                          patchProject(project.id, { runtime: e.target.value })
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`proj-${project.id}-client`}>Client (Optional)</FieldLabel>
                      <Input
                        id={`proj-${project.id}-client`}
                        value={project.client || ""}
                        placeholder="e.g. Aura Systems"
                        className="h-9 text-xs"
                        onChange={(e) =>
                          patchProject(project.id, { client: e.target.value })
                        }
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor={`proj-${project.id}-image`}>Media Image URL or File</FieldLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          id={`proj-${project.id}-image`}
                          value={
                            project.imageUrl.startsWith("data:")
                              ? "(Local media file attached)"
                              : project.imageUrl
                          }
                          placeholder="Paste image URL (https://...)"
                          className="h-9 text-xs flex-1"
                          onChange={(e) =>
                            patchProject(project.id, { imageUrl: e.target.value })
                          }
                        />
                        <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-secondary px-3 text-xs font-medium hover:bg-accent">
                          <Clapperboard className="size-3.5 text-muted-foreground" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="sr-only"
                            onChange={(e) =>
                              handleMediaUpload(project.id, e.target.files?.[0])
                            }
                          />
                        </label>
                      </div>

                      {project.imageUrl ? (
                        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg bg-muted border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.imageUrl}
                            alt={project.title || "Project Preview"}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2 h-7 px-2.5 text-[11px] bg-background/90 backdrop-blur-xs"
                            onClick={() => patchProject(project.id, { imageUrl: "" })}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor={`proj-${project.id}-desc`}>Description & Narrative</FieldLabel>
                    <Textarea
                      id={`proj-${project.id}-desc`}
                      value={project.description || ""}
                      placeholder="Brief note or concept synopsis for this work..."
                      className="min-h-16 text-xs"
                      onChange={(e) =>
                        patchProject(project.id, { description: e.target.value })
                      }
                    />
                  </Field>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-2 font-normal"
            onClick={addProject}
          >
            <Plus className="size-4" />
            Add Another Showcase Project
          </Button>
        </div>
      )}

      {/* STEP 4: STATEMENT & ETHOS */}
      {step === 4 && (
        <FieldGroup className="gap-6">
          <Field>
            <FieldLabel htmlFor="statement-headline">Statement Headline</FieldLabel>
            <Input
              id="statement-headline"
              value={state.statementHeadline}
              placeholder="Less noise. More work."
              aria-invalid={Boolean(errors.statementHeadline)}
              onChange={(e) => patch({ statementHeadline: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Large editorial heading featured prominently in the About & Ethos section.
            </p>
            {errors.statementHeadline ? (
              <p className="text-xs text-destructive">{errors.statementHeadline}</p>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="statement-bio">Manifesto & Studio Bio</FieldLabel>
            <Textarea
              id="statement-bio"
              value={state.statementBio}
              rows={4}
              placeholder="A focused visual archive for contemporary direction, CGI, and brand experiments..."
              aria-invalid={Boolean(errors.statementBio)}
              onChange={(e) => patch({ statementBio: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Articulates your studio vision, methodology, and creative perspective.
            </p>
            {errors.statementBio ? (
              <p className="text-xs text-destructive">{errors.statementBio}</p>
            ) : null}
          </Field>

          <div>
            <label className="text-sm font-medium text-foreground">
              Studio Services & Offerings
            </label>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Key capabilities highlighted in the footer and capabilities block.
            </p>

            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SERVICES.map((service) => {
                const active = state.services.includes(service)
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {active ? <Check className="size-3" /> : <Plus className="size-3 opacity-50" />}
                    {service}
                  </button>
                )
              })}

              {state.services
                .filter((s) => !SUGGESTED_SERVICES.includes(s))
                .map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => toggleService(custom)}
                    className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    <Check className="size-3" />
                    {custom}
                    <X className="size-3 opacity-70 ml-1" />
                  </button>
                ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={customService}
                placeholder="Add custom service..."
                className="h-9 text-xs"
                onChange={(e) => setCustomService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCustomService()
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 px-3 text-xs font-normal"
                onClick={addCustomService}
              >
                Add
              </Button>
            </div>
            {errors.services ? (
              <p className="text-xs text-destructive mt-2">{errors.services}</p>
            ) : null}
          </div>
        </FieldGroup>
      )}

      {/* STEP 5: TEMPLATE & LAUNCH */}
      {step === 5 && (
        <div className="space-y-6">
          {/* Template Feature Banner */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-[#dfff45] text-black font-bold text-xs">
                  F
                </span>
                <span className="font-serif text-xl tracking-tight">Frame Template</span>
              </div>
              <Badge className="bg-[#dfff45]/20 text-[#dfff45] border-[#dfff45]/30 text-xs">
                Active Taste
              </Badge>
            </div>

            <p className="text-xs leading-relaxed text-neutral-400">
              A high-impact editorial studio layout featuring classic Georgia typography, dynamic category filters, lightbox viewer, and neon accent highlights.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-500 block">Typography</span>
                <span className="text-neutral-200 font-medium">Georgia & Clean Sans</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Accent Highlight</span>
                <span className="text-[#dfff45] font-medium font-mono">#DFFF45</span>
              </div>
            </div>
          </div>

          {/* Studio Intake Summary */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Studio Configuration Summary
            </h3>

            <div className="divide-y divide-border text-xs space-y-2.5">
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Studio Name:</span>
                <span className="font-medium text-foreground">{state.studioName}</span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-muted-foreground">Hero Headline:</span>
                <span className="font-medium text-foreground text-right max-w-xs truncate">
                  {state.heroLine1} / {state.heroLine2}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-muted-foreground">Curated Projects:</span>
                <span className="font-medium text-foreground">
                  {state.projects.length} Works Ready
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-muted-foreground">Disciplines & Filters:</span>
                <span className="font-medium text-foreground text-right max-w-xs truncate">
                  {state.disciplines.join(" · ")}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-muted-foreground">Inquiry Contact:</span>
                <span className="font-medium text-foreground">{state.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Launch Action */}
          <div className="rounded-xl border border-[#dfff45]/30 bg-[#dfff45]/10 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#a6c40e]" />
              <h4 className="text-sm font-semibold text-foreground">
                Ready to publish and edit
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Clicking below generates your live portfolio draft, saves it to your studio workspace, and launches the inline form sidebar editor.
            </p>
          </div>
        </div>
      )}
    </OnboardingShell>
  )
}
