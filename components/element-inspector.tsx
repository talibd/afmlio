"use client"

import * as React from "react"
import { DialRoot, useDialKit, type DialConfig } from "dialkit"
import "dialkit/styles.css"

import { blockLabel, layoutOf } from "@/lib/blocks"
import type {
  BlockLayout,
  ElementKind,
  ElementStyle,
  FolioBlock,
  Portfolio,
} from "@/lib/demo"
import { persistImageFile } from "@/lib/image-utils"
import { styleOf } from "@/lib/elements"
import type { StoredPortfolio } from "@/lib/portfolio-store"

const KIND_TITLE: Record<ElementKind, string> = {
  heading: "Heading",
  text: "Text",
  image: "Image",
  list: "List",
  button: "Button",
  button2: "Secondary CTA",
  badge: "School badge",
}

const FACE = [
  { value: "sans", label: "Inter" },
  { value: "serif", label: "Instrument" },
]
const WEIGHT = [
  { value: "300", label: "300 Light" },
  { value: "400", label: "400 Regular" },
  { value: "500", label: "500 Medium" },
  { value: "600", label: "600 Bold" },
]
const ALIGN = [
  { value: "start", label: "Left" },
  { value: "center", label: "Center" },
  { value: "end", label: "Right" },
]
const FIT = [
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
]

