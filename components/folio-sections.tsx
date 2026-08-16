"use client"

import * as React from "react"
import { toast } from "sonner"

import { Cta, Frame, Img, bindHit } from "@/components/folio-frame"
import { PEER_AVATARS, type ElementKind, type FolioBlock, type Portfolio } from "@/lib/demo"
import { defaultChrome } from "@/lib/portfolio-store"
import { styleClass, styleOf, styleVars } from "@/lib/elements"
import { cn } from "@/lib/utils"

function pipe(item: string, count: number) {
  const bits = item.split("|").map((part) => part.trim())
  while (bits.length < count) bits.push("")
  return bits
}

function hits(
  selectedKind?: ElementKind | null,
  onSelect?: (kind: ElementKind) => void,
) {
  return (kind: ElementKind) => bindHit(kind, selectedKind, onSelect)
}

const CARD = "rounded-[2rem]"
const ICONS = ["⌘", "◇", "▣", "✦"]

export function PartnersBlock({
  block,
  ink,
  selectedKind,
  onSelectElement,
}: {
  block: FolioBlock
  ink: boolean
  selectedKind?: ElementKind | null
  onSelectElement?: (kind: ElementKind) => void
}) {
  const heading = styleOf(block, "heading")
  const hit = hits(selectedKind, onSelectElement)
  const headingHit = hit("heading")
  const listHit = hit("list")
  const items = block.items.length ? block.items : ["TypeScript", "React", "Node.js", "SQL", "Figma"]
  return (
    <Frame block={block} id="partners">
      <p
        className={cn("text-[13px] tracking-wide", styleClass(heading), headingHit.className)}
        style={{ ...styleVars(heading), fontSize: 13 }}
        onClick={headingHit.onClick}
      >
        {block.body || block.heading}
      </p>
      <ul
        className={cn("grid w-full grid-cols-2 gap-3 sm:grid-cols-5", listHit.className)}
        onClick={listHit.onClick}
      >
        {items.slice(0, 5).map((skill) => (
          <li
            key={skill}
            className={cn(
              "flex min-h-24 items-center justify-center px-3 text-center text-[14px] font-medium",
              CARD,
              ink
                ? "border border-white/10 bg-white/5 text-white"
                : "border border-black/[0.06] bg-neutral-50 text-neutral-800",
            )}
          >
            {skill}
          </li>
        ))}
      </ul>
    </Frame>
  )
}

export function FeaturesBlock({
  block,
  ink,
  selectedKind,
  onSelectElement,
}: {
  block: FolioBlock
  ink: boolean
  selectedKind?: ElementKind | null
  onSelectElement?: (kind: ElementKind) => void
}) {
  const heading = styleOf(block, "heading")
  const body = styleOf(block, "text")
  const hit = hits(selectedKind, onSelectElement)
  const headingHit = hit("heading")
  const listHit = hit("list")
  const imageHit = hit("image")
  const items = block.items.length ? block.items : []
  const card = ink ? "border border-white/10 bg-white/5" : "border border-black/[0.06] bg-neutral-50"
  return (
    <Frame block={block} id="features">
      <h2
        className={cn("max-w-xl text-center", styleClass(heading), headingHit.className)}
        style={styleVars(heading)}
        onClick={headingHit.onClick}
      >
        {block.heading}
      </h2>
      <div
        className={cn("grid w-full gap-3 md:grid-cols-6 md:grid-rows-2", listHit.className)}
        onClick={listHit.onClick}
      >
        {items.slice(0, 6).map((item, index) => {
          const [title, copy] = pipe(item, 2)
          const big = index === 0
          return (
            <article
              key={title || index}
              className={cn(
                "flex flex-col overflow-hidden p-6 text-left",
                CARD,
                card,
                big && "md:col-span-4 md:row-span-2",
                index === 1 && "md:col-span-2",
                index === 2 && "md:col-span-2",
                index === 3 && "md:col-span-6",
              )}
            >
              {big && block.image ? (
                <div
                  className={cn("mb-5 overflow-hidden rounded-[1.5rem]", imageHit.className)}
                  onClick={imageHit.onClick}
                >
                  <Img src={block.image} alt="" className="aspect-[16/10] w-full object-cover" />
                </div>
              ) : null}
              <h3
                className={cn(
                  "font-serif text-2xl tracking-tight",
                  listHit.className,
                )}
                onClick={listHit.onClick}
              >
                {title}
              </h3>
              <p
                className={cn("mt-2 max-w-lg leading-6", styleClass(body))}
                style={styleVars(body)}
              >
                {copy}
              </p>
            </article>
          )
        })}
      </div>
    </Frame>
  )
}

