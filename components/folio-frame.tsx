"use client"

import * as React from "react"

import { layoutOf } from "@/lib/blocks"
import { type ElementKind, type FolioBlock } from "@/lib/demo"
import { cn } from "@/lib/utils"

export function Img({
  src,
  alt,
  className,
  style,
}: {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} style={style} />
  )
}

export function bindHit(
  kind: ElementKind,
  selectedKind?: ElementKind | null,
  onSelect?: (kind: ElementKind) => void,
) {
  if (!onSelect) return {}
  return {
    onClick: (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      onSelect(kind)
    },
    className: cn(
      "cursor-pointer rounded-sm outline outline-1 outline-offset-2 outline-transparent transition-[outline-color] duration-150 hover:outline-primary/55",
      selectedKind === kind && "outline-primary hover:outline-primary",
    ),
  }
}

export function Frame({
  block,
  className,
  id,
  children,
}: {
  block: FolioBlock
  className?: string
  id?: string
  children: React.ReactNode
}) {
  const layout = layoutOf(block)
  return (
    <section
      id={id}
      className={className}
      style={{
        padding: `${layout.padT}px ${layout.padR}px ${layout.padB}px ${layout.padL}px`,
      }}
    >
      <div
        className={cn(
          "flex w-full flex-col",
          layout.align === "center" && "mx-auto items-center text-center",
          layout.align === "end" && "ml-auto items-end text-right",
        )}
        style={{ maxWidth: layout.maxWidth, gap: layout.gap }}
      >
        {children}
      </div>
    </section>
  )
}

export function Cta({
  href,
  label,
  className,
  style,
  onClick,
}: {
  href: string
  label: string
  className?: string
  style?: React.CSSProperties
  onClick?: (event: React.MouseEvent) => void
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-11 items-center gap-1.5 rounded-full px-5 hover:bg-(--hover-bg)",
        className,
      )}
      style={style}
      onClick={onClick}
    >
      {label}
      <span aria-hidden>↗</span>
    </a>
  )
}
