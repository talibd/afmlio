import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="afm-dashboard flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-5 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          This portfolio may be unpublished, renamed, or no longer available.
        </p>
        <Button className="h-11 px-5 font-normal" render={<Link href="/dashboard" />}>
          Go to dashboard
        </Button>
      </div>
    </main>
  )
}
