---
name: AFM Portfolio — Public Folio
description: A graphite gallery walk of hung stills; five tastes recast the same rooms; garden olive stays on app chrome.
colors:
  gallery-graphite: "#1a1d22"
  gallery-panel: "#2a2e34"
  plaster-ink: "#f2ece3"
  traveling-mark: "#c45a1a"
  wall-mute: "#d2c4b4"
  gallery-night: "#2f5a46"
  ground-paper: "#163024"
  ground-panel: "#1e4a32"
  ground-mark: "#d8b25a"
  ground-mute: "#d7e4c8"
  ground-night: "#7eb56a"
  aperture-paper: "#f7f4ee"
  aperture-panel: "#ffffff"
  aperture-mute: "#4d5c52"
  window-type: "#f4f1e8"
  folio-ink: "#1c1914"
  folio-paper: "#f3ead8"
  folio-panel: "#e7d7a8"
  folio-mark: "#c4a02a"
  folio-mute: "#5c5346"
  flood-paper: "#14110e"
  flood-gold: "#e2b15c"
  flood-mute: "#e0d4c4"
typography:
  display:
    fontFamily: "Gloock, Palatino Linotype, Palatino, serif"
    fontSize: "clamp(2.1rem, 5.4vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Gloock, Palatino Linotype, Palatino, serif"
    fontSize: "clamp(1.2rem, 2vw, 1.7rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Gloock, Palatino Linotype, Palatino, serif"
    fontSize: "clamp(3.2rem, 12vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.85
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
  display-ground:
    fontFamily: "Fredoka, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.1rem, 5.4vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  display-aperture:
    fontFamily: "Libre Baskerville, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.1rem, 5.4vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  display-folio:
    fontFamily: "Bodoni Moda, Bodoni MT, Didot, serif"
    fontSize: "clamp(3.2rem, 12vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.85
    letterSpacing: "-0.04em"
  display-flood:
    fontFamily: "Archivo, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.1rem, 5.4vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.03em"
rounded:
  none: "0px"
  hang: "1.25rem"
  ground: "1.6rem"
  aperture: "2.4rem"
  pill: "999px"
spacing:
  band: "0.7rem"
  inset: "1.25rem"
  suite-gap: "1.6rem"
  suite-pad: "2.4rem"
  hang-stagger: "3.2rem"
components:
  pill-solid:
    backgroundColor: "{colors.plaster-ink}"
    textColor: "{colors.gallery-graphite}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 1.05rem"
    typography: "{typography.body}"
    height: "2.4rem"
  pill-glass:
    backgroundColor: "color-mix(in srgb, var(--taste-paper) 18%, transparent)"
    textColor: "{colors.plaster-ink}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 1.05rem"
    typography: "{typography.body}"
    height: "2.4rem"
  skip-link:
    backgroundColor: "{colors.traveling-mark}"
    textColor: "{colors.plaster-ink}"
    padding: "0.4rem 0.7rem"
    typography: "{typography.body}"
  hang-caption:
    backgroundColor: "transparent"
    textColor: "{colors.wall-mute}"
    typography: "{typography.body}"
    padding: "0.75rem 0.1rem 0"
---

# Design System: AFM Portfolio — Public Folio

## Overview

**Creative North Star: "The Graphite Gallery Walk"**

The public folio is a suite of rooms a visitor walks. The student’s still is the first wall: full-bleed, uncropped as cover, with the project title sitting in the picture and the student’s name as a corner wall-label. Below the fold, more pieces hang as rooms — large stills with captions — never as a numbered contact sheet, slideshow, or swapping frame. A traveling copper-gold band marks the floor of the first wall on Walk, Ground, and Flood.

Five tastes recast the same walk without changing its grammar: **Walk** (default, graphite gallery, Gloock), **Ground** (inhabited land, Fredoka, rounded chapters in a snap-row), **Aperture** (rounded window into the still, Libre Baskerville, type in the glass), **Folio** (magazine spread, Bodoni Moda, the name as architecture on the still), **Flood** (each piece owns a color field, Archivo). Legacy template ids map onto these five: sides → walk, light-table → aperture, pin-up → ground, dailies → flood, zine → folio (plus older developer/creative/professional aliases).

Garden olive, white cards, Inter, and Instrument Serif are app chrome (auth, onboarding, dashboard). They are not the folio world. Do not import them onto `/p/[slug]`.

**Key Characteristics:**
- One composition: first wall, then walk — five tastes, not five products
- Hung stills at walking distance; captions under the picture, not chrome around a reel
- Wall-label type for the name in the corner; display type for the work’s title in the still
- Traveling mark as a floor-band, never a numbered shot rail
- Square rooms on Walk and Flood; round windows and hangs only where Ground and Aperture recast the walk

