"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="afm-dashboard flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-5 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          This page could not be loaded
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Your work is still safe. Check your connection and try again.
        </p>
        <Button type="button" className="h-11 px-5 font-normal" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  )
}