export function WhyBlock({
  block,
  ink,
  selectedKind,
  onSelectElement,
}: {
  block: FolioBlock
  ink: boolean
  selectedKind?: ElementKind | null
  onSelectElement?: (kind: ElementKind) => void
}) {
  const heading = styleOf(block, "heading")
  const body = styleOf(block, "text")
  const hit = hits(selectedKind, onSelectElement)
  const headingHit = hit("heading")
  const listHit = hit("list")
  const card = ink ? "border border-white/10 bg-white/5" : "border border-black/[0.06] bg-neutral-50"
  return (
    <Frame block={block} id="why">
      <h2
        className={cn("text-center", styleClass(heading), headingHit.className)}
        style={styleVars(heading)}
        onClick={headingHit.onClick}
      >
        {block.heading}
      </h2>
      <ul
        className={cn("grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4", listHit.className)}
        onClick={listHit.onClick}
      >
        {block.items.slice(0, 6).map((item, index) => {
          const [title, copy] = pipe(item, 2)
          const icon = block.itemIcons?.[index] ?? ICONS[index] ?? "•"
          return (
            <li key={title || index} className={cn("flex flex-col gap-3 p-6 text-left", CARD, card)}>
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full text-[15px]",
                  ink ? "bg-white/10" : "bg-[#3d4a28]/10 text-[#3d4a28]",
                  listHit.className,
                )}
                onClick={listHit.onClick}
                aria-hidden
              >
                {icon}
              </span>
              <h3 className="font-medium">{title}</h3>
              <p className={cn("leading-6", styleClass(body))} style={styleVars(body)}>
                {copy}
              </p>
            </li>
          )
        })}
      </ul>
    </Frame>
  )
}

