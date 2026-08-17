# AFM Frame Portfolio Platform — One-Shot Emergent PRD

**Document status:** Build-ready  
**Version:** 1.0  
**Target builder:** Emergent  
**Product scope:** Frame template only  
**Account model:** Open public registration  
**Primary data store:** Emergent MongoDB  
**Media storage:** Cloudflare R2  

## 1. One-shot instruction for Emergent

Build the complete production-ready application described in this document in one pass. Do not return a wireframe, static mockup, partial prototype, or plan. Implement the frontend, backend, database models, authentication, Cloudflare R2 upload flow, responsive behavior, validation, error states, automated tests, seed-free first-run behavior, and deployment configuration.

**Non-negotiable flow constraint:** preserve the user flow and screen sequence of the existing AFM application. The production implementation replaces prototype persistence and fake actions, but it must not reorganize the journey, introduce a template-selection step, add onboarding screens, move users through a different route sequence, or insert fields into onboarding that are not already part of the current Frame flow. Section 7.1 is the authoritative flow contract and takes precedence if another requirement could be interpreted differently.

Reuse the visual direction and interaction model specified below. The public portfolio must faithfully reproduce the supplied Frame reference template rather than inventing a generic portfolio theme. The dashboard, onboarding, and editor should use the same restrained editorial design language without copying the public portfolio layout literally.

Do not use browser localStorage as the source of truth. Do not implement fake authentication, hard-coded demo users, placeholder upload buttons, base64 media persistence, or mock publish behavior. All core actions must work against the backend and persist across devices and sessions.

Before declaring the build complete:

1. Run the automated test suite.
2. Test registration, login, onboarding, upload, editing, preview, publishing, and public portfolio viewing end to end.
3. Test desktop, tablet, and mobile layouts.
4. Resolve all blocking errors and obvious visual defects.
5. Confirm that R2 credentials are never exposed to the browser.

## 2. Product summary

AFM is a fast portfolio builder for AI filmmakers and visual creators. A new user registers, completes a focused two-step onboarding flow, uploads the media for a first project, and publishes a polished Frame portfolio within minutes. After onboarding, the user can manage projects, edit the content used by the template, preview responsive layouts, and publish updates.

The MVP supports one public design: **Frame**. Frame is a minimal editorial portfolio with a navigation bar, hero, featured project, filterable project grid, about section, contact section, footer, and project lightbox. Its content model is intentionally limited to fields the template visibly renders.

## 3. Problem statement

AI filmmakers and visual creators often need a credible portfolio quickly but lose time configuring website builders, choosing layouts, and completing fields that do not improve the final presentation. Existing tools also make large visual assets difficult to manage.

AFM solves this by offering:

- A strong opinionated template with no theme-selection step.
- A short onboarding flow that creates a real first portfolio.
- Direct image and video uploads backed by Cloudflare R2.
- A visual editor limited to content the Frame template actually uses.
- Draft, preview, and publish states that are easy to understand.

## 4. Goals and success metrics

### 4.1 Product goals

- Allow a first-time user to reach a publishable portfolio in under five minutes, excluding upload time.
- Require only the minimum content needed for a coherent Frame portfolio.
- Support images and browser-playable video throughout onboarding, editing, preview, and the public site.
- Preserve a clean visual relationship between the app shell and the public portfolio.
- Provide durable server-side drafts and publication state.

### 4.2 Launch success metrics

- At least 70% of users who begin onboarding create their portfolio draft.
- At least 50% of completed drafts are published.
- Median active onboarding time is below five minutes.
- At least 95% of accepted media uploads complete successfully.
- Published portfolio pages achieve no critical accessibility violations and a mobile Lighthouse performance score of at least 85 under normal test data.

## 5. Users and permissions

### 5.1 Visitor

- Can view any published portfolio through its public URL.
- Can filter projects, open project details, play videos, and use the contact email link.
- Cannot view drafts or access editing routes.

### 5.2 Registered creator

- Can register openly with email and password.
- Can create and manage multiple portfolios; every portfolio uses Frame in the MVP.
- Can edit, preview, publish, unpublish, and delete their own portfolio.
- Can upload and delete their own media.
- Cannot access or mutate another creator's content or R2 objects.

### 5.3 Platform administrator

No administrator interface is required for MVP. Operational database or storage administration may be performed through provider tooling.

## 6. Scope

### 6.1 In scope

