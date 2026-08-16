# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: AFM students who need a public portfolio for studio, internships, and reviews. They arrive to sign in, then publish one page of work. Recruiters and faculty may later view a public slug; that audience is secondary.

## Product Purpose

AFM Portfolio lets a student turn a headshot, a short intro, skills, and one project into a live page. Success is a shareable `/p/[slug]` that reads as their work, not as a template demo.

## Positioning

The school (AFM) is the frame: portfolios are student pages with a garden-campus identity, not a generic creator-site builder. Templates own layout; the student owns the words and photos.

## Operating Context

Journey: `/` redirects to sign-in → sign-up → project files (images, clips, optional film link) → five onboarding steps (headshot with name) → dashboard of pages → public folio (optional in-place edit). Prototype auth currently redirects without real credentials.

## Capabilities and Constraints

- Next.js App Router, shadcn (Base UI), no new dependencies for this pass.
- Screens: login, signup, onboarding (media + steps 1–5), dashboard, templates, public `p/[slug]`.
- Demo data lives in `lib/demo.ts`. Auth is a stub (`redirect`).
- Incumbent identity (binding from the product owner): olive garden `#3d4a28`, white cards, Inter + Instrument Serif, charcoal. Do not invent a purple-gradient substitute.

## Brand Commitments

Name: AFM / AFM Portfolio. Voice: calm, specific, student-facing. Binding materials: olive garden, white card, charcoal type. Asset intended: `/auth-garden.png` (campus garden still).

## Evidence on Hand

Demo portfolios (`talib`, `studio-notes`) and five taste templates (sides, light-table, pin-up, dailies, zine). No real testimonials, pricing, or school legal copy. Do not fabricate AFM claims, rankings, or recruiter quotes.

## Product Principles

- Project assets first, then copy; chrome recedes.
- One page, not a site builder.
- Same garden-and-card world from auth through onboarding; dashboard is work chrome.
- Public folio is the artifact; the app exists to get there.

## Accessibility & Inclusion

Web, English UI. Visible labels on forms. Body text contrast ≥ 4.5:1. Keyboard-focusable controls.
