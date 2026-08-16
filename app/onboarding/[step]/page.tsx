import { redirect } from "next/navigation"

export default async function OnboardingStepPage({}: {
  params: Promise<{ step: string }>
}) {
  redirect("/onboarding")
}