## Colors

The folio is graphite plaster and traveling copper, recast per taste into land, paper, brass, or flooded fields. Roles live on `--taste-*` custom properties; Walk is the unset default.

### Primary
- **Traveling Mark** (`traveling-mark`): Copper-gold floor-band, caret, scrollbar thumb, skip-link, and focus ring. On Walk it is the only accent that travels. Ground recasts it as **Ground Mark**; Folio as **Folio Mark**; Flood as **Flood Gold** on a field of Traveling Mark.

### Secondary
- **Gallery Night** (`gallery-night`): Deep pine used as Flood’s even rooms and as Aperture’s mark. It is gallery pine, not garden olive.

### Neutral
- **Gallery Graphite** (`gallery-graphite`): Walk paper — the wall.
- **Gallery Panel** (`gallery-panel`): Walk secondary wall tone.
- **Plaster Ink** (`plaster-ink`): Walk/Flood type and the cream fill of solid pills on dark tastes.
- **Wall Mute** (`wall-mute`): Walk lede, hang notes, bio.
- **Ground Paper / Panel / Mute / Night**: Land recast — you stand in the picture.
- **Aperture Paper / Panel / Mute** and **Window Type**: Daylit glass; type on the still goes window-type.
- **Folio Ink / Paper / Panel / Mute**: Warm stock and brass panel for the spread.
- **Flood Paper / Mute**: Near-black rooms; odd hangs flood with Traveling Mark.

### Named Rules
**The Garden Stays Off the Folio Rule.** Olive `#3d4a28`, white cards, and charcoal app type do not appear on public taste templates. Pine on the folio is Gallery Night or Ground Paper, never garden olive.

**The One Mark Rule.** The traveling mark is a floor-band and a rare control accent (skip, focus, caret). It is not a page wash except on Flood, where the room *is* the color.

## Typography

**Display Font:** Gloock on Walk (Palatino Linotype, Palatino). Recast: Fredoka (Ground), Libre Baskerville (Aperture; Iowan Old Style, Georgia), Bodoni Moda (Folio; Bodoni MT, Didot), Archivo (Flood).
**Body Font:** Bricolage Grotesque (ui-sans-serif, system-ui) on every taste.
**Label Font:** Same body face, small, heavy, tracked, uppercase — wall-label, not a kicker over a hero.

**Character:** Wall text and hung titles. Display is the work’s name in the room; body is the note you read at walking distance.

### Hierarchy
- **Display** (400, `clamp(2.1rem, 5.4vw, 4.4rem)`, line-height 1.02, tracking `-0.03em`, max 14ch on Walk): Project title in the first still. At `max-width: 720px` it tightens to `clamp(1.8rem, 11vw, 2.6rem)`. Ground and Aperture drop the 14ch cap and center.
- **Headline** (400, `clamp(1.2rem, 2vw, 1.7rem)`, line-height 1.15): Hang titles under subsequent stills.
- **Title** (Folio only: 400, `clamp(3.2rem, 12vw, 6rem)`, line-height 0.85, tracking `-0.04em`): Student name as architecture on the still, lower-left. Hidden on every other taste.
- **Body** (400, 0.95rem, line-height 1.55): Lede (max 52ch), bio (max 62ch), hang notes (0.9rem / 1.5, max 48ch). Folio’s in-picture h1 recasts to this size so the Bodoni name can own the wall.
- **Label** (600, 0.72rem, tracking `0.08em`, uppercase): Corner name. In-page nav is 0.78rem, same body face, underline on hover.

### Named Rules
**The Wall-Label Rule.** The student’s name in the first viewport is a corner label (or, on Folio, architecture in the still). It is not a centered eyebrow, not a numbered shot id, and not the project title.

**The Work Owns Display Rule.** Display type is for the project and hang titles. Body never impersonates a poster face.

## Layout

Composition is locked as **One wall / walk-a**: a `min-height: 100svh` first window (92svh below 720px), then a suite of hangs, then an end note.

- **First wall:** Full-bleed still (`object-fit: cover`). Corner label padded `1.1rem 1.25rem`. In-picture stack padded `22svh 1.25rem 5rem` (14svh top below 720px), max `min(36rem, calc(100% - 2.4rem))`. Floor-band `0.7rem` high, origin left.
- **Walk suite:** CSS grid `1.15fr 0.85fr`, gap `1.4rem 1.6rem`, padding `2.4rem 1.25rem 3.2rem`, items end-aligned. Hang 2 drops `3.2rem`; hang 3 lifts `2.4rem` — staggered heights. Below 720px: one column, stagger cancelled.
- **Ground suite:** Horizontal snap row; hangs `flex: 0 0 min(72vw, 28rem)` (84vw on small screens).
- **Aperture:** Window `78svh` with `2.4rem` radius; hero is not full-bleed to the chrome; suite sits on paper. Band hidden.
- **Folio:** Window `70svh`, square; name overlaid; suite on Folio Panel; end on Folio Paper. Band hidden.
- **Flood:** Suite is a vertical stack of `72svh` rooms, no gap; odd rooms Traveling Mark, even Gallery Night; stills `16 / 9` centered, `min(72rem, 100%)`.
- **End:** Padding `2.2rem 1.25rem 3rem`, max `42rem`, stacked with `0.55rem` gap.