- Open email/password registration and login.
- Password reset.
- Two-step first-portfolio onboarding.
- Frame public template.
- Project management and reordering.
- Image and video uploads, plus direct image/video URLs.
- Draft autosave, explicit save status, preview, publish, and unpublish.
- Desktop, tablet, and mobile previews.
- Public portfolio route with a unique slug.
- Basic SEO metadata.
- Existing settings dialog, theme control, dashboard navigation, and logout.
- Cloudflare R2 direct uploads using presigned URLs.
- MongoDB persistence and ownership checks.

### 6.2 Explicitly out of scope

- The Walk, Ground, Aperture, Folio, and Flood templates.
- Template selection or switching.
- Drag-and-drop page layout construction.
- Custom domains.
- Team collaboration, comments, approvals, or roles.
- Payments, subscriptions, or usage billing.
- Social profiles, resume upload, profile photo, testimonials, client logos, awards, or education fields.
- Custom navigation items or arbitrary page sections.
- Video transcoding, adaptive streaming, or automatic poster-frame generation.
- Analytics dashboards.
- AI-generated copy or imagery.
- Administrative moderation UI.

## 7. Core user journey

1. Visitor opens the landing or registration page.
2. Visitor registers with name, email, and password.
3. The app creates a verified session and redirects to `/onboarding`.
4. In onboarding step 1, the creator enters the portfolio copy used by Frame.
5. In onboarding step 2, the creator adds the first project and uploads an image or video.
6. The app creates the portfolio and redirects to `/edit/{slug}`.
7. The creator reviews the live canvas, optionally edits content or adds projects, and selects Publish.
8. The backend creates an immutable publication snapshot and the app exposes `/p/{slug}`.
9. Later changes autosave to the draft without changing the public page until the creator publishes again.

### 7.1 Authoritative current-flow preservation contract

> **Owner amendment (2026-08-17):** the product owner directed that onboarding
> open with a style-selection step showing five Frame recasts (frame, press,
> void, studio, column — `lib/frame-variants.ts`). Onboarding is now
> Style → Content → Projects → Review. Every variant renders the identical
> Frame structure, so the content model below is unchanged; the "no
> template-selection step" clause is superseded by this decision.

The following sequence must remain the same as the existing application:

```text
Signed out
  / → /login
  /login → successful login → /dashboard
  /signup → successful signup → /onboarding

Create portfolio
  /onboarding, Step 1 "Make the page yours"
  → "Add your work"
  → /onboarding, Step 2 "Add selected work"
  → "Create my portfolio"
  → /edit/{autoGeneratedSlug}?welcome=1

Existing user
  /dashboard
  → select a portfolio row → /edit/{slug}
  → "New portfolio" → /onboarding

Editor
  sidebar block outline/inspector + live Frame canvas + floating preview dock
  → Preview → /p/{slug}?preview=1 in a new view
  → Publish → update /p/{slug}
  → Dashboard icon → /dashboard
```

Preservation rules:

- Keep onboarding at exactly two steps on the same `/onboarding` route; the step changes in place.
- Do not add a welcome wizard, template picker, profile setup, slug-selection screen, publish-confirmation wizard, or success interstitial.
- Generate a unique slug from the portfolio/studio name when **Create my portfolio** is selected. Resolve collisions automatically with a short suffix. The user may change the slug later in Settings, not during onboarding.
- Keep the live Frame preview visible beside both onboarding steps on desktop.
- Preserve entered onboarding values when moving Back and when refreshing an incomplete session, using secure server-side draft state for authenticated users rather than localStorage.
- Preserve the ability to add more than one project during step 2. The first project is featured.
- Keep the dashboard as the home for returning users and the editor as the immediate destination after portfolio creation.
- Keep editor controls in their present locations: content editing in the left sidebar, responsive canvas in the main area, publishing controls in the floating bottom dock, and icon-only Settings/Theme/Dashboard navigation in the sidebar footer.
- The Frame-only scope removes the Tastes/template-switching destination, but does not otherwise alter the current dashboard → onboarding → editor → preview/publish journey.

## 8. Information architecture and routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Concise product landing page with login and create-portfolio actions |
| `/signup` | Signed-out only | Open registration |
| `/login` | Signed-out only | Login |
| `/forgot-password` | Signed-out only | Request password reset |
| `/reset-password` | Token holder | Set a new password |
| `/onboarding` | Authenticated, no portfolio | Two-step portfolio creation |
| `/dashboard` | Authenticated | Portfolio status and management |
| `/edit/{slug}` | Portfolio owner | Visual portfolio editor |
| `/p/{slug}?preview=1` | Portfolio owner | Draft preview opened from the editor |
| `/p/{slug}` | Public when published | Published Frame portfolio |

