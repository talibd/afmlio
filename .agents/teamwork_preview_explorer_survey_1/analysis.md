# Requirement 1 Investigation Report: Form-Based Sidebar Editor

**Explorer**: Survey Explorer 1  
**Date**: 2026-08-16  
**Target Requirement**: R1 — Form-Based Sidebar Editor & Read-Only Live Preview Canvas  

---

## 1. Executive Summary

This report delivers a comprehensive architectural survey and technical plan for transforming the portfolio editor from a floating visual inspector (`DialKit` / `ElementInspector`) into a **simplified, form-based sidebar editor** with a **strictly read-only live preview canvas**.

### Core Findings
1. **State Architecture**: Portfolio state is managed via `useEditorHistory` (`hooks/use-editor-history.ts`), `PortfolioEditor` (`components/portfolio-editor.tsx`), and `lib/portfolio-store.ts`. State updates to `draft.blocks` immediately trigger synchronous React re-renders of the canvas, persisted via a debounced `saveDraft` to `localStorage`.
2. **Current Inspector Flow**: Canvas elements use `hitHelper` / `blockHitHelper` / `bindHit` (`taste-folio.tsx`, `folio-frame.tsx`) to intercept clicks and invoke `inspect` or `inspectElement` in `portfolio-editor.tsx`. This causes floating `ElementInspector` and `BlockLayoutInspector` components to render using the `dialkit` package.
3. **Clean Disablement Strategy**: Removing the inspector callbacks (`onSelectBlock`, `onSelectElement`, `onBlockKeySelect`) from `FolioCanvas` immediately neutralizes all click interception and outline styling on the canvas. Removing `<ElementInspector>` and `<BlockLayoutInspector>` from `PortfolioEditor` completely eliminates `DialKit`.
4. **Form-Based Sidebar Design**: `BlockSidebar` (`components/block-sidebar.tsx`) will be upgraded so that expanding any block row reveals a dedicated, structured form panel (`BlockForm`) containing direct input fields (`Input`, `Textarea`, image selector/uploader, list editors) tailored to that block's schema. Typing in any field updates `draft.blocks` in real-time, instantly updating the live preview canvas.

---

## 2. Editor Component Analysis

| Component / Module | File Location | Current Role & Mechanism | Required Modifications |
|---|---|---|---|
| `PortfolioEditor` | `components/portfolio-editor.tsx` | Main editor layout shell. Manages `draft`, `selectedId`, `expandedId`, `inspectKind`, `layoutOpen`, `selectOn`. Renders `BlockSidebar`, `FolioCanvas`, `ElementInspector`, `BlockLayoutInspector`, and `PreviewDock`. | - Remove `inspectKind` and `layoutOpen` state.<br>- Remove `<ElementInspector>` and `<BlockLayoutInspector>`.<br>- Pass `undefined` for inspection callbacks to `FolioCanvas`.<br>- Wire `BlockSidebar` direct block updates. |
| `BlockSidebar` | `components/block-sidebar.tsx` | Renders the left sidebar block list accordion. Currently only shows element buttons (e.g. "Heading", "Text", "Image", "Button") that open DialKit. | - Replace element buttons with rich inline form fields per block type (`BlockForm`).<br>- Support direct editing of headings, body copy, CTA labels, URLs, images, and items.<br>- Retain block management actions (reorder, duplicate, hide/show, reset, delete, add). |
| `FolioCanvas` / `TasteFolio` | `components/folio-view.tsx`<br>`components/taste-folio.tsx` | Renders dynamic portfolio templates (`frame`, `aperture`, `walk`, `flood`). Currently attaches `hitHelper` & `blockHitHelper` click listeners and outline rings to elements when editing callbacks exist. | - Pure read-only live preview: when `onSelectBlock` / `onSelectElement` are omitted, `hitHelper` returns `{}` with zero click handlers and no outline styles.<br>- Canvas re-renders instantly whenever `portfolio` prop changes. |
| `FolioFrame` / `FolioSections` | `components/folio-frame.tsx`<br>`components/folio-blocks.tsx`<br>`components/folio-sections.tsx` | Block renderers for layout-driven sections (`partners`, `features`, `why`, `reviews`, `faq`, `cta`, `footer`). | - Same as `TasteFolio`: omit `onSelectElement` to disable hit targets cleanly. |
| `ElementInspector` & `BlockLayoutInspector` | `components/element-inspector.tsx` | DialKit wrapper components rendering floating inspector panels (`<DialRoot />`, `useDialKit`). | - Entirely bypassed and unmounted in the new editor flow. Can be deprecated or safely deleted. |
| `PreviewDock` | `components/preview-dock.tsx` | Floating bottom toolbar with device viewport switcher (`desktop`, `tablet`, `mobile`), undo/redo, SEO dialog, Save, Preview link, and Publish. | - Remove the `selectOn` pointer button.<br>- Keep viewport switcher, Undo/Redo, SEO dialog, Save, Preview, and Publish. |
| `useEditorHistory` | `hooks/use-editor-history.ts` | State container with 50-step undo/redo stack (`past`, `future`, `draft`, `setDraft`, `undo`, `redo`). | - No changes needed; seamlessly supports form field edits. |
| `portfolio-store` | `lib/portfolio-store.ts` | Persistence layer for `afm:draft:${slug}` and `afm:live:${slug}` in `localStorage`. | - No changes needed; handles serialization and draft notifications. |

