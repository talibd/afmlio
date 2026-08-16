"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronsUpDown,
  Globe,
  LayoutGrid,
  LayoutTemplate,
  LogOut,
  Settings,
} from "lucide-react"

import { SettingsDialog } from "@/components/settings-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { reapplyTemplateChrome } from "@/lib/blocks"
import { PORTFOLIOS, type TemplateId } from "@/lib/demo"
import { usePortfolioSummaries } from "@/hooks/use-portfolio-summaries"
import { hydrateDraft, saveDraft } from "@/lib/portfolio-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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

const navClass =
  "h-auto gap-2.5 rounded-lg px-3 py-2 text-smd tracking-tight text-(--sidebar-muted-foreground) opacity-80 aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground aria-[current=page]:opacity-100"

const groups = [
  {
    label: "General",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/dashboard/templates", label: "Tastes", icon: LayoutTemplate },
    ],
  },
]

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: typeof LayoutGrid
}) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const active =
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <SidebarMenuButton
      isActive={active}
      className={cn("h-auto p-0", navClass)}
      render={<Link href={href} />}
      aria-current={active ? "page" : undefined}
      onClick={() => {
        if (isMobile) setOpenMobile(false)
      }}
    >
      <Icon />
      <span>{label}</span>
    </SidebarMenuButton>
  )
}

export function DashboardHeader() {
  const pathname = usePathname()
  const [slug, setSlug] = useState(PORTFOLIOS[0].slug)
  const portfolios = usePortfolioSummaries()
  const selected =
    portfolios.find((portfolio) => portfolio.slug === slug) ?? portfolios[0]
  const page = pathname.startsWith("/dashboard/templates")
    ? "Tastes"
    : "Dashboard"

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-2 px-4 md:h-16 md:px-6">
      <div className="flex items-center gap-1">
        <SidebarTrigger className="size-9 md:hidden [&_svg]:size-5!" />
        <nav className="hidden items-center gap-1 text-base text-muted-foreground md:flex">
          <span>AFM</span>
          <span className="text-border">|</span>
          <span>{selected?.name ?? "Portfolio"}</span>
          <span className="text-border">|</span>
          <span className="font-medium text-foreground/80">{page}</span>
        </nav>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="secondary"
                className="h-10 max-w-56 justify-between gap-2 px-3 md:w-56 data-open:[&>svg]:rotate-180"
              />
            }
          >
            <span className="flex items-center gap-1.5 overflow-hidden">
              <Globe className="size-4" />
              <span className="truncate">{selected?.name ?? "Portfolio"}</span>
            </span>
            <ChevronsUpDown className="size-4 transition-transform" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="afm-dashboard w-56">
            <DropdownMenuRadioGroup value={slug} onValueChange={setSlug}>
              {portfolios.map((p) => (
                <DropdownMenuRadioItem
                  key={p.slug}
                  value={p.slug}
                  className="font-normal text-muted-foreground data-checked:font-medium data-checked:text-foreground"
                >
                  {p.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  )
}

export function AppSidebar() {
  const [draft, setDraft] = useState(() => hydrateDraft(PORTFOLIOS[0].slug))

  function save(patch: Partial<typeof draft>) {
    const next = { ...draft, ...patch }
    setDraft(next)
    saveDraft(draft.slug, next)
  }

  function switchTemplate(next: TemplateId) {
    if (next === draft.template) return
    const keep = window.confirm(
      "Switch taste? The visual world updates; your copy stays."
    )
    if (!keep) return
    setDraft((current) => {
      const updated = {
        ...current,
        template: next,
        blocks: reapplyTemplateChrome(current.blocks ?? [], current, next),
      }
      saveDraft(current.slug, updated)
      return updated
    })
  }

  return (
    <Sidebar className="h-full border-none" collapsible="offcanvas">
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-4 pt-6 pb-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex size-5.5 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="size-2 rounded-[2px] bg-current" aria-hidden />
          </span>
          <span className="text-xl font-semibold tracking-tight">AFM</span>
        </Link>
        <span className="text-xxs rounded-md bg-(--sidebar-badge) px-2 py-1.5 text-sidebar-foreground/70">
          Studio
        </span>
      </SidebarHeader>
      <SidebarContent className="mt-8 gap-8 px-4">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            <SidebarGroupLabel className="text-xsm mb-2 h-auto px-0 py-2 text-(--sidebar-muted)">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <NavLink {...item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="px-4 pb-6">
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SettingsDialog
              slug={draft.slug}
              draft={draft}
              onSave={save}
              onTemplateChange={switchTemplate}
              trigger={
                <SidebarMenuButton className={navClass}>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              }
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-smd h-auto gap-2.5 rounded-lg px-3 py-2 tracking-tight text-(--sidebar-muted-foreground) opacity-80 hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
              render={<Link href="/login" />}
            >
              <LogOut className="-rotate-90" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton className="text-smd h-auto gap-2.5 rounded-lg px-3 py-2 data-open:bg-sidebar-accent" />
                }
              >
                <Avatar>
                  <AvatarFallback>TK</AvatarFallback>
                </Avatar>
                <span className="flex-1 font-medium tracking-tight">
                  Talib Khan
                </span>
                <ChevronsUpDown className="text-sidebar-foreground/50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="afm-dashboard w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2.5">
                    <Avatar>
                      <AvatarFallback>TK</AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <p className="text-sm font-medium text-foreground">
                        Talib Khan
                      </p>
                      <p>talib@afm.edu</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/login" />}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