Signed-out users who open a protected route must be sent to `/login` and returned to the intended route after login. Existing users may open `/onboarding` from the dashboard's **New portfolio** action to create another Frame portfolio. Do not force a template-selection screen before onboarding.

## 9. Authentication requirements

- Preserve the current registration form order: **email**, **password**, primary **Create account** action, GitHub alternative, and link to Login. Do not add display name or confirm-password fields to the primary signup flow.
- Normalize email addresses to lowercase and enforce uniqueness.
- Password must contain at least eight characters.
- Hash passwords using a modern adaptive password hash; never store plaintext passwords.
- Use secure, HTTP-only, SameSite cookies for sessions.
- Apply CSRF protection where required by the chosen session architecture.
- Rate-limit registration, login, reset requests, upload authorization, and publish endpoints.
- Login errors must not disclose whether an email address exists.
- Password-reset tokens must be single-use, time-limited, and stored hashed.
- Logout must invalidate the server session.

Email verification may be omitted from MVP if Emergent cannot configure a transactional email provider in the same build. Password reset must be fully implemented when an email provider is available; otherwise build the backend token workflow and clearly expose the required email-provider environment configuration rather than faking success.

## 10. Onboarding flow

Onboarding must be a focused split-screen experience on large screens: the form on the left and a live Frame preview on the right. On screens below 900 px, show the form first with a sticky **Preview** control that opens a full-screen preview sheet. The page must size to the viewport without a large blank region or nested page-level scrollbars. Only the form column may scroll independently on desktop, and the bottom action bar must remain reachable.

Show `Step 1 of 2` or `Step 2 of 2`, a short title, and a compact progress indicator. Preserve entered values when moving backward.

### 10.1 Step 1 — “Make the page yours”

Collect only fields rendered by the Frame template:

| Field | Required | Rules | Frame usage |
|---|---:|---|---|
| Portfolio or studio name | Yes | 2–40 characters | Navbar logo, portfolio identity, footer copyright, automatic slug source |
| Main headline | Yes | 2–60 characters | First hero headline line |
| Secondary headline | No; prefilled | Up to 60 characters; default `Human made creative.` | Second hero headline line |
| Short introduction | Yes | 20–220 characters | Hero paragraph |
| About heading | No; prefilled | Up to 80 characters; default `Less noise.\nMore work.` | About heading |
| Contact email | Yes | Valid email; prefill account email | Contact mailto link and displayed address |
| About description | No | Up to 400 characters; use restrained template fallback when empty | About paragraph |

Keep the fields in the current order and grouping. Do not display or request a slug; generate it when the portfolio is created. Derive the contact services line and footer descriptor from the project categories, as the current app does. Do not collect social links, a separate biography, profile photo, location, phone, resume, services, alt text, or custom menu labels during onboarding.

Primary action label: **Add your work**.

### 10.2 Step 2 — “Add selected work”

The first project becomes the featured hero project and the first card in Selected Work.

| Field | Required | Rules | Frame usage |
|---|---:|---|---|
| Project title | Yes | 2–80 characters | Featured title, card title, lightbox title |
| Category | Yes | Enum: Film, Ad, Graphics | Filter and card type |
| Short detail | No | Up to 160 characters; example `AI short film · 04:18` | Featured metadata and lightbox description |
| Project media | No | One uploaded file or one direct URL; use a restrained template fallback if empty | Featured media, card media, lightbox media |

Media input must offer one clear drop zone labeled **Upload image or video** and a secondary direct-URL input. Accept only one media source. Selecting a file must supersede a typed URL after confirmation; entering a URL must clear an uncommitted upload selection.

Start with one project editor. Show **Add another project** below it so the user can create several projects without leaving onboarding. Label the first item **Featured project** and subsequent items `Project 2`, `Project 3`, and so on. Allow later items to be removed; the first/only item cannot be removed. Only project title blocks creation. Derive image alt text from the project title in onboarding; creators may refine accessibility text later in the editor.

Show upload progress, file name, type, size, cancel, retry, replace, and remove controls. Display an image preview or playable muted video preview. Video preview controls must be available after selection.

Actions:

- Secondary: **Back**.
- Primary: **Create my portfolio**.

Disable the primary action during upload or submission. After successful creation, redirect directly to `/edit/{autoGeneratedSlug}?welcome=1`; do not insert a success screen.

## 11. Dashboard requirements

Preserve the current dashboard hierarchy and behavior for multiple Frame portfolios.

- Keep the AFM app sidebar and Dashboard heading.
- Keep the Visitors and Storage used summary cards; connect them to real data when available and use honest zero/empty states instead of demo numbers.
- Keep the compact identity/status chips and **New portfolio** action.
- Keep the Portfolios section as a list of portfolio rows showing name, supporting label/date, Draft or Live status, and edit affordance.
- Selecting anywhere on a portfolio row opens `/edit/{slug}`.
- **New portfolio** opens `/onboarding` directly.
- Remove or hide the existing Tastes action because the confirmed MVP is Frame-only; do not replace it with another step.
- Preview, Publish, View live, Unpublish, and Delete remain available from the editor/settings flow rather than being moved into a new dashboard wizard.
- When unpublished changes exist, show `Unpublished changes` without replacing the published page.
- Never show empty template galleries or upsell cards in the MVP.

## 12. Editor requirements

### 12.1 Layout

Desktop editor layout:

- Fixed-width left sidebar of approximately 280 px.
- Flexible live Frame canvas occupying the remaining viewport.
- Compact floating toolbar centered near the bottom of the canvas.
- No horizontal page overflow.
- Sidebar content may scroll; its header and bottom icon navigation remain fixed.

Mobile editor layout:

- Full-screen canvas by default.
- A single edit icon opens the content editor as a full-height sheet.
- Floating toolbar uses essential controls only: preview size, save status, preview, publish.

The app sidebar must visually belong to the same product as Frame: warm white surfaces, soft grey borders, restrained olive accents, black typography, compact controls, and no oversized pill-button stack. Bottom navigation uses left-aligned icon-only buttons in one row, each with an accessible tooltip and `aria-label`.

### 12.2 Sidebar outline

Preserve the current block-based editing interaction rather than replacing it with a different multi-page settings form:

- Sidebar header: AFM mark and compact status badge (`Saving…`, `Unpublished`, `Live`, or `Draft saved`).
- Sidebar content header: **Blocks** with a compact **Add** action.
- Ordered outline: Hero, featured/project blocks, About, and Contact.
- Selecting a block expands or opens its inspector in the same sidebar and updates the canvas selection.
- Each block inspector exposes only content that block renders. Project blocks show title, category, short detail, media, and derived/refinable alt text.
- Sidebar footer: left-aligned icon-only Settings, Theme, and Dashboard controls in one row, with accessible names and tooltips.
- SEO remains in the floating preview dock, matching the existing editor, rather than becoming a separate onboarding or sidebar step.

### 12.3 Project editor

Project fields must be exactly:

- Title.
- Category: Film, Ad, or Graphics.
- Description.
- Media upload or direct URL.
- Alt text for images.

Controls:

- Replace media.
- Remove media.
- Set as featured.
- Duplicate project.
- Delete project with confirmation.
- Reorder projects through drag-and-drop and keyboard-accessible move controls.

Changing the featured project updates the hero immediately. A portfolio must always have exactly one featured project while it contains projects. Deleting the featured project assigns the first remaining project as featured. Publishing is blocked if no complete project remains.

### 12.4 Canvas and toolbar

The live canvas must render the same Frame component used for public output, populated from the draft. Do not maintain a separate approximation that can drift from the published result.

Toolbar controls:

- Undo and redo for the current editor session.
- Current block/element selector.
- Device preview: desktop, tablet, mobile.
- SEO popover.
- Explicit Save action while retaining autosave.
- Draft save status: `Saving…`, `Saved`, or `Couldn’t save` with retry.
- Full preview.
- Publish or **Publish updates**.

Autosave valid changes after 800–1200 ms of inactivity. Keep unsaved edits in memory if a save fails, show a persistent non-blocking error, and retry with exponential backoff. Warn before closing the page only when local changes have not reached the server.

## 13. Frame public template specification

Implement the public portfolio as a faithful responsive recreation of the provided `frame-ai-simple-portfolio.html` reference.

### 13.1 Visual direction

