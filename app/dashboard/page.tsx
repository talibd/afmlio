"use client"

import Link from "next/link"
import {
  Calendar,
  ExternalLink,
  FilePenLine,
  Globe,
  LayoutGrid,
  Link2,
  Plus,
  Share2,
} from "lucide-react"
import { toast } from "sonner"

import { usePortfolioSummaries } from "@/hooks/use-portfolio-summaries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const chip =
  "flex h-11 items-center justify-center gap-2 rounded-lg border bg-secondary px-3 text-muted-foreground max-md:text-sm md:justify-start md:px-4"

/** Copy / share the public /p/[slug] link. Drafts keep the buttons visible but
 *  disabled — the public URL only exists once the portfolio is published. */
function PortfolioLinkActions({ slug, name, live }: { slug: string; name: string; live: boolean }) {
  const publicUrl = () => `${window.location.origin}/p/${slug}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl())
      toast.success("Public link copied")
    } catch {
      toast.error("Could not copy the link")
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} — AFM portfolio`, url: publicUrl() })
      } catch (error) {
        // Closing the share sheet is not an error.
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          await copyLink()
        }
      }
      return
    }
    await copyLink()
  }

  const hint = live ? undefined : "Publish first to get a public link"
  return (
    <div className="flex shrink-0 items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-lg text-muted-foreground hover:text-foreground"
        aria-label={live ? `Copy public link to ${name}` : `Copy link (publish ${name} first)`}
        title={hint ?? "Copy public link"}
        disabled={!live}
        onClick={copyLink}
      >
        <Link2 className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-lg text-muted-foreground hover:text-foreground"
        aria-label={live ? `Share ${name}` : `Share (publish ${name} first)`}
        title={hint ?? "Share portfolio"}
        disabled={!live}
        onClick={shareLink}
      >
        <Share2 className="size-4" />
      </Button>
    </div>
  )
}

export default function DashboardPage() {
  const portfolios = usePortfolioSummaries()

  const liveCount = portfolios.filter(
    (portfolio) => portfolio.status === "live"
  ).length
  const ownerName = portfolios[0]?.name ?? "Your portfolio"

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-10 overflow-y-auto p-4 md:gap-11 md:p-8">
      <div className="flex flex-col md:gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage your portfolios for AFM</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-card px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="size-4" />
            Published
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {liveCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Public Frame portfolios
          </p>
        </div>
        <div className="rounded-xl bg-card px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FilePenLine className="size-4" />
            Drafts
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {Math.max(0, portfolios.length - liveCount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Saved privately in your workspace</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:justify-between">
        <div className="contents md:flex md:flex-wrap md:items-center md:gap-2">
          <div className={cn(chip, "font-medium text-foreground")}>
            <Globe className="size-4" />
            {ownerName}
          </div>
          <div className={chip}>
            <LayoutGrid className="size-4" />
            Student
          </div>
          <div className={chip}>
            <FilePenLine className="size-4" />
            {liveCount}/{portfolios.length} Live
          </div>
        </div>
        <Button
          className="h-11 gap-2 px-3 font-normal max-md:text-sm md:px-4"
          render={<Link href="/onboarding" />}
        >
          <Plus className="size-4" />
          New portfolio
        </Button>
      </div>

      <div className="border-t" />

      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <LayoutGrid className="size-4" />
              <h2 className="font-medium">Portfolios</h2>
              <Badge className="bg-info/10 text-info h-auto rounded-lg py-1.5 font-normal">
                {liveCount} / {portfolios.length} Live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground md:pl-7">
              Open a page to edit it here.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-medium">{portfolios.length} pages</h3>
            <Badge className="bg-info/10 text-info h-auto rounded-lg py-1.5 font-normal">
              Active
            </Badge>
          </div>
          <div className="flex flex-col gap-3">
            {portfolios.map((p) => {
              const Icon = p.status === "live" ? Globe : FilePenLine
              return (
                <div
                  key={p.slug}
                  className="flex items-center gap-1 rounded-xl bg-card pr-2 transition-colors hover:bg-(--card-hover) md:pr-3"
                >
                  <a
                    href={`/edit/${p.slug}`}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 md:gap-4"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-sidebar text-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1.5 overflow-hidden md:gap-2">
                      <p className="truncate text-sm tracking-tight">
                        {p.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground md:gap-x-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {p.title}
                        </span>
                        <span className="size-1 rounded-full bg-muted-foreground" />
                        <span>{p.status === "live" ? "Live" : "Draft"}</span>
                      </div>
                    </div>
                    <span className="ml-auto flex size-9 shrink-0 items-center justify-center text-muted-foreground max-md:hidden">
                      <ExternalLink className="size-4" />
                      <span className="sr-only">Edit</span>
                    </span>
                  </a>
                  <PortfolioLinkActions slug={p.slug} name={p.name} live={p.status === "live"} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
