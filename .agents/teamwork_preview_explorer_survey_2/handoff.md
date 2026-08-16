# Handoff Report: Requirement 2 (Reference-Based Template Integration)

**Author**: Explorer 2 (Survey Phase)  
**Task ID**: Requirement 2 Survey  
**Date**: 2026-08-16  
**Working Directory**: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_explorer_survey_2`  
**Report File**: `c:\Users\talib\OneDrive\Documents\my apps\afmlio\.agents\teamwork_preview_explorer_survey_2\analysis.md`

---

## 1. Observation

1. **HTML Reference (`C:/Users/talib/Downloads/frame-ai-simple-portfolio.html`)**:
   - Variables (lines 8): `:root{--bg:#fff;--text:#111;--muted:#777;--line:#e8e8e8;--accent:#dfff45}`.
   - Body font (line 9): `font-family:Arial,Helvetica,sans-serif`.
   - Layout container (line 9): `.container{width:min(1100px,calc(100% - 40px));margin:auto}`.
   - Nav (line 10, 23): `.logo` with `font-family:Georgia,serif;font-size:20px`, `.links` with `font-size:12px`, `.contact` with `font-size:11px;background:#111;color:#fff`.
   - Hero (line 11, 24): `h1` with `font-family:Georgia,serif;font-size:clamp(55px,8vw,100px);font-weight:400;line-height:.9;letter-spacing:-.07em;` with `h1 span{color:#888}`.
   - Featured project (line 12, 24): `.featured` with `aspect-ratio:2/1`, `.featured-title` with `font-family:Georgia,serif;font-size:32px`, `.featured-meta` with `01 / 06`.
   - Work section (lines 13, 25–32): `.section-title` with `Georgia,serif;font-size:48px`, `.filters` with `.filter.active{background:#111;color:#fff}`, 2-column `.grid` of `.card` with `aspect-ratio:1.3/1` image and `.card-title` (`Georgia, 20px`) and `.card-type` (`9px uppercase #888`).
   - About section (lines 14, 33): 2-column `.about-grid` with `h2` (`Georgia 52px`) and `p` (`max-width:520px;color:#666;font-size:14px;line-height:1.8`).
   - CTA section (lines 15, 34): `h2` (`Georgia clamp(50px,7vw,80px)`), `h2 span{background:var(--accent);padding:0 5px}`, `a` with `background:#111;color:#fff`.
   - Footer (lines 16, 35): `border-top:1px solid var(--line);padding:20px 0;display:flex;justify-content:space-between;color:#888;font-size:10px`.
   - Modal Lightbox (lines 17, 37, 39): `.modal` with fixed overlay, `.modal-box`, `.modal-image`, `.modal-info` (`h3` title, `p` desc), close button (`×`), ESC handler.

2. **Template Registry (`lib/tastes.ts`)**:
   - Lines 1–8: `TASTE_IDS = ["frame", "walk", "ground", "aperture", "folio", "flood"] as const`.
   - Lines 23–27: `coerceTemplate` returns `"frame"` as default.
   - Lines 38–42: `TEMPLATES` contains `{ id: "frame", name: "Frame", blurb: "Editorial AI archive. Clean grid, category filters, and electric accents." }`.
   - Lines 79–122: `STUDENT_WORK` contains the 6 reference items ("After Tomorrow", "Maison Noire", "Synthetic Nature", "Human / Machine", "Parallel", "Future Product").
   - Lines 124–131: `PROJECT_SRC.frame` points to `"https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1800&q=90"`.

3. **Block Engine (`lib/blocks.ts`)**:
   - Lines 13–27: `BLOCK_CATALOG` defines `hero`, `partners`, `features`, `why`, `reviews`, `faq`, `cta`, `footer`, `still`, `skills`, `about`, `featured`, `contact`.
   - Lines 123–212: `createBlock` seeds initial block state from `Portfolio` fields.

4. **Taste Folio Rendering (`components/taste-folio.tsx`)**:
   - Lines 63–103: `extractFramePieces` extracts pieces from `portfolio.media.stills`, block images, or fallbacks to `STUDENT_WORK`.
   - Lines 105–753: `FrameFolio` implements the complete layout matching the reference file with interactive category filter tabs, lightbox modal, custom blocks (`skills`, `why`, `reviews`, `faq`, `still`), About 2-column layout, and CTA with `.taste-frame-accent`.
   - Lines 773–784: `TasteFolio` dispatches directly to `FrameFolio` for `template === "frame"`.

5. **Style Engine (`app/tastes.css`)**:
   - Lines 48–59: `.taste[data-taste="frame"]` defines CSS variables matching the reference (`--taste-accent: #dfff45`, `--taste-line: #e8e8e8`, etc.).
   - Lines 522–974: Scoped styles `.taste-frame-*` implement nav, hero, 2:1 featured banner, filters, 2-column work grid, about section, CTA, footer, modal lightbox, and mobile breakpoint `@media (max-width: 700px)`.

6. **Canvas & Public Route Views (`components/folio-view.tsx`, `components/portfolio-public-view.tsx`, `app/p/[slug]/page.tsx`)**:
   - `FolioCanvas` and `FolioView` both route to `TasteFolio`.
   - `app/p/[slug]/page.tsx` renders `PortfolioPublicView` and `PortfolioDraftPreview`.

7. **Build Validation**:
   - `npm run build` completed with exit code `0` (Turbopack, TypeScript 0 errors, all 9 routes generated).

---

## 2. Logic Chain

1. **Reference Fidelity**: Observations 1 and 5 show that the reference HTML layout, typography (`Georgia` + `Arial`), color variables (`--accent: #dfff45`), component structures (Nav, Hero, Featured 2:1, Work Grid, Lightbox Modal, 2-column About, Accent CTA, Footer), and responsive media query (`max-width: 700px`) are precisely mapped into `FrameFolio` in `components/taste-folio.tsx` and `app/tastes.css`.
2. **Dynamic Data Binding**: Observations 2, 3, and 4 establish that the `Portfolio` data structure drives `FrameFolio` dynamically:
   - Profile/branding: `portfolio.school` / `portfolio.name` -> Nav Logo, Footer.
   - Hero: `heroBlock.heading`, `heroBlock.body`, `heroBlock.cta` -> Hero headline, subcopy, and action button.
   - Work Gallery: `portfolio.media.stills` and block images -> Selected Work grid with automatic category extraction, dynamic filters, and modal view.
   - Philosophy/About: `aboutBlock.heading` and `aboutBlock.body` (or `portfolio.bio`) -> 2-column About section.
   - Contact/CTA: `contactBlock.heading`, `contactBlock.body`, `contactBlock.cta` (with `portfolio.settings.email`) -> CTA section.
   - Dynamic Blocks: When users add `skills`, `why`, `reviews`, `faq`, or `still` blocks, `FrameFolio` renders them with matching Georgia serif aesthetics.
3. **Editor Live Preview & Public Parity**: Observation 6 demonstrates that both the editor canvas (`FolioCanvas`) and the public route (`FolioView`) call `TasteFolio`, ensuring changes in the editor sidebar immediately reflect in the preview and match the public `/p/[slug]` output.
4. **Build Integrity**: Observation 7 confirms the codebase builds cleanly without TypeScript or bundler errors.

---

## 3. Caveats

- In the original `taste-folio.tsx`, element/block hit testing helpers (`hitHelper`, `blockHitHelper`) are wired for canvas inspector selection. When Requirement 1 disables DialKit inspector and makes the canvas read-only live preview, these hit helpers become inactive (or can be decoupled cleanly), which is fully compatible with `FrameFolio`.
- No additional caveats.

---

## 4. Conclusion

Requirement 2 (Reference-Based Template Integration) is fully analyzed, and the architectural foundation for the Frame template is complete and verified:
- Template ID `"frame"` is registered and set as the default taste in `lib/tastes.ts`.
- Component `FrameFolio` in `components/taste-folio.tsx` faithfully reproduces the HTML reference with dynamic data extraction, filtering, and modal capabilities.
- Scoped styling in `app/tastes.css` implements all design tokens, accent highlights, and responsive layouts.
- Dynamic data binding connects all `Portfolio` fields (`hero`, `about`, `cta`, `skills`, `media.stills`, `settings.email`) seamlessly.
- Visual parity between editor live preview canvas and public routes (`/p/[slug]`) is guaranteed through `TasteFolio`.

---

## 5. Verification Method

1. **Build Validation**:
   - Command: `npm run build`
   - Expected Result: Exit code `0`, 0 TypeScript errors.
2. **Editor Live Preview Verification**:
   - Inspect `components/folio-view.tsx` line 30 to confirm `FolioCanvas` delegates to `TasteFolio(template="frame")`.
3. **Public Route Verification**:
   - Inspect `app/p/[slug]/page.tsx` and `components/portfolio-public-view.tsx` to confirm public routes render `FolioView(template="frame")`.
4. **Reference HTML Match Verification**:
   - Compare `C:/Users/talib/Downloads/frame-ai-simple-portfolio.html` with `components/taste-folio.tsx` lines 105–753 and `app/tastes.css` lines 522–974.
