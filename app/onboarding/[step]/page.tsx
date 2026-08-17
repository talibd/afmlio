import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { FrameOnboarding } from "@/components/frame-onboarding"

import "@/app/dashboard/dashboard.css"

export const metadata: Metadata = {
  title: "Create your studio portfolio — AFM",
}

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>
}) {
  const { step } = await params
  const stepNumber = parseInt(step, 10)

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 4) {
    redirect("/onboarding/1")
  }

  return <FrameOnboarding initialStep={stepNumber as 1 | 2 | 3 | 4} />
}