---

## 3. Block Data Structure & Content Property Mapping

### 3.1 `FolioBlock` Schema (`lib/demo.ts`)
```typescript
export type FolioBlock = {
  id: string
  type: BlockType
  heading: string
  body: string
  image: string
  imageAlt?: string
  items: string[]
  itemIcons?: string[]
  cta: string
  ctaHref?: string
  cta2?: string
  cta2Href?: string
  hidden: boolean
  layout: BlockLayout
  headingStyle: ElementStyle
  bodyStyle: ElementStyle
  buttonStyle: ElementStyle
}
```

### 3.2 Block Types and Content Fields

| Block Type (`BlockType`) | Content Fields | Primary Canvas Render Target | Form Input Controls |
|---|---|---|---|
| `hero` | `heading`<br>`body`<br>`cta`<br>`ctaHref`<br>`cta2`<br>`cta2Href`<br>`image`<br>`imageAlt` | Main hero title, subtitle/bio, primary CTA button, secondary CTA button, hero image/still. | - `heading`: Single-line text `Input`<br>- `body`: Multi-line `Textarea`<br>- `cta` & `ctaHref`: Text `Input` (Label & Link)<br>- `cta2` & `cta2Href`: Text `Input` (Label & Link)<br>- `image`: Text `Input` (URL) + file picker/upload |
| `about` | `heading`<br>`body`<br>`image`<br>`cta`<br>`ctaHref` | About section headline, full narrative bio/statement, portrait image, action link. | - `heading`: Text `Input`<br>- `body`: Multi-line `Textarea` (4-5 rows)<br>- `image`: Text `Input` (URL) + upload<br>- `cta` & `ctaHref`: Text `Input` |
| `still` / `featured` | `heading`<br>`body`<br>`image`<br>`imageAlt`<br>`cta`<br>`ctaHref` | Project title, descriptive copy, still artwork, link button. | - `heading`: Text `Input` (Project Name)<br>- `body`: Multi-line `Textarea` (Project Details)<br>- `image`: Text `Input` (URL) + upload<br>- `cta` & `ctaHref`: Text `Input` |
| `skills` / `partners` | `heading`<br>`body`<br>`items` | Section title, introductory text, chip/list items of skills or partners. | - `heading`: Text `Input`<br>- `body`: Text `Input` (optional subtitle)<br>- `items`: Comma-separated or tag list editor |
| `features` / `why` | `heading`<br>`body`<br>`items` | Section title, subtitle, grid cards with `title \| description`. | - `heading`: Text `Input`<br>- `body`: Text `Input` / `Textarea`<br>- `items`: Multi-item rows with Title & Description inputs |
| `reviews` | `heading`<br>`body`<br>`items` | Section title, subtitle, testimonials with `quote \| author \| role`. | - `heading`: Text `Input`<br>- `body`: Text `Input`<br>- `items`: Multi-item rows with Quote, Author, Role |
| `faq` | `heading`<br>`body`<br>`items` | Section title, subtitle, Q&A accordion cards with `question \| answer`. | - `heading`: Text `Input`<br>- `body`: Text `Input`<br>- `items`: Multi-item rows with Question & Answer |
| `cta` / `contact` | `heading`<br>`body`<br>`cta`<br>`ctaHref` | Call to action headline, contact copy, action button / mailto. | - `heading`: Text `Input`<br>- `body`: Multi-line `Textarea`<br>- `cta` & `ctaHref`: Text `Input` (e.g. Email/Link) |
| `footer` | `heading`<br>`body` | Footer brand/copyright, tagline. | - `heading`: Text `Input`<br>- `body`: Text `Input` |

