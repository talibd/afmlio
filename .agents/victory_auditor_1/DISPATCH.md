## 2026-08-16T18:07:45+05:30
<USER_REQUEST>
<original_task>
This is a single self-contained fix; keep it small and focused.
Connect the AFM Portfolio visual canvas with the block engine, enabling interactive on-canvas click-to-select, real-time styling updates, and synchronized block management.

Working directory: c:/Users/talib/OneDrive/Documents/my apps/afmlio
Integrity mode: demo

## Requirements

### R1. Canvas-Block Rendering Synchronization
Connect the visual preview canvas in components/folio-view.tsx and components/portfolio-editor.tsx with the active FolioBlock data structure. Ensure that adding, reordering, deleting, or toggling block visibility in components/block-sidebar.tsx immediately reflects on the visual canvas in real-time across all taste templates.

### R2. Interactive On-Canvas Element Selection
Enable on-canvas element interaction when selection mode is active. Clicking on any block or sub-element (heading, body text, image, CTA button, school badge, or list) in the canvas must:
1. Highlight/focus the selected element with appropriate visual indicator.
2. Synchronize the active state in BlockSidebar.
3. Open the corresponding ElementInspector or BlockLayoutInspector dial with the current element's properties.

### R3. Real-Time Inspector Style Binding
Ensure edits made via DialKit inspectors (typography face/size/weight/tracking, colors, padding, alignment, image fit/radius, and button styling) instantly re-render on the canvas and update the portfolio draft store.

### R4. Non-Destructive Public Folio Compatibility
Maintain full compatibility with the public /p/[slug] route and ensure the graphite gallery taste design system (DESIGN.md) remains preserved when switching templates or publishing.

## Acceptance Criteria

### Canvas Interaction & Selection
- [ ] Clicking any block or nested element on the canvas activates the selection state and opens its corresponding DialKit inspector.
- [ ] Toggling selection mode off in PreviewDock disables canvas click interception.
- [ ] Selected element and block indices stay in sync between the canvas and BlockSidebar.

### Block Engine & Real-Time Preview
- [ ] Adding, reordering, duplicating, hiding, or deleting blocks in BlockSidebar immediately updates the live canvas.
- [ ] Changes to element copy, typography, color, padding, and layout in DialKit dials render immediately on the canvas without requiring a page reload.
- [ ] Switching tastes properly updates the visual world while preserving custom copy and block definitions.

### Build & Regressions
- [ ] npm run build or npx tsc --noEmit completes cleanly with 0 TypeScript and lint errors.
- [ ] Public view at /p/[slug] renders published portfolios accurately without breaking layout or taste styling.
</original_task>

Please conduct an independent audit of the codebase to verify whether all requirements (R1–R4) and acceptance criteria have been fully satisfied. Report your structured verdict (confirmed or rejected) with supporting evidence.
</USER_REQUEST>