- Editorial, quiet, image-led, and flat.
- Warm off-white background, near-black text, muted grey secondary text, and fine neutral dividers.
- High-contrast serif display typography paired with a restrained sans-serif for metadata and controls.
- Large but responsive typography; no headline should overflow or create unreadably long lines.
- Minimal shadows; never use gradients or generic card effects.
- Media should be the dominant visual element.

Use locally bundled or properly licensed web fonts with reliable fallbacks. Avoid layout shifts while fonts load.

### 13.2 Structure

1. Navbar: portfolio name at left; Work and About anchors centered/right; Contact action.
2. Hero: hero headline, introduction, fixed `View work →` anchor, and featured project media.
3. Featured overlay: featured project title, project description, and position such as `01 / 06`.
4. Selected Work: All, Films, Ads, and Graphics filters plus responsive media grid.
5. About: about heading and about text.
6. Contact: fixed heading `Have an idea? Let's make it.`, services line, and contact email.
7. Footer: copyright year plus portfolio name; services line.
8. Project detail: accessible lightbox/modal with media, title, and description.

The fixed labels and navigation copy above are template UI, not editable content fields.

### 13.3 Image and video behavior

- Images use responsive dimensions, lazy loading outside the initial viewport, and object-fit cropping where the design requires it.
- Videos use native HTML5 playback, `playsInline`, a poster-style neutral placeholder before loading, and visible controls in the lightbox.
- Featured videos may autoplay only when muted and when reduced-motion is not requested; otherwise show a play action.
- Project cards containing video show a subtle play icon and must never force all videos to preload.
- A failed media load shows a proportionate fallback without collapsing the layout.

### 13.4 Filtering and modal behavior

- Filters operate client-side with All selected initially.
- Hide categories with no projects or keep their buttons disabled; do not allow filters to produce a confusing blank grid.
- Project cards are keyboard-focusable and open by Enter or Space.
- Modal traps focus, closes on Escape and explicit close, restores focus to the invoking card, and prevents background scrolling.
- Clicking the backdrop closes the modal; clicking content does not.

## 14. Preview and publishing

### 14.1 Draft preview

- `/p/{slug}?preview=1` renders the latest saved draft and is accessible only to the owner.
- Preview must use the production Frame renderer.
- Show a small preview-only bar with close and device controls; this bar must not appear on the public page.

### 14.2 Publish

- Publishing validates all required portfolio fields, at least one complete project, one featured project, and accessible media URLs.
- The server creates a publication snapshot from the current draft in one atomic operation.
- `/p/{slug}` renders only the latest successful publication snapshot.
- Subsequent draft autosaves must not affect the public snapshot.
- Republishing replaces the active snapshot while retaining `firstPublishedAt` and updating `publishedAt`.
- Unpublishing makes `/p/{slug}` return a branded not-found state, without deleting the draft or media.

### 14.3 SEO

- Default browser title: `{portfolioName} — AI Portfolio`.
- Default meta description: hero introduction.
- The editor permits overrides for browser title and meta description only.
- Add canonical URL, Open Graph title/description/image, and Twitter card metadata to published pages.
- Use the featured image as the social image. If the featured asset is video, use a configured default AFM social image because video thumbnail generation is out of scope.
- Published pages are indexable; editor, preview, dashboard, onboarding, and auth routes are `noindex`.

## 15. Cloudflare R2 media architecture

### 15.1 Upload flow

1. Authenticated browser requests an upload authorization from the AFM backend.
2. Backend verifies ownership, declared MIME type, file size, and intended portfolio/project.
3. Backend generates a collision-resistant object key and a short-lived presigned R2 `PUT` URL.
4. Browser uploads directly to R2 with the exact authorized `Content-Type`.
5. Browser calls the completion endpoint.
6. Backend verifies the object exists and stores the media asset metadata in MongoDB.
7. The editor associates the completed asset with the project.

Never send R2 access keys to the browser and never proxy large file bodies through the application server unless direct upload is unavailable.

### 15.2 Accepted media

Images:

- MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- Maximum size: 15 MB.

Videos:

- MIME types: `video/mp4`, `video/webm`, `video/quicktime`.
- Maximum size: 250 MB.
- Clearly explain that browser playback depends on a web-compatible codec; MP4/H.264 and WebM are recommended.

Validate extension, declared MIME type, and stored object metadata. A client-side check improves feedback but never replaces server validation.

### 15.3 Object keys and access

Use object keys shaped like:

`users/{userId}/portfolios/{portfolioId}/projects/{projectId}/{uuid}.{extension}`

