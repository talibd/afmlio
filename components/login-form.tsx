"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({ className, nextPath }: { className?: string; nextPath?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    const data = new FormData(event.currentTarget)
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
    }).catch(() => null)
    if (!response?.ok) {
      const body = response ? await response.json().catch(() => null) as { error?: string | { message?: string } } | null : null
      const message = typeof body?.error === "string" ? body.error : body?.error?.message
      setError(message ?? "Login failed. Check your connection and try again.")
      setPending(false)
      return
    }
    const destination = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard"
    router.replace(destination)
    router.refresh()
  }

  return (
    <form className={cn("flex flex-col gap-8", className)} onSubmit={submit}>
      <FieldGroup>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-muted-foreground">Continue to your AFM portfolios.</p>
        </div>
        <Field>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input id="login-email" name="email" type="email" autoComplete="username" placeholder="you@example.com" required disabled={pending} />
        </Field>
        <Field>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input id="login-password" name="password" type="password" autoComplete="current-password" required disabled={pending} />
        </Field>
        {error ? <p role="alert" className="text-sm leading-6 text-destructive">{error}</p> : null}
        <Field>
          <Button type="submit" className="h-11 w-full font-normal" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "Logging in…" : "Login"}
          </Button>
          <FieldDescription>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
