import type { CSSProperties } from "react"

import type {
  BlockType,
  ElementKind,
  ElementStyle,
  FolioBlock,
} from "@/lib/demo"
import { cn } from "@/lib/utils"

export function defaultStyle(
  partial: Partial<ElementStyle> = {},
): ElementStyle {
  return {
    face: "sans",
    size: 16,
    weight: "400",
    align: "start",
    italic: false,
    uppercase: false,
    tracking: 0,
    lineHeight: undefined,
    underline: false,
    color: "",
    bg: "",
    hoverBg: "",
    buttonRadius: undefined,
    buttonPadX: undefined,
    buttonPadY: undefined,
    imageRadius: undefined,
    imageFit: undefined,
    ...partial,
  }
}

export function elementsOf(type: BlockType): { kind: ElementKind; label: string }[] {
  if (type === "hero") {
    return [
      { kind: "badge", label: "School badge" },
      { kind: "heading", label: "Heading" },
      { kind: "text", label: "Text" },
      { kind: "image", label: "Image" },
      { kind: "button", label: "Primary CTA" },
      { kind: "button2", label: "Secondary CTA" },
    ]
  }
  if (type === "about") {
    return [
      { kind: "heading", label: "Heading" },
      { kind: "text", label: "Text" },
      { kind: "image", label: "Image" },
      { kind: "button", label: "Button" },
    ]
  }
  if (type === "still") {
    return [
      { kind: "image", label: "Image" },
      { kind: "heading", label: "Heading" },
      { kind: "text", label: "Text" },
    ]
  }
  if (type === "skills" || type === "partners") {
    return [
      { kind: "heading", label: "Heading" },
      { kind: "text", label: "Text" },
      { kind: "list", label: "List" },
    ]
  }
  if (type === "featured" || type === "features") {
    return [
      { kind: "heading", label: "Heading" },
      { kind: "text", label: "Text" },
      { kind: "image", label: "Image" },
      { kind: "list", label: "List" },
      { kind: "button", label: "Button" },
    ]
  }
  if (type === "why" || type === "reviews" || type === "faq") {
    return [
      { kind: "heading", label: "Heading" },
      { kind: "text", label: "Text" },
      { kind: "list", label: "List" },
    ]
  }
  if (type === "cta" || type === "contact") {
    return [
      { kind: "heading", label: "Heading" },
      { kind: "text", label: "Text" },
      { kind: "button", label: "Button" },
    ]
  }
  if (type === "footer") {
    return [
      { kind: "heading", label: "Heading" },
      { kind: "text", label: "Text" },
      { kind: "list", label: "Links" },
      { kind: "button", label: "Button" },
    ]
  }
  return [
    { kind: "heading", label: "Heading" },
    { kind: "text", label: "Text" },
  ]
}

export function styleOf(block: FolioBlock, kind: ElementKind): ElementStyle {
  if (kind === "heading") return block.headingStyle ?? defaultStyle({ face: "serif", size: 56, tracking: -2 })
  if (kind === "button" || kind === "button2") return block.buttonStyle ?? defaultStyle({ size: 14, weight: "600" })
  return block.bodyStyle ?? defaultStyle({ size: 15, weight: "400" })
}

export function styleClass(style: ElementStyle) {
  const weight = String(style.weight)
  return cn(
    style.face === "serif" ? "font-serif" : "font-sans",
    weight === "300" && "font-light",
    weight === "400" && "font-normal",
    weight === "500" && "font-medium",
    weight === "600" && "font-semibold",
    style.align === "center" && "text-center",
    style.align === "end" && "text-right",
    style.italic && "italic",
    style.uppercase && "uppercase",
    style.underline && "underline",
  )
}

export function styleVars(style: ElementStyle): CSSProperties {
  const weight = Number(style.weight)
  return {
    color: style.color || undefined,
    backgroundColor: style.bg || undefined,
    fontSize: `${style.size}px`,
    fontWeight: Number.isFinite(weight) ? weight : 400,
    letterSpacing: `${style.tracking}px`,
    lineHeight: style.lineHeight ? `${style.lineHeight}` : undefined,
    borderRadius: style.buttonRadius ? `${style.buttonRadius}px` : undefined,
    paddingInline: style.buttonPadX ? `${style.buttonPadX}px` : undefined,
    paddingBlock: style.buttonPadY ? `${style.buttonPadY}px` : undefined,
    ["--hover-bg" as string]: style.hoverBg || undefined,
  }
}

export function imageStyleVars(style: ElementStyle): CSSProperties {
  return {
    objectFit: style.imageFit ?? "cover",
    borderRadius: style.imageRadius ? `${style.imageRadius}px` : undefined,
  }
}
