import type { ReactNode } from "react"

import { AuthSplit } from "@/components/auth-split"
import { Badge } from "@/components/ui/badge"

export const ONBOARDING_STEPS = [
  {
    id: "media",
    href: "/onboarding/media",
    label: "Project files",
    hint: "Images and video from the work",
  },
  {
    id: "1",
    href: "/onboarding/1",
    label: "Name and title",
    hint: "Sits at the top of your page",
  },
  {
    id: "2",
    href: "/onboarding/2",
    label: "Short intro",
    hint: "Two or three sentences",
  },
  {
    id: "3",
    href: "/onboarding/3",
    label: "What to show",
    hint: "Skills and focus for the page",
  },
  {
    id: "4",
    href: "/onboarding/4",
    label: "One project",
    hint: "Name it, then describe it",
  },
  {
    id: "5",
    href: "/onboarding/5",
    label: "Taste",
    hint: "A visual world for the work",
  },
] as const

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"]

export function OnboardingShell({
  title,
  subtitle,
  current,
  children,
  footer,
}: {
  title: string
  subtitle: string
  current: OnboardingStepId
  children: ReactNode
  footer?: ReactNode
}) {
  const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.id === current)
  const position = currentIndex + 1
  const total = ONBOARDING_STEPS.length

  return (
    <AuthSplit variant="onboard">
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-8 pb-4">
            <div className="flex flex-col gap-2">
              <Badge className="h-auto w-fit rounded-lg bg-info/10 py-1.5 font-normal text-info">
                {position} / {total}
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight text-balance">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="w-full">{children}</div>
          </div>
        </div>
        {footer ? (
          <div className="shrink-0 border-t pt-4 [&_[data-slot=button]]:h-11 [&_[data-slot=button]]:px-4 [&_[data-slot=button]]:font-normal">
            {footer}
          </div>
        ) : null}
      </div>
    </AuthSplit>
  )
}

export function ObNav({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-between gap-3">{children}</div>
}
