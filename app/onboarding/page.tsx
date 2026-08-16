import type { Metadata } from "next"

import { FrameOnboarding } from "@/components/frame-onboarding"

import "@/app/dashboard/dashboard.css"

export const metadata: Metadata = { title: "Create your portfolio — AFM" }

export default function OnboardingPage() {
  return <FrameOnboarding />
}