---

## 4. Canvas Click/Inspector Mechanism & Clean Disablement

### 4.1 How Canvas Clicks Currently Trigger the Inspector
1. **Hit Target Binding in `components/taste-folio.tsx`**:
   ```typescript
   function hitHelper(blockId: string, kind: ElementKind, selectedId?, selectedKind?, onSelectElement?) {
     if (!onSelectElement) return {}
     return {
       onClick: (e: React.MouseEvent) => {
         e.preventDefault(); e.stopPropagation()
         onSelectElement(blockId, kind)
       },
       className: cn("cursor-pointer ...", isSelected && "outline-2 outline-primary ...")
     }
   }
   ```
2. **Editor Dispatch in `components/portfolio-editor.tsx`**:
   ```typescript
   function inspectElement(id: string, kind: ElementKind) {
     setSelectedId(id)
     setExpandedId(id)
     setInspectKind(kind)    // Triggers ElementInspector
     setLayoutOpen(false)
   }
   function inspect(id: string) {
     setSelectedId(id)
     setExpandedId(id)
     setInspectKind(null)
     setLayoutOpen(true)     // Triggers BlockLayoutInspector
   }
   ```
3. **DialKit Popup in `components/element-inspector.tsx`**:
   - `useDialKit` and `<DialRoot />` mount a floating modal in the top-right corner of the screen.

### 4.2 Disablement & Read-Only Live Preview Strategy
To cleanly make the canvas a **read-only live preview**:
1. In `PortfolioEditor`, do not pass `onSelectBlock`, `onSelectElement`, or `onBlockKeySelect` to `FolioCanvas`.
2. When these callback props are `undefined`, `hitHelper`, `blockHitHelper`, and `bindHit` return empty objects `{}`.
3. As a result:
   - Elements have no `onClick` event listeners.
   - Elements have no hover outline rings (`outline-primary/60`) or active selection rings (`ring-2 ring-primary`).
   - The cursor remains normal (not `cursor-pointer`).
4. Completely remove `<ElementInspector>` and `<BlockLayoutInspector>` from `portfolio-editor.tsx`.
5. Remove the `selectOn` toggle button in `PreviewDock` (keeping only device size switches, undo/redo, SEO, save, preview, and publish).

---

## 5. Form-Based Sidebar Implementation Specification

### 5.1 `BlockSidebar` Layout & Component Structure
```
SidebarContent (BlockSidebar)
 ├── Header ("Blocks" title + "+ Add Block" dropdown)
 └── Accordion List of Blocks
      └── For each FolioBlock:
           ├── Accordion Header Row
           │    ├── Chevron (Expand/Collapse)
           │    ├── Block Name / Label (Click toggles expand)
           │    └── Quick Action Icons (on hover/focus):
           │         ├── Eye / EyeOff (Toggle visibility)
           │         ├── ChevronUp (Move up)
           │         ├── ChevronDown (Move down)
           │         └── More Menu (Duplicate, Reset, Delete)
           └── Accordion Body (When expanded)
                └── <BlockForm block={block} onChange={(patch) => updateBlock(block.id, patch)} />
```

### 5.2 Structured Form Fields Implementation (`BlockForm`)