Store both the R2 object key and stable delivery URL in MongoDB. Use an R2 custom domain or approved public delivery domain for published assets. The upload bucket must not expose directory listing. Configure CORS for exact preview and production origins and only required methods and headers.

Presigned upload URLs expire in five minutes. Treat them as bearer tokens and never log them in analytics or error-reporting payloads.

### 15.4 Media lifecycle

- An upload authorization begins with `pending` status.
- A successfully verified upload becomes `ready`.
- Failed or abandoned pending objects are eligible for cleanup after 24 hours.
- Replacing media does not delete the previous object until the new asset is verified and the project update succeeds.
- Removing an asset marks it for deletion; a background cleanup removes it only when no draft or publication snapshot references it.
- Deleting a portfolio removes its MongoDB records and all owned R2 objects after explicit confirmation.
- Never delete media still referenced by an active published snapshot.

### 15.5 Required environment variables

```text
MONGODB_URI=
SESSION_SECRET=
APP_BASE_URL=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=
EMAIL_FROM=
EMAIL_PROVIDER_API_KEY=
```

Keep preview and production values separate. Secrets are server-only.

## 16. MongoDB data model

Use native database IDs internally and opaque string IDs in public/API payloads. Include `createdAt` and `updatedAt` on all mutable documents.

### 16.1 `users`

```text
id
emailNormalized (unique)
passwordHash
createdAt
updatedAt
```

### 16.2 `sessions`

```text
id
userId (indexed)
tokenHash (unique)
expiresAt (TTL index)
createdAt
lastSeenAt
```

### 16.3 `portfolios`

```text
id
ownerId (indexed; a user may own multiple portfolios)
template = "frame"
slug (unique)
status = "draft" | "published"
draftRevision
publishedRevision nullable
draft:
  portfolioName
  heroHeadline
  heroIntroduction
  aboutHeading
  aboutText
  servicesLine
  contactEmail
  seoTitle nullable
  seoDescription nullable
  projectOrder[]
  featuredProjectId
firstPublishedAt nullable
publishedAt nullable
createdAt
updatedAt
```

### 16.4 `projects`

```text
id
portfolioId (indexed)
ownerId (indexed)
title
category = "film" | "ad" | "graphic"
description
mediaAssetId
altText nullable for video
createdAt
updatedAt
```

### 16.5 `mediaAssets`

```text
id
ownerId (indexed)
portfolioId (indexed)
projectId nullable
source = "upload" | "external_url"
status = "pending" | "ready" | "failed" | "pending_delete"
kind = "image" | "video"
mimeType
byteSize nullable for external URLs
objectKey nullable for external URLs
deliveryUrl
originalFilename nullable
createdAt
updatedAt
```

### 16.6 `publicationSnapshots`

```text
id
portfolioId (indexed)
revision
snapshotData (complete denormalized portfolio, ordered projects, and media URLs)
publishedAt
```

Create a unique compound index on `portfolioId + revision`. The portfolio document points to the active published revision. Snapshot reads must not depend on mutable draft project documents.

## 17. Backend/API behavior

Route names may follow Emergent conventions, but capabilities must include:

### Authentication

- Register.
- Login.
- Logout.
- Get current session/user.
- Request password reset.
- Complete password reset.

### Portfolio

- Create portfolio from onboarding in one transaction or compensating atomic workflow.
- Get owned draft.
- Patch owned portfolio fields using optimistic revision checks.
- Check slug availability.
- Change slug, preventing collisions and reserved words.
- Publish.
- Unpublish.
- Delete portfolio.
- Get public publication by slug.

### Projects

- Create project.
- Patch project.
- Duplicate project.
- Delete project.
- Reorder projects.
- Set featured project.

### Media

- Authorize R2 upload.
- Complete and verify upload.
- Register a validated external URL.
- Mark media for safe deletion.

All protected operations derive owner identity from the authenticated session, never from a trusted client-supplied owner ID. Validate request bodies with a shared schema library. Return structured errors with a stable code, safe message, and field-level details where appropriate.

Use optimistic concurrency with `draftRevision`. A stale write returns `409 CONFLICT` and enough information for the editor to reload safely; it must not silently overwrite a newer server version.

## 18. External media URL rules

- Allow only `https://` URLs.
- Accept only URLs that resolve to an allowed image or video MIME type.
- Reject local, loopback, private-network, link-local, and metadata-service addresses to prevent server-side request forgery.
- Use short timeouts and bounded redirects during server validation.
- Do not download or mirror external media into R2 automatically.
- Display a warning that external media can disappear and recommend upload for reliability.

