import type { Metadata } from "next"

import { AuthSplit } from "@/components/auth-split"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = { title: "Sign in — AFM Portfolio" }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return (
    <AuthSplit>
      <LoginForm nextPath={next} />
    </AuthSplit>
  )
}