```tsx
function BlockForm({
  block,
  onChange,
}: {
  block: FolioBlock
  onChange: (patch: Partial<FolioBlock>) => void
}) {
  return (
    <div className="flex flex-col gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
      {/* 1. Heading Field (Supported by all blocks) */}
      <Field>
        <FieldLabel className="text-xs text-muted-foreground">Heading</FieldLabel>
        <Input
          value={block.heading}
          placeholder="Heading text..."
          className="h-8 text-xs"
          onChange={(e) => onChange({ heading: e.target.value })}
        />
      </Field>

      {/* 2. Body / Narrative Field */}
      {block.type !== "skills" && block.type !== "partners" && (
        <Field>
          <FieldLabel className="text-xs text-muted-foreground">
            {block.type === "hero" ? "Intro / Bio" : "Description"}
          </FieldLabel>
          <Textarea
            value={block.body}
            rows={block.type === "about" ? 4 : 2}
            placeholder="Copy / text..."
            className="text-xs resize-none"
            onChange={(e) => onChange({ body: e.target.value })}
          />
        </Field>
      )}

      {/* 3. Image URL & Uploader */}
      {(block.type === "hero" || block.type === "about" || block.type === "still" || block.type === "featured") && (
        <Field>
          <FieldLabel className="text-xs text-muted-foreground">Image URL</FieldLabel>
          <div className="flex gap-1.5">
            <Input
              value={block.image}
              placeholder="https://..."
              className="h-8 text-xs flex-1"
              onChange={(e) => onChange({ image: e.target.value })}
            />
            <label className="flex h-8 px-2.5 items-center justify-center rounded-md border bg-background text-xs cursor-pointer hover:bg-secondary">
              Upload
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const dataUrl = await persistImageFile(file)
                    if (dataUrl) onChange({ image: dataUrl })
                  }
                }}
              />
            </label>
          </div>
        </Field>
      )}

      {/* 4. Action Buttons (CTA & CTA Link) */}
      {(block.type === "hero" || block.type === "about" || block.type === "cta" || block.type === "contact" || block.type === "featured") && (
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel className="text-xs text-muted-foreground">Button Text</FieldLabel>
            <Input
              value={block.cta ?? ""}
              placeholder="e.g. Say hi"
              className="h-8 text-xs"
              onChange={(e) => onChange({ cta: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel className="text-xs text-muted-foreground">Button Link</FieldLabel>
            <Input
              value={block.ctaHref ?? ""}
              placeholder="#cta or URL"
              className="h-8 text-xs"
              onChange={(e) => onChange({ ctaHref: e.target.value })}
            />
          </Field>
        </div>
      )}

      {/* 5. List / Skills / Partners Items */}
      {(block.type === "skills" || block.type === "partners") && (
        <Field>
          <FieldLabel className="text-xs text-muted-foreground">Items (Comma-separated)</FieldLabel>
          <Input
            value={block.items?.join(", ") ?? ""}
            placeholder="TypeScript, React, Figma..."
            className="h-8 text-xs"
            onChange={(e) =>
              onChange({
                items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </Field>
      )}

      {/* 6. Structured Multi-Item List Blocks (Features, Why, FAQ, Reviews) */}
      {(block.type === "features" || block.type === "why" || block.type === "reviews" || block.type === "faq") && (
        <StructuredItemsEditor
          type={block.type}
          items={block.items ?? []}
          onChange={(items) => onChange({ items })}
        />
      )}
    </div>
  )
}
```

### 5.3 State Propagation Lifecycle
1. **User input**: User types in an input/textarea.
2. **Local handler**: `BlockForm` triggers `onChange({ [field]: value })`.
3. **Sidebar dispatch**: `updateBlock(block.id, patch)` computes the new `FolioBlock[]` array and calls `onBlocks(nextBlocks)`.
4. **Editor state update**: `setBlocks` invokes `setDraft((current) => ({ ...current, blocks }))` in `PortfolioEditor`.
5. **History & Persistence**:
   - `useEditorHistory` appends the previous state to the undo stack.
   - `useDebouncedSave` queues a save to `localStorage` under `afm:draft:${slug}`.
6. **Canvas Live Update**: `FolioCanvas` receives the updated `draft` and synchronously re-renders the live view in real time.

---

## 6. Verification Plan

1. **Unit / Integration Verification**:
   - Verify typing in any `BlockSidebar` input immediately reflects on the live canvas without requiring a page refresh or manual save.
   - Verify hovering and clicking on canvas elements does not open any DialKit modal or display blue/primary selection rings.
   - Verify clicking Undo (`⌘Z`) and Redo (`⌘⇧Z`) restores previous text content in both the sidebar inputs and canvas preview.
2. **Build Verification**:
   - Execute `npm run build` to verify type safety and ensure no broken imports from removed DialKit components.