function num(value: unknown, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function hex(value: string, fallback: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback
}

function px(
  value: number,
  min: number,
  max: number,
  step: number,
): [number, number, number, number] {
  return [value, min, max, step]
}

function copyFor(block: FolioBlock, kind: ElementKind, portfolio?: Portfolio) {
  if (kind === "heading") return block.heading
  if (kind === "button") return block.cta ?? ""
  if (kind === "button2") return block.cta2 ?? ""
  if (kind === "badge") return portfolio?.school ?? ""
  if (kind === "list") {
    const items = block.items?.length ? block.items : (portfolio?.skills ?? [])
    return items.join(
      items.some((item) => item.includes("|")) ? "\n" : ", ",
    )
  }
  return block.body
}

function makeElementConfig(
  block: FolioBlock,
  kind: ElementKind,
  portfolio?: Portfolio,
): DialConfig {
  const style = styleOf(block, kind)
  const copy = copyFor(block, kind, portfolio)

  if (kind === "image") {
    return {
      alt: { type: "text", default: block.imageAlt ?? "", placeholder: "Alt text" },
      fit: {
        type: "select",
        options: FIT,
        default: style.imageFit ?? "cover",
      },
      radius: px(style.imageRadius ?? 32, 0, 64, 2),
      replace: { type: "action", label: "Replace image" },
      done: { type: "action", label: "Done" },
    }
  }

  const hrefDefault =
    kind === "button"
      ? block.ctaHref ?? "#cta"
      : kind === "button2"
        ? block.cta2Href ?? "#features"
        : ""

  return {
    copy: { type: "text", default: copy, placeholder: "Copy" },
    ...(kind === "button" || kind === "button2"
      ? { href: { type: "text", default: hrefDefault, placeholder: "Link URL" } }
      : {}),
    color: {
      customColor: Boolean(style.color),
      text: { type: "color" as const, default: hex(style.color, "#f2ece3") },
      fillBg: Boolean(style.bg),
      bg: { type: "color" as const, default: hex(style.bg, "#000000") },
      ...(kind === "button" || kind === "button2"
        ? {
            hoverBg: {
              type: "color" as const,
              default: hex(style.hoverBg, "#3d4a28"),
            },
          }
        : {}),
    },
    options: {
      face: { type: "select" as const, options: FACE, default: style.face },
      weight: {
        type: "select" as const,
        options: WEIGHT,
        default: style.weight,
      },
      size: px(style.size, 10, 120, 1),
      lineHeight: px(style.lineHeight ?? 1.4, 1, 2.4, 0.05),
      tracking: px(style.tracking, -8, 12, 0.1),
      textAlign: {
        type: "select" as const,
        options: ALIGN,
        default: style.align,
      },
      italic: style.italic,
      uppercase: style.uppercase,
      underline: style.underline ?? false,
      ...(kind === "button" || kind === "button2"
        ? {
            buttonRadius: px(style.buttonRadius ?? 999, 0, 48, 2),
            buttonPadX: px(style.buttonPadX ?? 20, 8, 48, 2),
            buttonPadY: px(style.buttonPadY ?? 12, 4, 32, 2),
          }
        : {}),
    },
    done: { type: "action" as const, label: "Done" },
  }
}

function styleFromDial(
  values: Record<string, unknown>,
  style: ElementStyle,
  kind: ElementKind,
): ElementStyle {
  const color = (values.color ?? {}) as Record<string, unknown>
  const options = (values.options ?? {}) as Record<string, unknown>
  return {
    face: (options.face as ElementStyle["face"]) ?? style.face,
    size: num(options.size, style.size),
    weight: String(options.weight || style.weight) as ElementStyle["weight"],
    align: (options.textAlign as ElementStyle["align"]) ?? style.align,
    italic: Boolean(options.italic),
    uppercase: Boolean(options.uppercase),
    underline: Boolean(options.underline),
    tracking: num(options.tracking, style.tracking),
    lineHeight: num(options.lineHeight, style.lineHeight ?? 1.4),
    color: color.customColor ? String(color.text ?? style.color) : "",
    bg: color.fillBg ? String(color.bg ?? "") : "",
    hoverBg: String(color.hoverBg ?? style.hoverBg),
    buttonRadius:
      kind === "button" || kind === "button2"
        ? num(options.buttonRadius, style.buttonRadius ?? 999)
        : style.buttonRadius,
    buttonPadX:
      kind === "button" || kind === "button2"
        ? num(options.buttonPadX, style.buttonPadX ?? 20)
        : style.buttonPadX,
    buttonPadY:
      kind === "button" || kind === "button2"
        ? num(options.buttonPadY, style.buttonPadY ?? 12)
        : style.buttonPadY,
    imageFit: style.imageFit,
    imageRadius: style.imageRadius,
  }
}

function ElementDial({
  block,
  portfolio,
  kind,
  onClose,
  onPatch,
  onPatchPortfolio,
}: {
  block: FolioBlock
  portfolio?: StoredPortfolio
  kind: ElementKind
  onClose: () => void
  onPatch: (partial: Partial<FolioBlock>) => void
  onPatchPortfolio?: (patch: Partial<StoredPortfolio>) => void
}) {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const blockRef = React.useRef(block)
  const onPatchRef = React.useRef(onPatch)
  const onPatchPortfolioRef = React.useRef(onPatchPortfolio)

  React.useEffect(() => {
    blockRef.current = block
    onPatchRef.current = onPatch
    onPatchPortfolioRef.current = onPatchPortfolio
  })

  const config = React.useMemo(
    () => makeElementConfig(block, kind, portfolio),
    [block, kind, portfolio],
  )
  const values = useDialKit(KIND_TITLE[kind], config, {
    id: `${block.id}-${kind}`,
    onAction: (action) => {
      if (action === "done") onClose()
      if (action === "replace") fileRef.current?.click()
    },
  }) as Record<string, unknown>

  const serialized = JSON.stringify(values)
  const initialRef = React.useRef(serialized)
  React.useEffect(() => {
    if (initialRef.current === serialized) return
    const currentBlock = blockRef.current
    const parsed = JSON.parse(serialized) as Record<string, unknown>
    const style = styleFromDial(parsed, styleOf(currentBlock, kind), kind)
    const copy = String(parsed.copy ?? "")
    const next: Partial<FolioBlock> = {}

    if (kind === "image") {
      next.imageAlt = String(parsed.alt ?? "")
      next.bodyStyle = {
        ...styleOf(currentBlock, "text"),
        imageFit: (parsed.fit as ElementStyle["imageFit"]) ?? "cover",
        imageRadius: num(parsed.radius, 32),
      }
      onPatchRef.current(next)
      return
    }

    if (kind === "heading") {
      next.heading = copy
      next.headingStyle = style
      if (currentBlock.type === "hero") {
        onPatchPortfolioRef.current?.({ title: copy })
      }
    } else if (kind === "text") {
      next.body = copy
      next.bodyStyle = style
      if (currentBlock.type === "hero" || currentBlock.type === "about") {
        onPatchPortfolioRef.current?.({ bio: copy })
      }
    } else if (kind === "button") {
      next.cta = copy
      next.ctaHref = String(parsed.href ?? currentBlock.ctaHref ?? "#cta")
      next.buttonStyle = style
    } else if (kind === "button2") {
      next.cta2 = copy
      next.cta2Href = String(parsed.href ?? currentBlock.cta2Href ?? "#features")
      next.buttonStyle = style
    } else if (kind === "badge") {
      onPatchPortfolioRef.current?.({ school: copy })
      return
    } else if (kind === "list") {
      const raw = copy.includes("\n") ? copy.split("\n") : copy.split(",")
      next.items = raw.map((item) => item.trim()).filter(Boolean)
      next.bodyStyle = style
    }
    onPatchRef.current(next)
  }, [serialized, kind])

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          void persistImageFile(file).then((dataUrl) => {
            if (dataUrl) onPatch({ image: dataUrl })
          })
        }}
      />
      <DialRoot position="top-right" theme="light" productionEnabled defaultOpen />
    </>
  )
}

