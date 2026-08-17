"use client"

import * as React from "react"
import {
  Bell,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Paintbrush,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { HeadshotField } from "@/components/media-list"
import { PortfolioChromePanel } from "@/components/portfolio-chrome-panel"
import { PortfolioFieldsPanel } from "@/components/portfolio-fields-panel"
import { PortfolioMediaPanel } from "@/components/portfolio-media-panel"
import { TemplatePicker } from "@/components/template-picker"
import { ThemeToggle } from "@/components/theme-toggle"
import { type TemplateId } from "@/lib/demo"
import { type StoredPortfolio } from "@/lib/portfolio-store"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

const nav = [
  { name: "Profile", icon: User },
  { name: "Portfolio", icon: Layers },
  { name: "Sign-in", icon: KeyRound },
  { name: "Public page", icon: Globe },
  { name: "Privacy", icon: Lock },
  { name: "Appearance", icon: Paintbrush },
  { name: "Notifications", icon: Bell },
] as const

type Section = (typeof nav)[number]["name"]

function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string
  hint: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium tracking-tight">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function ProfilePanel({
  draft,
  onSave,
}: {
  draft: StoredPortfolio
  onSave: (patch: Partial<StoredPortfolio>) => void
}) {
  const [name, setName] = React.useState(draft.name)
  const [email, setEmail] = React.useState(draft.settings.email)
  const [title, setTitle] = React.useState(draft.title)

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({
          name,
          title,
          settings: { ...draft.settings, email },
        })
        toast.success("Profile saved")
      }}
    >
      <HeadshotField
        value={draft.media.headshot}
        onChange={(headshot) =>
          onSave({ media: { ...draft.media, headshot } })
        }
      />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="settings-name">Name</FieldLabel>
          <Input
            id="settings-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-email">Email</FieldLabel>
          <Input
            id="settings-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="settings-title">Professional title</FieldLabel>
          <Input
            id="settings-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
      </FieldGroup>
      <Button type="submit" className="h-11 w-fit px-4 font-normal">
        Save profile
      </Button>
    </form>
  )
}

function PortfolioPanel({
  draft,
  onSave,
  onTemplateChange,
}: {
  draft: StoredPortfolio
  onSave: (patch: Partial<StoredPortfolio>) => void
  onTemplateChange: (id: TemplateId) => void
}) {
  return (
    <div className="flex flex-col">
      <PortfolioFieldsPanel draft={draft} onChange={onSave} />
      <PortfolioChromePanel draft={draft} onChange={onSave} />
      <TemplatePicker value={draft.template} onChange={onTemplateChange} />
      <PortfolioMediaPanel draft={draft} onChange={onSave} />
    </div>
  )
}

function SignInPanel() {
  const [github, setGithub] = React.useState(true)
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Password and OAuth are prototype-only. Changes here are not persisted.
      </p>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium tracking-tight">GitHub</p>
          <p className="text-xs text-muted-foreground">
            {github ? "Connected (demo)" : "Not connected"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-4 font-normal"
          onClick={() => setGithub((on) => !on)}
        >
          {github ? "Disconnect" : "Connect"}
        </Button>
      </div>
    </div>
  )
}

function PublicPagePanel({
  draft,
  onSave,
}: {
  draft: StoredPortfolio
  onSave: (patch: Partial<StoredPortfolio>) => void
}) {
  const [pageSlug, setPageSlug] = React.useState(draft.slug)
  const [live, setLive] = React.useState(draft.status === "live")
  const path = `/p/${pageSlug}`

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({ slug: pageSlug })
        toast.success(live ? "Page settings saved. Publish to update the live page." : "Page settings saved")
      }}
    >
      <Field>
        <FieldLabel htmlFor="settings-slug">Slug</FieldLabel>
        <Input
          id="settings-slug"
          name="slug"
          value={pageSlug}
          onChange={(event) => setPageSlug(event.target.value)}
        />
      </Field>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm tracking-tight">{path}</p>
          <p className="text-xs text-muted-foreground">Public URL</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 px-4 font-normal"
          onClick={() => {
            void navigator.clipboard.writeText(
              `${window.location.origin}${path}`,
            )
            toast.success("Link copied")
          }}
        >
          Copy
        </Button>
      </div>
      <ToggleRow
        label="Live"
        hint="Unpublished pages stay off the public URL"
        checked={live}
        onCheckedChange={setLive}
      />
      <Button type="submit" className="h-11 w-fit px-4 font-normal">
        Save page
      </Button>
    </form>
  )
}

