import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { AuthSplit } from "@/components/auth-split"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = { title: "Sign in — AFM Portfolio" }

async function signIn() {
  "use server"
  redirect("/dashboard")
}

export default function LoginPage() {
  return (
    <AuthSplit>
      <LoginForm action={signIn} />
    </AuthSplit>
  )
}