Default taste is **walk**. Unknown or legacy ids coerce through `lib/tastes.ts`.

## Elevation & Depth

Depth is hanging, not card chrome. Walk stills cast a single gallery shadow; Flood stills sit in the color field with no shadow. The floor-band carries a copper glow. Surfaces are otherwise flat fills.

### Shadow Vocabulary
- **Hung still** (`box-shadow: 8px 18px 32px rgba(8, 10, 12, 0.38)`): Walk (and default) hang images. Ground and Aperture keep the shadow and add hang radius.
- **Floor-band glow** (`box-shadow: 0 -8px 22px rgba(196, 90, 26, 0.45)`): Under the traveling mark on tastes that show the band.
- **Flood hangs:** `box-shadow: none`.

### Named Rules
**The Hang, Don’t Lift Rule.** Offset shadow belongs to a picture on a wall. Do not put the same shadow on pills, labels, or the end note.

**The Band Travels Rule.** On Walk, Ground, and Flood the mark enters as a left-origin scale (`0.9s`, `cubic-bezier(0.16, 1, 0.3, 1)`), from `scaleX(0.12)` with `blur(2px)` to full width. `prefers-reduced-motion: reduce` kills the animation. Aperture and Folio do not show a band.

## Shapes

Walk and Flood are square: `--taste-radius: 0`. Ground rounds the world (`1.6rem`) and hangs (`1.25rem`). Aperture is a round window (`2.4rem`) with the same hang radius. Folio keeps a square window even though other tastes use `--taste-radius`. Pills are full capsules (`999px`). Stills use `16 / 10` except Flood (`16 / 9`) and the hero (cover, no ratio crop in CSS).

## Components

### Pills
In-picture actions: “The pieces” (solid) and “Write {first}” (glass). Capsule, min-height `2.4rem`, padding `0.45rem 1.05rem`, `0.88rem` type, gap `0.55rem`.
- **Solid:** On Walk, Ground, and Flood: Plaster Ink on Gallery Graphite. On Aperture and Folio: ink on paper (token invert).
- **Glass:** `1px` ink at 55% on 18% paper. Centered with the stack on Ground and Aperture.

### Skip link
“The pieces”, absolutely placed, mark fill, plaster type. Enters at `top: 1rem` on focus.

### Wall label
Header over the still: name left (label type), Works / Write right. Links inherit color; underline on hover with `3px` offset. Not a site nav, not a kicker.

### First window
The still is the wall. Overlay type is plaster on Walk/Ground/Flood; Aperture and Folio force window-type on the window (lede mixed 82% toward pine). Focus-visible: `2px` solid mark, offset `3px`. Selection: mark on paper.

### Hang
Article: image then caption. Caption title is display/headline; note is mute body. Flood captions pad into the color field (`1.1rem 1.25rem 1.6rem`).

### End note
Bio, optional mailto, optional synthetic-work line (`0.72rem`, tracking `0.04em`, mute). Links underline. Folio end is full-bleed paper.

## Do's and Don'ts

### Do:
- **Do** start every public folio on a full-bleed (or taste-window) student still, then hang more pieces below.
- **Do** keep Walk as the default taste and coerce legacy ids (sides, light-table, pin-up, dailies, zine) rather than reviving those layouts.
- **Do** set the five `--taste-*` roles (ink, paper, panel, mark, mute, night, display, radius) and recast; do not invent a sixth chrome system on the folio.
- **Do** use Bricolage Grotesque for body and wall-labels on every taste; recast only `--taste-display`.
- **Do** put the traveling mark on the floor (Walk / Ground / Flood) or hide it (Aperture / Folio) — never as a numbered rail.

### Don't:
- **Don't** build a contact-sheet, slideshow, thumb strip, or a single slot that swaps stills.
- **Don't** number pieces in the UI (“01”, “Piece 2”, shot rails).
- **Don't** bring garden olive, Inter, Instrument Serif, or white dashboard cards onto the public folio.
- **Don't** treat Aperture/Folio’s hidden band as permission to drop the first wall; the still remains the room.
- **Don't** use display type for the corner name except Folio’s overlaid architecture.
