"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export interface OnboardingStepMeta {
  id: string
  stepNumber: number
  href: string
  title: string
  subtitle: string
  badge: string
}

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  {
    id: "1",
    stepNumber: 1,
    href: "/onboarding/1",
    title: "Identity & Contact",
    subtitle:
      "Establish your studio name, hero headlines, and direct inquiry email.",
    badge: "Step 1 of 5",
  },
  {
    id: "2",
    stepNumber: 2,
    href: "/onboarding/2",
    title: "Creative Disciplines",
    subtitle:
      "Choose categories and filters that organize your studio archive.",
    badge: "Step 2 of 5",
  },
  {
    id: "3",
    stepNumber: 3,
    href: "/onboarding/3",
    title: "Project Showcase",
    subtitle:
      "Add your curated work, runtimes, media URLs, and project narratives.",
    badge: "Step 3 of 5",
  },
  {
    id: "4",
    stepNumber: 4,
    href: "/onboarding/4",
    title: "Statement & Ethos",
    subtitle:
      "Define your studio headline, manifesto bio, and client capabilities.",
    badge: "Step 4 of 5",
  },
  {
    id: "5",
    stepNumber: 5,
    href: "/onboarding/5",
    title: "Template & Launch",
    subtitle:
      "Review your Frame portfolio presentation and launch into the live editor.",
    badge: "Step 5 of 5",
  },
]

export type OnboardingStepId = "1" | "2" | "3" | "4" | "5"

interface OnboardingShellProps {
  currentStep: number
  title?: string
  subtitle?: string
  children: React.ReactNode
  previewNode?: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  isNextDisabled?: boolean
  isSubmitting?: boolean
  showNav?: boolean
}

export function OnboardingShell({
  currentStep,
  title,
  subtitle,
  children,
  previewNode,
  onBack,
  onNext,
  nextLabel,
  isNextDisabled = false,
  isSubmitting = false,
  showNav = true,
}: OnboardingShellProps) {
  const currentMeta =
    ONBOARDING_STEPS[currentStep - 1] ?? ONBOARDING_STEPS[0]
  const displayTitle = title || currentMeta.title
  const displaySubtitle = subtitle || currentMeta.subtitle
  const progressPct = Math.round((currentStep / ONBOARDING_STEPS.length) * 100)

  return (
    <div className="afm-dashboard fixed inset-0 grid overflow-hidden bg-background lg:grid-cols-[minmax(28rem,36rem)_1fr]">
      {/* Left Form Column */}
      <section className="flex min-h-0 flex-col border-r border-border bg-background">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
              aria-label="AFM dashboard"
            >
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
                <span className="size-2 rounded-[2px] bg-current" aria-hidden />
              </span>
              <span className="text-xl font-semibold tracking-tight">AFM</span>
            </Link>
            <span className="rounded-md bg-secondary px-2 py-1 text-xxs font-medium text-muted-foreground uppercase tracking-wider">
              Studio Builder
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Step Progress Rail */}
        <div className="relative h-1 w-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step Tabs Indicator */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/30 px-5 py-2.5 md:px-8 overflow-x-auto no-scrollbar">
          {ONBOARDING_STEPS.map((step) => {
            const isCompleted = step.stepNumber < currentStep
            const isCurrent = step.stepNumber === currentStep

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  isCurrent && "text-foreground font-semibold",
                  isCompleted && "text-muted-foreground",
                  !isCurrent && !isCompleted && "text-muted-foreground/40"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px]",
                    isCurrent && "bg-primary text-primary-foreground font-bold",
                    isCompleted && "bg-primary/20 text-foreground",
                    !isCurrent && !isCompleted && "bg-muted text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? <Check className="size-3" /> : step.stepNumber}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            )
          })}
        </div>

        {/* Form Body Scroll Area */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-8 space-y-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-xs font-medium"
              >
                {currentMeta.badge}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground text-balance">
                {displayTitle}
              </h1>
              {displaySubtitle ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {displaySubtitle}
                </p>
              ) : null}
            </div>

            <div className="space-y-6">{children}</div>
          </div>
        </div>

        {/* Bottom Nav Bar */}
        {showNav ? (
          <footer className="shrink-0 border-t border-border bg-background/80 px-5 py-4 backdrop-blur-md md:px-8">
            <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 gap-2 px-4 font-normal"
                  onClick={onBack}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="button"
                className={cn(
                  "h-11 gap-2 px-6 font-medium shadow-xs",
                  currentStep === 5 &&
                    "bg-[#dfff45] text-black hover:bg-[#c9e63e] font-semibold"
                )}
                onClick={onNext}
                disabled={isNextDisabled || isSubmitting}
              >
                {currentStep === 5 ? (
                  <>
                    <Sparkles className="size-4" />
                    {nextLabel || "Launch Studio Portfolio"}
                  </>
                ) : (
                  <>
                    {nextLabel || "Continue"}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </footer>
        ) : null}
      </section>

      {/* Right Live Preview Column */}
      <aside
        className="relative hidden min-h-0 overflow-hidden bg-[#e5dfd3] dark:bg-[#121212] lg:block"
        aria-label="Live portfolio preview"
      >
        <div className="absolute inset-6 overflow-y-auto rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:bg-[#0a0a0a] dark:border dark:border-neutral-800">
          {previewNode}
        </div>
        <div className="pointer-events-none absolute right-8 bottom-8 flex items-center gap-2 rounded-lg bg-black/90 px-3.5 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-xs">
          <span className="size-2 animate-pulse rounded-full bg-[#dfff45]" />
          Live Frame Preview
        </div>
      </aside>
    </div>
  )
}

export function ObNav({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">{children}</div>
  )
}