## 19. Validation and error states

### Form validation

- Validate on blur and on submission without showing errors before the user interacts.
- Keep messages specific: `Use 3–40 lowercase letters, numbers, or hyphens.`
- Preserve all valid values when another field fails.
- Focus the first invalid field after submission and provide an error summary for screen readers.

### Required states

- Loading skeletons that match final geometry.
- Empty project state with **Add your first project**.
- Uploading with progress and cancel.
- Upload failed with reason and retry.
- Autosave failed with retry.
- Session expired with return-after-login.
- Slug conflict.
- Publish validation errors linked to the relevant sidebar group/project.
- Public portfolio not found or unpublished.
- Offline state that protects unsaved in-memory changes.

Never render a large unexplained blank canvas. If content fails, show a bounded error state with a recovery action.

## 20. Accessibility

- Meet WCAG 2.2 AA for core flows.
- Full keyboard operation for auth, onboarding, editor controls, filtering, project reordering, and modal behavior.
- Visible focus indicators with adequate contrast.
- Form controls have persistent labels; placeholders are examples, not labels.
- Icon-only controls require accessible names and tooltips.
- Respect `prefers-reduced-motion`.
- Use semantic landmarks and heading order.
- Ensure at least 44 × 44 px touch targets on mobile where practical.
- Require alt text for uploaded images; video controls must have accessible names.
- Announce autosave and upload completion politely without repeatedly interrupting screen readers.

## 21. Responsive behavior

- Public Frame template breakpoints should be content-driven, with primary checks near 375, 768, 1024, and 1440 px.
- Navigation links may collapse to a small menu on narrow screens while preserving Work, About, and Contact anchors.
- Project grid: one column on small screens, two on medium, and three where content width permits.
- Hero typography scales with `clamp()` and must not overflow at 320 px.
- Editor/sidebar layouts must avoid nested full-page scroll regions.
- Onboarding must fill available viewport height but grow naturally when browser UI reduces the visual viewport.
- Test landscape mobile and browser zoom at 200%.

## 22. Performance and reliability

- Server-render published portfolio metadata and initial content for SEO and fast first paint.
- Lazy-load below-the-fold images and video sources.
- Do not preload every video.
- Serve R2 assets through a stable HTTPS delivery domain with sensible cache headers.
- Keep public JavaScript limited to filters, modal, navigation, and video interactions.
- Add database indexes for email, slug, owner, portfolio projects, sessions, and publication revisions.
- Log server errors with request correlation IDs but redact passwords, session tokens, reset tokens, presigned URLs, and R2 secrets.
- Provide graceful retry behavior for transient MongoDB and R2 failures.

## 23. Security and privacy

- Enforce authorization server-side for every draft, project, media, preview, and publish operation.
- Sanitize all displayed user text and never render arbitrary HTML.
- Use a restrictive Content Security Policy compatible with the R2 delivery domain.
- Protect auth endpoints with rate limits and secure cookies.
- Restrict upload content types and sizes before signing.
- Use unique object keys; never trust or reuse user filenames as paths.
- Prevent SSRF in external URL validation.
- Do not include draft data in public APIs, HTML, source maps, or client bundles.
- Confirm destructive actions and require typing the portfolio name before permanent portfolio deletion.

## 24. Visual system for app surfaces

The app shell should complement Frame while remaining operational:

- Background: warm white.
- Primary text: near black.
- Secondary text: warm grey.
- Accent: muted olive for primary actions and positive status.
- Warning/unsaved: restrained amber.
- Error: accessible dark red.
- Borders: single-pixel neutral lines.
- Corner radii: small to medium; reserve full pills for compact status or segmented controls.
- Shadows: subtle and rare, mainly for floating toolbar or modal separation.
- Typography: readable sans-serif for product UI, serif display type only where it strengthens hierarchy.
- Spacing: consistent 4/8 px-derived scale with compact forms and clear section separation.

Do not use decorative gradients, glassmorphism, excessive rounded cards, large empty panels, or a mismatched grey sidebar. Controls should feel deliberately aligned, use consistent heights, and keep destructive actions visually secondary until invoked.

## 25. Testing requirements

### 25.1 Automated unit/integration coverage

