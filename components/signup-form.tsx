"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ className }: { className?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    const data = new FormData(event.currentTarget)
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
    }).catch(() => null)
    if (!response?.ok) {
      const body = response ? await response.json().catch(() => null) as { error?: string | { message?: string } } | null : null
      const message = typeof body?.error === "string" ? body.error : body?.error?.message
      setError(message ?? "Account creation failed. Check your connection and try again.")
      setPending(false)
      return
    }
    router.replace("/onboarding/1")
    router.refresh()
  }

  return (
    <form className={cn("flex flex-col gap-8", className)} onSubmit={submit}>
      <FieldGroup>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground">Create your first Frame portfolio in a few focused steps.</p>
        </div>
        <Field>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required disabled={pending} />
        </Field>
        <Field>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <Input id="signup-password" name="password" type="password" autoComplete="new-password" required minLength={8} disabled={pending} aria-describedby="signup-password-help" />
          <FieldDescription id="signup-password-help">Use at least 8 characters.</FieldDescription>
        </Field>
        {error ? <p role="alert" className="text-sm leading-6 text-destructive">{error}</p> : null}
        <Field>
          <Button type="submit" className="h-11 w-full font-normal" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "Creating account…" : "Create account"}
          </Button>
          <FieldDescription>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Login</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
