---
target: editor sidebar appearance compared with the app UI
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
timestamp: 2026-08-16T15-18-04Z
slug: components-block-sidebar-tsx
---
# Impeccable critique — Editor sidebar

**Provenance:** dual-agent assessment: independent design review plus independent detector/browser evidence.
**Target:** `components/block-sidebar.tsx`

## Heuristic score

| Heuristic | Score |
|---|---:|
| System status | 3/4 |
| Match with user language | 2/4 |
| User control | 2/4 |
| Consistency | 1/4 |
| Error prevention | 2/4 |
| Recognition over recall | 2/4 |
| Efficiency | 2/4 |
| Aesthetic minimalism | 1/4 |
| Error recovery | 2/4 |
| Help/documentation | 1/4 |
| **Total** | **18/40 — Poor** |

## Design specificity verdict

**Low.** The sidebar reads like a generic page-builder inspector grafted onto AFM. The main app is calm, spacious, labeled, and olive-accented; the editor becomes a dense monochrome configuration panel.

The deterministic detector returned zero findings. Browser measurements nevertheless confirmed hidden vertical overflow, small controls, inaccessible label associations, and a dominant selected-block surface. No reliable user-visible overlay was available because the browser surface did not support mutable script injection; fallback evidence used screenshots, accessibility snapshots, computed geometry, focus inspection, and console logs.

## Overall impression

The preview is polished and product-specific, but the sidebar changes the experience from “shape my portfolio” to “configure a web template.” The biggest opportunity is to make the editor as opinionated and calm as the portfolio product itself.

## What’s working

- The live preview stays visible while editing and gives immediate context.
- Only one block expands at a time, preventing a full accordion wall.
- Undo/redo, autosave, image feedback, alt text, semantic buttons, and focus styles provide a solid functional base.

## Cognitive load

**Five of eight checks fail: high cognitive load.** Chunking, hierarchy, minimal choices, working memory, and progressive disclosure fail. Opening one block reveals title, discipline, narrative, artwork, URL, alt text, CTA label, and link syntax in one long stack.

## Emotional journey

The large preview initially creates confidence. The sidebar then changes the experience from “shape my portfolio” to “configure a web template.” The lowest point occurs when the long inspector hides the remaining page outline while the “Unsaved” badge makes users unsure whether their work is safe.

## Priority issues

1. **[P1] The editor abandons the app’s visual contract.**
   - **Why it matters:** The dashboard uses generous spacing, labeled navigation, restrained radii, and olive emphasis. The editor uses a 244×665 px gray slab, 12 px labels, 28–32 px controls, and icon-only navigation.
   - **Fix:** Rebuild the editor chrome from the spacing, control-height, radius, and active-state vocabulary used by `AppSidebar`.
   - **Suggested command:** `$impeccable layout`

2. **[P1] It behaves like a generic website builder.**
   - **Why it matters:** “Partners,” “Why us,” “Reviews,” “FAQ,” “CTA,” and “Footer” conflict with the product promise of an opinionated one-page student portfolio. The Add menu exposes 13 flat choices.
   - **Fix:** Make the core structure AFM-first—Introduction, Project, Skills, About, Contact—and place secondary sections under “More.”
   - **Suggested command:** `$impeccable distill`

3. **[P1] The selected block swallows the page outline.**
   - **Why it matters:** The sidebar’s visible scroll region is 564 px, but its content is 821 px tall. The scrollbar is hidden, so lower blocks disappear without a visual cue.
   - **Fix:** Keep the page outline visible and give the selected block a separate inspector region, or use stronger progressive disclosure inside the form.
   - **Suggested command:** `$impeccable layout`

4. **[P1] Form accessibility and target sizing are weak.**
   - **Why it matters:** Visible labels are not bound to inputs; many fields are announced from placeholders. Controls are mostly 28–32 px, below the common 44 px touch-target recommendation.
   - **Fix:** Connect labels with IDs, enlarge interaction hit areas, and keep selected-block actions persistently discoverable.
   - **Suggested command:** `$impeccable audit`

5. **[P2] Status language creates uncertainty.**
   - **Why it matters:** The editor autosaves the draft, but the header says “Unsaved” whenever it differs from the published page. Reset/Delete are immediate.
   - **Fix:** Distinguish “Saving,” “Draft saved,” and “Unpublished changes,” then add contextual undo for destructive actions.
   - **Suggested command:** `$impeccable clarify`

## Persona red flags

- **Alex, power user:** Shortcuts are undiscoverable and reordering requires repeated menu actions.
- **Jordan, first-timer:** “Eyebrow,” “CTA,” fragment links, and 13 Add choices require site-builder knowledge.
- **Sam, accessibility-dependent:** Labels are not programmatically associated, touch targets are small, and hidden scrollbars conceal content.

## Minor observations

- Capitalization varies between item actions.
- Raw image URLs expose implementation detail.
- The image preview consumes too much of a narrow inspector.
- The chevron and block-name button split one perceived action into two controls.

## Questions to consider

- Is AFM Portfolio meant to be a generic block builder, or should its opinionated structure be the advantage?
- What if the sidebar remained a calm page outline and editing happened in a dedicated inspector?
- If the draft is safely autosaved but unpublished, why call it “Unsaved”?
- Which four section choices cover 90% of AFM students?