- Registration validation and duplicate email handling.
- Login/session/logout behavior.
- Slug generation, reserved slugs, and collision handling.
- Portfolio field validation.
- Project category and required-field validation.
- Featured-project invariants.
- Project reordering.
- R2 authorization rejects unsupported types and oversize files.
- Media completion verifies object metadata.
- Ownership checks across portfolio, project, preview, publish, and delete operations.
- Publication snapshot isolation from subsequent draft edits.
- External URL SSRF protections.

### 25.2 End-to-end scenarios

1. Register → complete onboarding with image → publish → view public page.
2. Register → complete onboarding with MP4 → publish → play video on public page.
3. Add projects in all three categories → filter → open and close lightbox by keyboard.
4. Edit a published portfolio → confirm public page remains unchanged → publish updates.
5. Replace media → confirm old published asset remains available until republish and cleanup eligibility.
6. Simulate upload failure → retry successfully without losing form content.
7. Attempt to access another user's editor/API → receive authorization failure.
8. Verify owner-only preview cannot be opened signed out.
9. Unpublish → public route shows branded not-found → republish successfully.
10. Complete primary flows at mobile width and with keyboard only.

### 25.3 Visual acceptance

- Compare the public page at desktop and mobile widths to the Frame reference.
- No clipped forms, unexplained empty vertical space, overlapping toolbars, or double page scrollbars.
- Editor preview and public output use the same content renderer.
- Image and video aspect ratios remain stable while loading.

## 26. Acceptance criteria

The MVP is accepted only when all of the following are true:

- A person can openly register, authenticate, reset a password when email is configured, and log out.
- A new account is routed through exactly two onboarding steps.
- The exact current route sequence remains `/signup` → `/onboarding` step 1 → `/onboarding` step 2 → `/edit/{slug}?welcome=1`, with no inserted screens.
- Returning users land on `/dashboard`; portfolio rows open the editor and **New portfolio** opens the same two-step onboarding flow.
- Onboarding collects no portfolio content fields that Frame does not render.
- A creator can upload a supported image up to 15 MB or video up to 250 MB directly to R2.
- Upload credentials remain server-side and upload URLs expire.
- A creator can alternatively use a validated HTTPS image/video URL.
- The first project is automatically featured.
- The creator can add, edit, reorder, feature, duplicate, and delete projects.
- Draft changes persist in MongoDB and across devices.
- The editor accurately previews desktop, tablet, and mobile Frame output.
- Publishing creates a stable public snapshot at `/p/{slug}`.
- Draft edits do not alter the live page until republished.
- Public visitors can filter projects, open an accessible lightbox, view images, and play videos.
- Unpublishing hides the public page without deleting the draft.
- Another user cannot view or modify private draft data or media operations.
- The interface has no large blank overflow areas at standard viewport sizes.
- Core automated and end-to-end tests pass.
- The deployment lists every required environment variable and does not ship fake integrations.

## 27. Delivery checklist for Emergent

- [ ] Frontend routes and responsive UI implemented.
- [ ] Backend endpoints implemented with validation and authorization.
- [ ] MongoDB models and indexes created.
- [ ] Secure cookie authentication implemented.
- [ ] R2 presigned upload, completion verification, CORS instructions, and cleanup behavior implemented.
- [ ] Frame renderer shared by editor, preview, and public route.
- [ ] Image and video states implemented end to end.
- [ ] Draft autosave and publication snapshots implemented.
- [ ] Accessibility behaviors implemented.
- [ ] Unit, integration, and E2E tests pass.
- [ ] Preview and production environment variables documented.
- [ ] No localStorage persistence, mock auth, base64 media, hard-coded user, or fake publish path remains.

## 28. Requirements quality score

| Dimension | Score | Rationale |
|---|---:|---|
| Business clarity | 27/30 | Clear problem, target creator, goals, and success metrics; monetization intentionally outside MVP. |
| Functional completeness | 24/25 | End-to-end auth, onboarding, editor, media, publishing, and lifecycle behavior specified. |
| UX and design clarity | 19/20 | Reference-backed Frame structure, current-flow preservation contract, responsive layouts, states, and app-shell direction are explicit. |
| Technical feasibility | 15/15 | MongoDB, R2 upload flow, security, data models, environment variables, and operational boundaries defined. |
| Scope and acceptance | 10/10 | Frame-only boundary, exclusions, test scenarios, and measurable acceptance criteria confirmed. |
| **Total** | **95/100** | **Ready for a one-shot Emergent implementation.** |
