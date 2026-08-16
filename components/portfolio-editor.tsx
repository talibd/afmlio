"use client"

import * as React from "react"
import Link from "next/link"
import { LayoutDashboard, Settings } from "lucide-react"
import { toast } from "sonner"

import { BlockSidebar } from "@/components/block-sidebar"
import { FolioCanvas } from "@/components/folio-view"
import { PreviewDock, PREVIEW_WIDTH, type PreviewSize } from "@/components/preview-dock"
import { SettingsDialog } from "@/components/settings-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEditorHistory } from "@/hooks/use-editor-history"
import { isStaleLayout, reapplyTemplateChrome } from "@/lib/blocks"
import { coerceTemplate, type FolioBlock, type TemplateId } from "@/lib/demo"
import {
  getBaseDraft,
  getDraft,
  getLive,
  hasDraftChanges,
  hasLive,
  publish,
  saveDraft,
  type StoredPortfolio,
} from "@/lib/portfolio-store"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

function syncFieldsToBlocks(draft: StoredPortfolio): FolioBlock[] {
  const headshot = draft.media?.headshot
  return (draft.blocks ?? []).map((block) => {
    if (block.type === "hero") {
      return {
        ...block,
        heading: draft.title || block.heading,
        body: draft.bio || block.body,
        image: headshot || block.image,
      }
    }
    if (block.type === "about") {
      return {
        ...block,
        body: draft.bio || block.body,
        image: headshot || block.image,
      }
    }
    if (block.type === "featured" || block.type === "still") {
      return {
        ...block,
        heading: draft.project?.name || block.heading,
        body: draft.project?.copy || block.body,
      }
    }
    if (block.type === "skills" || block.type === "partners") {
      return { ...block, items: draft.skills?.length ? draft.skills : block.items }
    }
    if (block.type === "footer") {
      return {
        ...block,
        heading: draft.name || block.heading,
        body: draft.bio || block.body,
      }
    }
    return block
  })
}

function useDebouncedSave(slug: string, draft: StoredPortfolio, delay = 600) {
  const first = React.useRef(true)
  const [saveState, setSaveState] = React.useState<"saving" | "saved">("saved")
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaveState("saving")
    const id = window.setTimeout(() => {
      saveDraft(slug, draft)
      setSaveState("saved")
    }, delay)
    return () => window.clearTimeout(id)
  }, [slug, draft, delay])
  return saveState
}

