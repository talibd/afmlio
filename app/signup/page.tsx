import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { AuthSplit } from "@/components/auth-split"
import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = { title: "Create account — AFM Portfolio" }

async function signUp() {
  "use server"
  redirect("/onboarding")
}

export default function SignupPage() {
  return (
    <AuthSplit>
      <SignupForm action={signUp} />
    </AuthSplit>
  )
}
