import Link from "next/link"

import { cn } from "@/lib/utils"

export function Brand({
  href = "/",
  className,
}: {
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 font-medium", className)}
    >
      <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <span className="size-2.5 rounded-[2px] bg-current" aria-hidden />
      </span>
      AFM
    </Link>
  )
}