export function PortfolioEditor({
  slug,
  templateHint,
}: {
  slug: string
  templateHint?: TemplateId
}) {
  const initial = React.useMemo(
    () => getBaseDraft(slug, templateHint),
    [slug, templateHint],
  )
  const { draft, setDraft, resetDraft, undo, redo, canUndo, canRedo } = useEditorHistory(initial)
  const [selectedId, setSelectedId] = React.useState(
    () => initial.blocks?.[0]?.id ?? "",
  )
  const [size, setSize] = React.useState<PreviewSize>("desktop")
  const savedAt = draft.updatedAt || null
  const [liveAt, setLiveAt] = React.useState<number | null>(null)
  const [mounted, setMounted] = React.useState(false)

  // Hydrate stored draft from localStorage after mount to ensure 100% SSR match
  React.useEffect(() => {
    setMounted(true)
    setLiveAt(getLive(slug)?.publishedAt ?? null)

    const stored = getDraft(slug)
    if (stored) {
      const template = templateHint
        ? coerceTemplate(templateHint)
        : (stored.template ? coerceTemplate(stored.template) : initial.template)
      const merged: StoredPortfolio = {
        ...initial,
        ...stored,
        template,
        blocks:
          stored.blocks?.length && !isStaleLayout(stored.blocks)
            ? stored.blocks
            : initial.blocks,
      }
      resetDraft(merged)
      if (merged.blocks?.[0]?.id) {
        setSelectedId((curr) => curr || merged.blocks![0].id)
      }
    }
  }, [slug, templateHint])

  const dirty = mounted ? hasDraftChanges(slug, draft) : false
  const isLive = mounted ? (draft.status === "live" && hasLive(slug)) : false

  const saveState = useDebouncedSave(slug, draft)

  React.useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (saveState !== "saving") return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [saveState])

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey
      if (!mod) return
      if (event.key === "z" && !event.shiftKey) {
        event.preventDefault()
        if (undo()) toast.message("Undone")
      }
      if (event.key === "z" && event.shiftKey) {
        event.preventDefault()
        if (redo()) toast.message("Redone")
      }
      if (event.key === "s") {
        event.preventDefault()
        saveDraft(slug, draft)
        toast.success("Draft saved")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [slug, draft, undo, redo])

  function patchDraft(patch: Partial<StoredPortfolio>) {
    setDraft((current) => {
      const next = { ...current, ...patch }
      if (
        patch.name ||
        patch.title ||
        patch.bio ||
        patch.school ||
        patch.project ||
        patch.skills ||
        patch.media
      ) {
        next.blocks = syncFieldsToBlocks(next)
      }
      return next
    })
  }

  function setBlocks(blocks: FolioBlock[]) {
    setDraft((current) => ({ ...current, blocks }))
  }

  function switchTemplate(next: TemplateId) {
    if (next === draft.template) return
    const keep = window.confirm(
      "Switch taste? The visual world updates; your copy stays.",
    )
    if (!keep) return
    setDraft((current) => ({
      ...current,
      template: next,
      blocks: reapplyTemplateChrome(current.blocks ?? [], current, next),
    }))
    toast.success(`Taste: ${next}`)
  }

  function handlePublish() {
    const live = publish(slug, { ...draft, status: "live" })
    setDraft((current) => ({ ...current, status: "live" }))
    setLiveAt(live.publishedAt)
    toast.success("Published. Your live page is updated.")
  }

  function selectBlock(id: string) {
    setSelectedId(id)
  }

  const liveBlocks = draft.blocks ?? []
  const inspectBlock =
    liveBlocks.find((block) => block.id === selectedId) ?? liveBlocks[0]
  const activeId = inspectBlock?.id ?? ""
  const publicUrl = mounted
    ? `${window.location.origin}/p/${draft.slug}?preview=1`
    : `/p/${draft.slug}?preview=1`

  return (
    <SidebarProvider
      className="afm-dashboard no-scrollbar h-svh overflow-hidden"
      style={{ "--sidebar-width": "17.25rem" } as React.CSSProperties}
    >
      <Sidebar className="h-full border-none" collapsible="offcanvas">
        <SidebarHeader className="flex-row items-center justify-between gap-2 px-4 pt-6 pb-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex size-5.5 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="size-2 rounded-[2px] bg-current" aria-hidden />
            </span>
            <span className="text-xl font-semibold tracking-tight">AFM</span>
          </Link>
          <span
            className={cn(
              "rounded-md px-2 py-1.5 text-xxs",
              dirty && saveState !== "saving"
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                : "bg-(--sidebar-badge) text-sidebar-foreground/70",
            )}
          >
            {saveState === "saving"
              ? "Saving…"
              : dirty
                ? "Unpublished"
                : isLive
                  ? "Live"
                  : "Draft saved"}
          </span>
        </SidebarHeader>
        <SidebarContent className="mt-6 min-h-0 gap-0 overflow-hidden px-4">
          <BlockSidebar
            draft={draft}
            selectedId={activeId}
            onSelect={selectBlock}
            onBlocks={setBlocks}
          />
        </SidebarContent>
        <SidebarFooter className="flex-row items-center justify-start gap-2 px-4 pb-6">
          <SettingsDialog
            slug={slug}
            draft={draft}
            onSave={patchDraft}
            onTemplateChange={switchTemplate}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 rounded-lg"
                aria-label="Settings"
                title="Settings"
              >
                <Settings className="size-4" />
              </Button>
            }
          />
          <ThemeToggle className="size-10 rounded-lg" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-lg"
            aria-label="Dashboard"
            title="Dashboard"
            render={<Link href="/dashboard" />}
          >
            <LayoutDashboard className="size-4" />
          </Button>
        </SidebarFooter>
      </Sidebar>
      <main className="min-h-0 flex-1 overflow-hidden md:bg-sidebar md:p-2">
        <div className="relative h-full overflow-hidden bg-background md:rounded-xl">
          <SidebarTrigger className="absolute top-3 left-3 z-10 size-9 md:hidden [&_svg]:size-5!" />
          <div className="h-full overflow-y-auto pb-24">
            <div className={PREVIEW_WIDTH[size]}>
              <FolioCanvas
                portfolio={draft}
                template={draft.template}
              />
            </div>
          </div>
          <PreviewDock
            size={size}
            onSize={setSize}
            blocks={liveBlocks}
            selectedId={activeId}
            onSelectElement={selectBlock}
            seoTitle={draft.seo.title}
            seoDescription={draft.seo.description}
            onSeoTitle={(title) =>
              patchDraft({ seo: { ...draft.seo, title } })
            }
            onSeoDescription={(description) =>
              patchDraft({ seo: { ...draft.seo, description } })
            }
            indexable={draft.seo.indexable}
            onIndexable={(indexable) =>
              patchDraft({ seo: { ...draft.seo, indexable } })
            }
            onPublish={handlePublish}
            onSaveDraft={() => saveDraft(slug, draft)}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            publicUrl={publicUrl}
            dirty={dirty}
            savedAt={savedAt}
            liveAt={liveAt}
          />
        </div>
      </main>
    </SidebarProvider>
  )
}