function PrivacyPanel({
  draft,
  onSave,
}: {
  draft: StoredPortfolio
  onSave: (patch: Partial<StoredPortfolio>) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <ToggleRow
        label="Search engines"
        hint="Allow Google and others to index your page"
        checked={draft.seo.indexable}
        onCheckedChange={(indexable) =>
          onSave({ seo: { ...draft.seo, indexable } })
        }
      />
      <ToggleRow
        label="Show email on folio"
        hint={`Visitors can see ${draft.settings.email}`}
        checked={draft.settings.showEmail}
        onCheckedChange={(showEmail) =>
          onSave({ settings: { ...draft.settings, showEmail } })
        }
      />
    </div>
  )
}

function NotificationsPanel({
  draft,
  onSave,
}: {
  draft: StoredPortfolio
  onSave: (patch: Partial<StoredPortfolio>) => void
}) {
  return (
    <ToggleRow
      label="View emails"
      hint="Email me when the live page gets visitors"
      checked={draft.settings.notifyViews}
      onCheckedChange={(notifyViews) =>
        onSave({ settings: { ...draft.settings, notifyViews } })
      }
    />
  )
}

function SettingsBody({
  section,
  draft,
  onSave,
  onTemplateChange,
}: {
  section: Section
  draft: StoredPortfolio
  onSave: (patch: Partial<StoredPortfolio>) => void
  onTemplateChange: (id: TemplateId) => void
}) {
  if (section === "Profile") return <ProfilePanel draft={draft} onSave={onSave} />
  if (section === "Portfolio")
    return (
      <PortfolioPanel
        draft={draft}
        onSave={onSave}
        onTemplateChange={onTemplateChange}
      />
    )
  if (section === "Sign-in") return <SignInPanel />
  if (section === "Public page")
    return <PublicPagePanel draft={draft} onSave={onSave} />
  if (section === "Privacy")
    return <PrivacyPanel draft={draft} onSave={onSave} />
  if (section === "Notifications")
    return <NotificationsPanel draft={draft} onSave={onSave} />
  return (
    <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
      <div>
        <p className="text-sm font-medium tracking-tight">Theme</p>
        <p className="text-xs text-muted-foreground">
          Studio only. Does not change the public page.
        </p>
      </div>
      <ThemeToggle />
    </div>
  )
}

export function SettingsDialog({
  draft,
  onSave,
  onTemplateChange,
  trigger,
}: {
  draft: StoredPortfolio
  onSave: (patch: Partial<StoredPortfolio>) => void
  onTemplateChange: (id: TemplateId) => void
  trigger: React.ReactElement
}) {
  const [open, setOpen] = React.useState(false)
  const [section, setSection] = React.useState<Section>("Profile")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent
        showCloseButton
        className="afm-dashboard overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]"
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Account, public page, and studio preferences.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          isActive={item.name === section}
                          onClick={() => setSection(item.name)}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex w-full items-center gap-2 px-4">
                <select
                  className="h-11 w-full rounded-lg border bg-secondary px-3 text-sm md:hidden"
                  value={section}
                  onChange={(event) => setSection(event.target.value as Section)}
                >
                  {nav.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <Breadcrumb className="hidden md:block">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{section}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col overflow-y-auto p-4 pt-0">
              <SettingsBody
                section={section}
                draft={draft}
                onSave={(patch) => {
                  onSave(patch)
                }}
                onTemplateChange={onTemplateChange}
              />
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
