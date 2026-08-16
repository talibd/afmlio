import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

import "@/app/dashboard/dashboard.css"

const ART = "/auth-garden.png"

export function AuthSplit({
  children,
  variant = "form",
}: {
  children: ReactNode
  variant?: "form" | "onboard"
}) {
  const onboard = variant === "onboard"

  return (
    <div className="afm-dashboard no-scrollbar h-[100dvh] overflow-hidden md:bg-sidebar md:p-2">
      <div
        className={cn(
          "grid h-full overflow-hidden bg-background md:rounded-xl",
          onboard ? "md:grid-cols-2" : "lg:grid-cols-2"
        )}
      >
        <div className="flex min-h-0 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 md:h-16 md:px-6">
            <div className="flex items-center gap-2">
              <Link href="/login" className="flex items-center gap-2">
                <span className="flex size-5.5 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <span className="size-2 rounded-[2px] bg-current" aria-hidden />
                </span>
                <span className="text-xl font-semibold tracking-tight">AFM</span>
              </Link>
              <span className="rounded-md bg-(--sidebar-badge) px-2 py-1.5 text-xxs text-sidebar-foreground/70">
                Studio
              </span>
            </div>
            <ThemeToggle />
          </header>
          <div
            className={cn(
              "flex min-h-0 flex-1 px-4 pb-6 md:px-6",
              onboard ? "items-stretch justify-center" : "items-center justify-center"
            )}
          >
            <div
              className={cn(
                onboard
                  ? "flex h-full min-h-0 w-full max-w-xl flex-col"
                  : "w-full max-w-sm"
              )}
            >
              {children}
            </div>
          </div>
        </div>
        <div
          className={cn(
            "relative hidden bg-muted",
            onboard ? "md:block" : "lg:block"
          )}
        >
          <Image
            src={ART}
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </div>
  )
}
