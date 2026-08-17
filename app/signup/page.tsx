import type { Metadata } from "next"

import { AuthSplit } from "@/components/auth-split"
import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = { title: "Create account — AFM Portfolio" }

export default function SignupPage() {
  return (
    <AuthSplit>
      <SignupForm />
    </AuthSplit>
  )
}
