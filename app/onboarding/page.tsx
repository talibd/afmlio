import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Create your studio portfolio — AFM",
}

export default function OnboardingPage() {
  redirect("/onboarding/1")
}