export function ReviewsBlock({
  block,
  ink,
  selectedKind,
  onSelectElement,
}: {
  block: FolioBlock
  ink: boolean
  selectedKind?: ElementKind | null
  onSelectElement?: (kind: ElementKind) => void
}) {
  const heading = styleOf(block, "heading")
  const body = styleOf(block, "text")
  const hit = hits(selectedKind, onSelectElement)
  const headingHit = hit("heading")
  const listHit = hit("list")
  const card = ink ? "border border-white/10 bg-white/5" : "border border-black/[0.06] bg-neutral-50"
  return (
    <Frame block={block} id="reviews">
      <h2
        className={cn("text-center", styleClass(heading), headingHit.className)}
        style={styleVars(heading)}
        onClick={headingHit.onClick}
      >
        {block.heading}
      </h2>
      <ul
        className={cn("grid w-full gap-3 md:grid-cols-3", listHit.className)}
        onClick={listHit.onClick}
      >
        {block.items.slice(0, 6).map((item, index) => {
          const [quote, name, role, avatar] = pipe(item, 4)
          const avatarSrc = avatar || PEER_AVATARS[index % PEER_AVATARS.length]
          return (
            <li key={name || index} className={cn("flex flex-col gap-4 p-6 text-left", CARD, card)}>
              <p className="text-[13px] tracking-widest text-[#3d4a28]" aria-label="5 stars">
                ★★★★★
              </p>
              <p className={cn("leading-6", styleClass(body))} style={styleVars(body)}>
                “{quote}”
              </p>
              <div className="mt-auto flex items-center gap-3">
                <Img
                  src={avatarSrc}
                  alt={name}
                  className="size-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-[14px] font-medium">{name}</p>
                  <p className="text-[12px] text-neutral-500">{role}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </Frame>
  )
}

export function FaqBlock({
  block,
  ink,
  selectedKind,
  onSelectElement,
}: {
  block: FolioBlock
  ink: boolean
  selectedKind?: ElementKind | null
  onSelectElement?: (kind: ElementKind) => void
}) {
  const heading = styleOf(block, "heading")
  const body = styleOf(block, "text")
  const hit = hits(selectedKind, onSelectElement)
  const headingHit = hit("heading")
  const [open, setOpen] = React.useState(0)
  const items = block.items.slice(0, 6)
  return (
    <Frame block={block} id="faq">
      <div className="grid w-full items-start gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:text-left">
        <h2
          className={cn("md:text-left", styleClass(heading), headingHit.className)}
          style={styleVars(heading)}
          onClick={headingHit.onClick}
        >
          {block.heading}
        </h2>
        <div>
          {items.map((item, index) => {
            const [question, answer] = pipe(item, 2)
            const expanded = open === index
            const panelId = `${block.id}-panel-${index}`
            const buttonId = `${block.id}-q-${index}`
            return (
              <div
                key={buttonId}
                className={cn(
                  "border-b",
                  ink ? "border-white/10" : "border-black/10",
                )}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left text-[16px] font-medium"
                    onClick={(event) => {
                      event.stopPropagation()
                      setOpen(expanded ? -1 : index)
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation()
                      onSelectElement?.("list")
                    }}
                  >
                    {question}
                    <span aria-hidden className="text-xl font-light leading-none">
                      {expanded ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!expanded}
                  className="pb-4"
                >
                  <p className={cn("leading-6", styleClass(body))} style={styleVars(body)}>
                    {answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Frame>
  )
}

export function CtaBand({
  block,
  ink,
  selectedKind,
  onSelectElement,
}: {
  block: FolioBlock
  ink: boolean
  selectedKind?: ElementKind | null
  onSelectElement?: (kind: ElementKind) => void
}) {
  const heading = styleOf(block, "heading")
  const body = styleOf(block, "text")
  const button = styleOf(block, "button")
  const hit = hits(selectedKind, onSelectElement)
  const headingHit = hit("heading")
  const bodyHit = hit("text")
  const buttonHit = hit("button")
  return (
    <Frame block={block} id="cta">
      <div
        className={cn(
          "relative w-full overflow-hidden px-8 py-12 text-left sm:px-12",
          CARD,
          ink ? "bg-white/8" : "bg-[#3d4a28] text-white",
        )}
      >
        <div
          className="pointer-events-none absolute -right-8 top-1/2 size-40 -translate-y-1/2 rounded-full bg-white/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-16 top-8 size-24 rounded-[2rem] bg-white/20"
          aria-hidden
        />
        <h2
          className={cn("relative max-w-md", styleClass(heading), headingHit.className)}
          style={{ ...styleVars(heading), color: ink ? undefined : "#ffffff" }}
          onClick={headingHit.onClick}
        >
          {block.heading}
        </h2>
        {block.body ? (
          <p
            className={cn("relative mt-3 max-w-md leading-6", styleClass(body), bodyHit.className)}
            style={{ ...styleVars(body), color: ink ? undefined : "#e7e5e4" }}
            onClick={bodyHit.onClick}
          >
            {block.body}
          </p>
        ) : null}
        {block.cta ? (
          <div className="relative mt-6">
            <Cta
              href={block.ctaHref ?? "#footer"}
              label={block.cta}
              className={cn(
                ink ? "bg-white text-neutral-950" : "bg-white text-[#3d4a28]",
                styleClass(button),
                buttonHit.className,
              )}
              style={styleVars(button)}
              onClick={buttonHit.onClick}
            />
          </div>
        ) : null}
      </div>
    </Frame>
  )
}

export function FooterBlock({
  block,
  ink,
  portfolio,
  chrome,
  selectedKind,
  onSelectElement,
}: {
  block: FolioBlock
  ink: boolean
  portfolio: Portfolio
  chrome?: Portfolio["chrome"]
  selectedKind?: ElementKind | null
  onSelectElement?: (kind: ElementKind) => void
}) {
  const heading = styleOf(block, "heading")
  const body = styleOf(block, "text")
  const button = styleOf(block, "button")
  const hit = hits(selectedKind, onSelectElement)
  const headingHit = hit("heading")
  const bodyHit = hit("text")
  const buttonHit = hit("button")
  const muted = ink ? "text-white/50" : "text-neutral-500"
  const columns = chrome?.footerColumns ?? defaultChrome().footerColumns
  const email = portfolio.settings?.email ?? "talib@afm.edu"

  return (
    <Frame
      block={block}
      id="footer"
      className={ink ? "border-t border-white/10" : "border-t border-black/5"}
    >
      <div className="grid w-full gap-10 md:grid-cols-[1.2fr_1fr] md:text-left">
        <div className="flex flex-col items-start gap-4">
          <p
            className={cn("text-[16px] font-medium", headingHit.className)}
            style={styleVars(heading)}
            onClick={headingHit.onClick}
          >
            {block.heading || portfolio.name}
          </p>
          <p
            className={cn("max-w-sm leading-6", styleClass(body), bodyHit.className)}
            style={styleVars(body)}
            onClick={bodyHit.onClick}
          >
            {block.body}
          </p>
          <form
            className={cn(
              "flex w-full max-w-md overflow-hidden rounded-full border",
              ink ? "border-white/15" : "border-black/10",
            )}
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              const visitor = String(data.get("email") ?? "").trim()
              if (!visitor) {
                toast.message("Enter an email address")
                return
              }
              window.location.href = `mailto:${email}?subject=Hello from ${portfolio.name}&body=From: ${visitor}`
            }}
          >
            <input
              type="email"
              name="email"
              placeholder="you@school.edu"
              aria-label="Email"
              className="h-11 min-w-0 flex-1 bg-transparent px-4 text-[13px] outline-none"
            />
            <button
              type="submit"
              className={cn(
                "m-1 inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium",
                ink ? "bg-white text-neutral-950" : "bg-neutral-950 text-white",
                styleClass(button),
                buttonHit.className,
              )}
              style={styleVars(button)}
              onClick={buttonHit.onClick}
            >
              {block.cta || "Talk to us"}
            </button>
          </form>
        </div>
        <div className="grid grid-cols-3 gap-4 text-left text-[13px]">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="mb-3 font-medium">{column.title}</p>
              <ul className={cn("space-y-2", muted)}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}
