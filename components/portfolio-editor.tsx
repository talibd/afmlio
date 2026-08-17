"use client"

import * as React from "react"
import Link from "next/link"
import { Settings } from "lucide-react"
import { toast } from "sonner"

import { DashboardHeader, SidebarBrand } from "@/components/app-sidebar"
import { BlockSidebar } from "@/components/block-sidebar"
import { FolioCanvas } from "@/components/folio-view"
import { PreviewDock, PREVIEW_WIDTH, type PreviewSize } from "@/components/preview-dock"
import { SettingsDialog } from "@/components/settings-dialog"
import { useEditorHistory } from "@/hooks/use-editor-history"
import { isStaleLayout, reapplyTemplateChrome } from "@/lib/blocks"
import { coerceTemplate, type FolioBlock, type TemplateId } from "@/lib/demo"
import { getOwnedPortfolioBySlug, publishPortfolio, savePortfolioDraft } from "@/lib/portfolio-api-client"
import {
  getBaseDraft,
  type StoredPortfolio,
} from "@/lib/portfolio-store"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
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

function useDebouncedSave(portfolioId: string | null, draft: StoredPortfolio, onSaved: (draft: StoredPortfolio) => void, delay = 700) {
  const first = React.useRef(true)
  const [saveState, setSaveState] = React.useState<"saving" | "saved" | "error">("saved")
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!portfolioId) return
    const id = window.setTimeout(() => {
      setSaveState("saving")
      void savePortfolioDraft(portfolioId, draft)
        .then(() => { setSaveState("saved"); onSaved(draft) })
        .catch(() => setSaveState("error"))
    }, delay)
    return () => window.clearTimeout(id)
  }, [portfolioId, draft, delay, onSaved])
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
  const [savedAt, setSavedAt] = React.useState<number | null>(null)
  const [liveAt, setLiveAt] = React.useState<number | null>(null)
  const [portfolioId, setPortfolioId] = React.useState<string | null>(null)
  const [publishedHash, setPublishedHash] = React.useState<string | null>(null)
  const [isLive, setIsLive] = React.useState(false)
  const [loadError, setLoadError] = React.useState("")

  React.useEffect(() => {
    const controller = new AbortController()
    void getOwnedPortfolioBySlug(slug, controller.signal)
      .then((record) => {
        const stored = record.draftSnapshot as unknown as StoredPortfolio
        const template = templateHint
          ? coerceTemplate(templateHint)
          : stored.template ? coerceTemplate(stored.template) : initial.template
        const merged: StoredPortfolio = {
          ...initial,
          ...stored,
          slug: record.slug,
          name: record.name,
          status: record.status === "published" ? "live" : "draft",
          template,
          blocks: stored.blocks?.length && !isStaleLayout(stored.blocks) ? stored.blocks : initial.blocks,
          updatedAt: new Date(record.updatedAt).getTime(),
        }
        resetDraft(merged)
        setPortfolioId(record.id)
        setSavedAt(merged.updatedAt)
        setIsLive(record.status === "published")
        setLiveAt(record.publishedAt ? new Date(record.publishedAt).getTime() : null)
        /* Dirty-tracking compares serializations of the CLIENT draft, so the
           baseline must be produced from the same object. Server-side the two
           snapshots are directly comparable; when they match, today's merged
           draft IS the published state. A sentinel keeps "diverged" truthy so
           never-published and edited-since-publish stay distinguishable. */
        setPublishedHash(
          record.publishedSnapshot
            ? JSON.stringify(record.publishedSnapshot) === JSON.stringify(record.draftSnapshot)
              ? JSON.stringify(merged)
              : "__diverged__"
            : null
        )
        if (merged.blocks?.[0]?.id) setSelectedId(merged.blocks[0].id)
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setLoadError(error instanceof Error ? error.message : "Could not load this portfolio.")
      })
    return () => controller.abort()
  }, [slug, templateHint, initial, resetDraft])

  const dirty = portfolioId ? !publishedHash || JSON.stringify(draft) !== publishedHash : false
  const onSaved = React.useCallback(() => setSavedAt(Date.now()), [])
  const saveState = useDebouncedSave(portfolioId, draft, onSaved)

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
        if (!portfolioId) return
        void savePortfolioDraft(portfolioId, draft)
          .then(() => { setSavedAt(Date.now()); toast.success("Draft saved") })
          .catch((error) => toast.error(error instanceof Error ? error.message : "Could not save draft"))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [portfolioId, draft, undo, redo])

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

  async function handlePublish() {
    if (!portfolioId) return
    try {
      const saved = { ...draft, status: "live" as const, updatedAt: Date.now() }
      await savePortfolioDraft(portfolioId, saved)
      const live = await publishPortfolio(portfolioId)
      setDraft(saved)
      setIsLive(true)
      setSavedAt(saved.updatedAt)
      setPublishedHash(JSON.stringify(saved))
      setLiveAt(live.publishedAt ? new Date(live.publishedAt).getTime() : Date.now())
      toast.success("Published. Your live page is updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not publish your portfolio.")
    }
  }

  function selectBlock(id: string) {
    setSelectedId(id)
  }

  const liveBlocks = draft.blocks ?? []
  const inspectBlock =
    liveBlocks.find((block) => block.id === selectedId) ?? liveBlocks[0]
  const activeId = inspectBlock?.id ?? ""
  // Relative on purpose: it is only ever an href, and a window.location branch
  // here renders differently on the server than on the client (hydration error).
  const publicUrl = `/p/${draft.slug}?preview=1`

  if (loadError) {
    return <div className="afm-dashboard flex min-h-svh items-center justify-center bg-background p-6 text-center"><div className="max-w-md space-y-3"><h1 className="text-2xl font-semibold tracking-tight">Portfolio unavailable</h1><p className="text-sm leading-6 text-muted-foreground">{loadError}</p><Button render={<Link href="/dashboard" />}>Return to dashboard</Button></div></div>
  }

  return (
    <SidebarProvider
      className="afm-dashboard no-scrollbar h-svh overflow-hidden"
      style={{ "--sidebar-width": "17.25rem" } as React.CSSProperties}
    >
      <Sidebar className="h-full border-none" collapsible="offcanvas">
        <SidebarBrand badge="Editor" />
        <SidebarContent className="mt-6 min-h-0 overflow-hidden px-4">
          <BlockSidebar
            draft={draft}
            selectedId={activeId}
            onSelect={selectBlock}
            onBlocks={setBlocks}
          />
        </SidebarContent>
      </Sidebar>
      <main className="min-h-0 flex-1 overflow-hidden md:bg-sidebar md:p-2">
        <div className="relative flex h-full flex-col overflow-hidden bg-background md:rounded-xl">
          <DashboardHeader
            crumb="Editor"
            studio={draft.name}
            /* DashboardHeader already renders the ThemeToggle; actions only
               replaces the portfolio switcher slot. */
            actions={
              <>
                <span
                  aria-live="polite"
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xxs",
                  saveState === "error"
                    ? "bg-destructive/10 text-destructive"
                    : dirty && saveState !== "saving"
                      ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                      : "bg-(--sidebar-badge) text-sidebar-foreground/70",
                )}
              >
                {saveState === "error"
                  ? "Save failed"
                  : saveState === "saving"
                    ? "Saving…"
                    : dirty
                      ? "Unpublished"
                      : isLive
                        ? "Live"
                        : "Draft saved"}
                </span>
                <SettingsDialog
                  draft={draft}
                  onSave={patchDraft}
                  onTemplateChange={switchTemplate}
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-lg"
                      aria-label="Settings"
                      title="Settings"
                    >
                      <Settings className="size-4" />
                    </Button>
                  }
                />
              </>
            }
          />
          <div className="min-h-0 flex-1 overflow-y-auto pb-24">
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
            onSaveDraft={() => {
              if (!portfolioId) return
              void savePortfolioDraft(portfolioId, draft)
                .then(() => { setSavedAt(Date.now()); toast.success("Draft saved") })
                .catch((error) => toast.error(error instanceof Error ? error.message : "Could not save draft"))
            }}
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
