# Plan: Portfolio Editor Form-Based Sidebar, Reference Template & Onboarding Integration

## Overview
Transform the afmlio portfolio editor, template system, and onboarding flow to provide:
1. Simplified, direct form-based block content editing in the sidebar while keeping the canvas as a read-only live preview (disabling DialKit element/layout inspector).
2. Integration of a new design template based on `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html` with custom branding and dynamic draft rendering.
3. Tailored onboarding form asking questions aligned with the new template requirements and generating a fully populated draft.

## Phases & Milestones

### Phase 0: Survey & Scoping
- Spawn 3 parallel Explorers to investigate:
  1. Editor architecture: `BlockSidebar`, `DialKit`, `ElementInspector`, canvas click handlers, block content update propagation.
  2. Template architecture & Reference HTML: Existing template definitions, block models, styles, and detailed parsing of `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`.
  3. Onboarding & Draft generation: Onboarding steps/questions, draft creation logic, schema mapping.
- Aggregate findings into `PROJECT.md` with complete Feature Inventory and Interface Contracts.

### Phase 1: Milestone M1 - Form-Based Sidebar Editor
- Modify `BlockSidebar` to show direct input fields (headings, body text, links, lists, etc.) per block type.
- Ensure updating fields updates portfolio draft state immediately, re-rendering the live preview canvas.
- Disable `DialKit` inspector on canvas interactions, keeping canvas strictly read-only preview.
- Verification & Gating: Worker -> Reviewer -> Challenger -> Auditor.

### Phase 2: Milestone M2 - Reference-Based Template Integration
- Implement new template based on `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`.
- Define block types, styling, responsiveness, and custom branding.
- Support dynamic rendering on both editor preview canvas and public preview/routes.
- Verification & Gating: Worker -> Reviewer -> Challenger -> Auditor.

### Phase 3: Milestone M3 - Tailored Onboarding Form & Draft Generation
- Update onboarding questions to collect the exact information needed for the new template.
- Ensure onboarding completion produces a ready-to-use, fully populated portfolio draft.
- Verification & Gating: Worker -> Reviewer -> Challenger -> Auditor.

### Phase 4: Milestone M4 - End-to-End Integration, Build & Verification
- Verify entire flow: Onboarding -> Dashboard/Editor -> Form-based editing -> Live Canvas Update -> Public render.
- Verify `npm run build` succeeds without type or lint errors.
- Run review, challenge, and forensic audit.