function makeLayoutConfig(block: FolioBlock): DialConfig {
  const layout = layoutOf(block)
  return {
    maxWidth: px(layout.maxWidth, 480, 1280, 8),
    align: {
      type: "select",
      options: ALIGN,
      default: layout.align,
    },
    padT: px(layout.padT, 0, 200, 4),
    padR: px(layout.padR, 0, 200, 4),
    padB: px(layout.padB, 0, 200, 4),
    padL: px(layout.padL, 0, 200, 4),
    gap: px(layout.gap, 0, 80, 2),
    hidden: block.hidden,
    done: { type: "action", label: "Done" },
  }
}

function layoutFromDial(
  values: Record<string, unknown>,
  current: BlockLayout,
): BlockLayout {
  return {
    maxWidth: num(values.maxWidth, current.maxWidth),
    align: (values.align as BlockLayout["align"]) ?? current.align,
    padT: num(values.padT, current.padT),
    padR: num(values.padR, current.padR),
    padB: num(values.padB, current.padB),
    padL: num(values.padL, current.padL),
    gap: num(values.gap, current.gap),
  }
}

function LayoutDial({
  block,
  onClose,
  onPatch,
}: {
  block: FolioBlock
  onClose: () => void
  onPatch: (partial: Partial<FolioBlock>) => void
}) {
  const blockRef = React.useRef(block)
  const onPatchRef = React.useRef(onPatch)

  React.useEffect(() => {
    blockRef.current = block
    onPatchRef.current = onPatch
  })

  const config = React.useMemo(() => makeLayoutConfig(block), [block])
  const values = useDialKit(`${blockLabel(block.type)} layout`, config, {
    id: `${block.id}-layout`,
    onAction: (action) => {
      if (action === "done") onClose()
    },
  }) as Record<string, unknown>

  const serialized = JSON.stringify(values)
  const initialRef = React.useRef(serialized)
  React.useEffect(() => {
    if (initialRef.current === serialized) return
    const currentBlock = blockRef.current
    const parsed = JSON.parse(serialized) as Record<string, unknown>
    onPatchRef.current({
      layout: layoutFromDial(parsed, layoutOf(currentBlock)),
      hidden: Boolean(parsed.hidden),
    })
  }, [serialized])

  return <DialRoot position="top-right" theme="light" productionEnabled defaultOpen />
}

export function ElementInspector({
  block,
  portfolio,
  kind,
  onClose,
  onPatch,
  onPatchPortfolio,
}: {
  block: FolioBlock
  portfolio?: StoredPortfolio
  kind: ElementKind
  onClose: () => void
  onPatch: (partial: Partial<FolioBlock>) => void
  onPatchPortfolio?: (patch: Partial<StoredPortfolio>) => void
}) {
  return (
    <ElementDial
      key={`${block.id}-${kind}`}
      block={block}
      portfolio={portfolio}
      kind={kind}
      onClose={onClose}
      onPatch={onPatch}
      onPatchPortfolio={onPatchPortfolio}
    />
  )
}

export function BlockLayoutInspector({
  block,
  onClose,
  onPatch,
}: {
  block: FolioBlock
  onClose: () => void
  onPatch: (partial: Partial<FolioBlock>) => void
}) {
  return (
    <LayoutDial
      key={`${block.id}-layout`}
      block={block}
      onClose={onClose}
      onPatch={onPatch}
    />
  )
}
