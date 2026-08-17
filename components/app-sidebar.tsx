"use client"

import { type ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronsUpDown, Globe, LayoutGrid, LogOut, Plus } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { usePortfolioSummaries } from "@/hooks/use-portfolio-summaries"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navClass = "h-auto gap-2.5 rounded-lg px-3 py-2 text-smd tracking-tight text-(--sidebar-muted-foreground) opacity-80 aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground aria-[current=page]:opacity-100"

function DashboardLink() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const active = pathname === "/dashboard"
  return (
    <SidebarMenuButton isActive={active} className={cn("h-auto p-0", navClass)} render={<Link href="/dashboard" />} aria-current={active ? "page" : undefined} onClick={() => isMobile && setOpenMobile(false)}>
      <LayoutGrid />
      <span>Dashboard</span>
    </SidebarMenuButton>
  )
}

/** The AFM lockup plus a surface badge. Shared so the editor's sidebar header
 *  is the same object as the dashboard's, not a lookalike. */
export function SidebarBrand({ badge }: { badge: string }) {
  return (
    <SidebarHeader className="flex-row items-center justify-between gap-2 px-4 pt-6 pb-0">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="flex size-5.5 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="size-2 rounded-[2px] bg-current" aria-hidden />
        </span>
        <span className="text-xl font-semibold tracking-tight">AFM</span>
      </Link>
      <span className="text-xxs rounded-md bg-(--sidebar-badge) px-2 py-1.5 text-sidebar-foreground/70">{badge}</span>
    </SidebarHeader>
  )
}

/** New portfolio / Logout / account rows. Shared by dashboard and editor;
 *  the editor hides the dashboard-only "New portfolio" action. */
export function SidebarAccount({ children, newPortfolio = true }: { children?: ReactNode; newPortfolio?: boolean }) {
  const router = useRouter()
  const email = useAccountEmail()
  const initial = email ? email.slice(0, 2).toUpperCase() : "AF"

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined)
    router.replace("/login")
    router.refresh()
  }

  return (
    <SidebarMenu className="gap-1.5">
      {children}
      {newPortfolio ? <SidebarMenuItem><SidebarMenuButton className={navClass} render={<Link href="/onboarding/1" />}><Plus /><span>New portfolio</span></SidebarMenuButton></SidebarMenuItem> : null}
      <SidebarMenuItem><SidebarMenuButton className="text-smd h-auto gap-2.5 rounded-lg px-3 py-2 tracking-tight text-(--sidebar-muted-foreground) opacity-80 hover:bg-destructive/10 hover:text-destructive" onClick={() => void logout()}><LogOut className="-rotate-90" /><span>Logout</span></SidebarMenuButton></SidebarMenuItem>
      <SidebarMenuItem><div className="flex items-center gap-2.5 rounded-lg px-3 py-2"><Avatar><AvatarFallback>{initial}</AvatarFallback></Avatar><span className="min-w-0 flex-1 truncate text-sm font-medium">{email || "Your account"}</span></div></SidebarMenuItem>
    </SidebarMenu>
  )
}

export const sidebarNavClass = navClass

function useAccountEmail() {
  const [email, setEmail] = useState("")
  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((body: { user?: { email?: string } | null }) => setEmail(body.user?.email ?? ""))
      .catch(() => undefined)
    return () => controller.abort()
  }, [])
  return email
}

/**
 * One header for every signed-in surface. `crumb` names the surface and
 * `actions` replaces the portfolio switcher where a surface has its own
 * controls, so the editor inherits the dashboard's shape rather than
 * reinventing it.
 */
export function DashboardHeader({
  crumb = "Dashboard",
  studio,
  actions,
}: {
  crumb?: string
  studio?: string
  actions?: ReactNode
} = {}) {
  const [slug, setSlug] = useState("")
  const portfolios = usePortfolioSummaries()
  const selectedSlug = slug || portfolios[0]?.slug || ""
  const selected = portfolios.find((portfolio) => portfolio.slug === selectedSlug) ?? portfolios[0]

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 px-4 md:h-16 md:px-6">
      <div className="flex items-center gap-1">
        <SidebarTrigger className="size-9 md:hidden [&_svg]:size-5!" />
        <nav className="hidden items-center gap-1 text-base text-muted-foreground md:flex">
          <span>AFM</span><span className="text-border">|</span><span>{studio ?? selected?.name ?? "Your studio"}</span><span className="text-border">|</span><span className="font-medium text-foreground/80">{crumb}</span>
        </nav>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        {actions}
        {actions ? null : portfolios.length ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="secondary" className="h-10 max-w-56 justify-between gap-2 px-3 md:w-56 data-open:[&>svg]:rotate-180" />}>
              <span className="flex items-center gap-1.5 overflow-hidden"><Globe className="size-4" /><span className="truncate">{selected?.name}</span></span><ChevronsUpDown className="size-4 transition-transform" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="afm-dashboard w-56">
              <DropdownMenuRadioGroup value={selectedSlug} onValueChange={setSlug}>
                {portfolios.map((portfolio) => <DropdownMenuRadioItem key={portfolio.slug} value={portfolio.slug}>{portfolio.name}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : <Button variant="secondary" render={<Link href="/onboarding/1" />}><Plus className="size-4" />New portfolio</Button>}
        <ThemeToggle />
      </div>
    </header>
  )
}

export function AppSidebar() {
  return (
    <Sidebar className="h-full border-none" collapsible="offcanvas">
      <SidebarBrand badge="Studio" />
      <SidebarContent className="mt-8 gap-8 px-4">
        <SidebarGroup className="p-0"><SidebarGroupLabel className="text-xsm mb-2 h-auto px-0 py-2 text-(--sidebar-muted)">General</SidebarGroupLabel><SidebarGroupContent><SidebarMenu><SidebarMenuItem><DashboardLink /></SidebarMenuItem></SidebarMenu></SidebarGroupContent></SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 pb-6">
        <SidebarAccount />
      </SidebarFooter>
    </Sidebar>
  )
}
