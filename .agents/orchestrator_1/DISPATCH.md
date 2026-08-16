## 2026-08-16T13:59:46Z
You are the Project Orchestrator for the task defined in `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\ORIGINAL_REQUEST.md`.

Your working directory is: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\orchestrator_1`
Project root: `c:\Users\talib\OneDrive\Documents\my apps\afmlio`

## Task Overview
Modify the existing portfolio editor to feature a simplified, form-based sidebar for editing block content directly, bypassing the visual canvas inspector. Concurrently, integrate a new design template based on the provided HTML reference (`C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`), and update the onboarding flow to collect the exact information required by this new template.

## Requirements
1. **R1. Form-Based Sidebar Editor**: Modify `BlockSidebar` in the editor so that each block row displays direct input fields (e.g. text inputs for headings, textareas for body copy, etc.) for its content. Disable the `DialKit` inspector (`ElementInspector`/`BlockLayoutInspector`) entirely, keeping the visual canvas strictly as a read-only live preview.
2. **R2. Reference-Based Template Integration**: Implement a new portfolio taste template based on the reference file located at `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`, applying custom branding. Parse the HTML structure to define the necessary block types and styles in the codebase, ensuring it renders dynamically based on the portfolio draft.
3. **R3. Tailored Onboarding Form**: Update the onboarding form flow to ask questions that map directly to the content requirements of the new template from R2. Ensure the generated draft is fully populated with the user's answers when they finish onboarding.

## Acceptance Criteria
- Editor Sidebar:
  - The `BlockSidebar` renders inline text/input fields for each block's content properties instead of just layer names.
  - Updating an input field in the sidebar immediately updates the corresponding text on the read-only live preview canvas.
  - Clicking elements on the canvas no longer opens the `DialKit` inspector.
- Template & Onboarding:
  - The new template successfully renders on the canvas and public route, visually matching the provided HTML reference but with custom branding applied.
  - Completing the onboarding flow produces a draft portfolio populated with all content required by the new template.
  - The project builds successfully with `npm run build` without type or lint errors.
