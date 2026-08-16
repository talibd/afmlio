# Handoff Report: Requirement 1 (Form-Based Sidebar Editor)

**Agent**: Explorer 1 (Survey Phase)  
**Task**: Investigate Requirement 1 — Form-Based Sidebar Editor and Read-Only Live Preview Canvas  
**Working Directory**: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_explorer_survey_1`  
**Report Artifact**: `analysis.md`  

---

## 1. Observation

1. **`PortfolioEditor` (`components/portfolio-editor.tsx`)**:
   - Lines 8-10 import `BlockSidebar`, `BlockLayoutInspector`, `ElementInspector`, and `FolioCanvas`.
   - Lines 107-109 declare inspector state:
     ```typescript
     const [inspectKind, setInspectKind] = React.useState<ElementKind | null>(null)
     const [layoutOpen, setLayoutOpen] = React.useState(false)
     const [selectOn, setSelectOn] = React.useState(true)
     ```
   - Lines 222-234 define `inspect(id: string)` and `inspectElement(id: string, kind: ElementKind)` which trigger `ElementInspector` and `BlockLayoutInspector`.
   - Lines 324-326 pass these callbacks into `FolioCanvas`:
     ```typescript
     onSelectBlock={selectOn ? inspect : undefined}
     onSelectElement={selectOn ? inspectElement : undefined}
     onBlockKeySelect={selectOn ? inspect : undefined}
     ```
   - Lines 330-359 render `ElementInspector` and `BlockLayoutInspector` when `inspectKind` or `layoutOpen` is truthy.
   - Lines 197-199 define block updates:
     ```typescript
     function setBlocks(blocks: FolioBlock[]) {
       setDraft((current) => ({ ...current, blocks }))
     }
     ```

2. **`BlockSidebar` (`components/block-sidebar.tsx`)**:
   - Lines 160-310 render block rows. When a block is expanded (`open = expandedId === block.id`), lines 280-306 render child buttons for each element kind (`elementsOf(block.type)`), which when clicked call `onInspect(block.id, el.kind)`. There are currently no direct form input fields inside `BlockSidebar`.

3. **`TasteFolio` & `FolioFrame` (`components/taste-folio.tsx`, `components/folio-frame.tsx`)**:
   - In `taste-folio.tsx` (lines 19-40), `hitHelper` checks `if (!onSelectElement) return {}`. When defined, it attaches `onClick` event listeners (`e.preventDefault()`, `e.stopPropagation()`) and outline/selection classes (`cursor-pointer`, `outline-1`, `hover:outline-primary/60`, `ring-2 ring-primary`).
   - In `folio-frame.tsx` (lines 26-43), `bindHit` checks `if (!onSelect) return {}`. When defined, it attaches `onClick` and `hover:outline-primary` classes.

4. **`ElementInspector` (`components/element-inspector.tsx`)**:
   - Lines 4-5 import `DialRoot`, `useDialKit`, and `dialkit/styles.css`.
   - Lines 226-301 implement floating UI dialogs using `dialkit`.

5. **`PreviewDock` (`components/preview-dock.tsx`)**:
   - Lines 188-210 render the `MousePointer2` "Select" button toggling `selectOn`.
   - Lines 211-224 render the "Jump to" block picker calling `onSelectElement` (`inspect`).

---

## 2. Logic Chain

1. **Observation 1 & 3**: `FolioCanvas` attaches click listeners and outline rings only when `onSelectBlock` or `onSelectElement` are provided. If these callbacks are omitted (or `undefined`), `hitHelper`, `blockHitHelper`, and `bindHit` return `{}`.
   - *Inference*: Simply removing `onSelectBlock`, `onSelectElement`, and `onBlockKeySelect` from `FolioCanvas` in `portfolio-editor.tsx` completely disables all canvas click interception and visual inspection outlines, making the canvas purely a read-only live preview.

2. **Observation 1 & 4**: `ElementInspector` and `BlockLayoutInspector` are mounted exclusively in `portfolio-editor.tsx` based on `inspectKind` and `layoutOpen`.
   - *Inference*: Removing these two component mounts and their associated state from `portfolio-editor.tsx` completely removes `DialKit` from the editor runtime without affecting preview rendering or persistence.

3. **Observation 2 & 1**: `BlockSidebar` already receives `draft: Portfolio` and `onBlocks: (blocks: FolioBlock[]) => void`. `setBlocks` in `PortfolioEditor` calls `setDraft`, which triggers an immediate synchronous re-render and records the edit in `useEditorHistory`.
   - *Inference*: Replacing the element buttons inside `BlockSidebar`'s expanded accordion body with inline form controls (`<Input>`, `<Textarea>`, uploader, item lists) mapped to each block's properties and calling `onBlocks` on change enables direct, instant editing with real-time canvas updates and full undo/redo support.

4. **Observation 5**: `PreviewDock`'s `selectOn` button exists only to toggle visual selection mode on the canvas.
   - *Inference*: Removing the `selectOn` pointer button from `PreviewDock` cleans up the bottom toolbar while keeping viewport size switcher (`Desktop`, `Tablet`, `Phone`), Undo/Redo, SEO settings, Save Draft, Preview link, and Publish.

---

## 3. Caveats

- `PortfolioFieldsPanel` (in `components/settings-dialog.tsx`) currently modifies root-level draft fields (`draft.name`, `draft.title`, `draft.bio`, `draft.project`), which are synced to blocks via `syncFieldsToBlocks`. Direct edits in `BlockSidebar` modify `draft.blocks` directly. Implementers should ensure that direct block edits are preserved and not overwritten when saving settings.
- Template-specific blocks (e.g. `work` piece grids or custom taste blocks from Requirement 2) will use the same `FolioBlock` format (`heading`, `body`, `image`, `items`, `cta`, `ctaHref`) so they seamlessly integrate into `BlockSidebar`.

---

## 4. Conclusion

Requirement 1 can be cleanly implemented with high efficiency and zero regressions:
1. **Remove `DialKit` / Inspectors**: Remove `ElementInspector`, `BlockLayoutInspector`, `inspectKind`, and `layoutOpen` from `components/portfolio-editor.tsx`.
2. **Read-Only Canvas**: Pass `undefined` for `onSelectBlock`, `onSelectElement`, and `onBlockKeySelect` to `FolioCanvas` in `components/portfolio-editor.tsx`.
3. **Form-Based Sidebar**: Refactor `components/block-sidebar.tsx` to render an inline `BlockForm` for each block type when expanded, providing direct inputs for `heading`, `body`, `cta`, `ctaHref`, `cta2`, `cta2Href`, `image`, and `items`.
4. **Immediate Propagation**: Calling `onBlocks` on input changes triggers `setDraft` in `portfolio-editor.tsx`, which updates the live preview canvas synchronously and participates in undo/redo history.
5. **Clean Toolbar**: Remove `selectOn` toggle from `components/preview-dock.tsx`.

---

## 5. Verification Method

1. **Independent File Inspection**:
   - Inspect `components/portfolio-editor.tsx` to verify absence of `ElementInspector` / `BlockLayoutInspector` and absence of canvas selection callbacks.
   - Inspect `components/block-sidebar.tsx` to verify inline form fields per block type.
   - Inspect `components/taste-folio.tsx` lines 19-40 to verify `hitHelper` returns `{}` when callbacks are absent.
2. **Behavioral Test**:
   - Open `/edit/talib`.
   - Click on headings or images on the canvas: verify no DialKit inspector opens and no blue/primary outline appears.
   - Expand the "Hero" block in the left sidebar: edit the heading text.
   - Verify the heading on the canvas changes immediately as you type.
   - Press `Ctrl+Z` / `Cmd+Z`: verify the heading reverts.
3. **Build Command**:
   - Run `npm run build` from the project root to ensure type safety and error-free compilation.
