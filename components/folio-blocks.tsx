"use client"

import * as React from "react"

import { Cta, Frame, Img, bindHit } from "@/components/folio-frame"
import {
  CtaBand,
  FaqBlock,
  FeaturesBlock,
  FooterBlock,
  PartnersBlock,
  ReviewsBlock,
  WhyBlock,
} from "@/components/folio-sections"
import {
  type ElementKind,
  type FolioBlock,
  type Portfolio,
  type TemplateId,
} from "@/lib/demo"
import { styleClass, styleOf, styleVars, imageStyleVars } from "@/lib/elements"
import { cn } from "@/lib/utils"

export function FolioBlockView({
  block,
  portfolio,
  template,
  selectedKind,
  onSelectElement,
}: {
  block: FolioBlock
  portfolio: Portfolio
  template: TemplateId
  selectedKind?: ElementKind | null
  onSelectElement?: (kind: ElementKind) => void
}) {
  const ink = template === "walk" || template === "flood"
  const heading = styleOf(block, "heading")
  const body = styleOf(block, "text")
  const button = styleOf(block, "button")
  const hit = (kind: ElementKind) => bindHit(kind, selectedKind, onSelectElement)

  if (block.hidden) return null

  if (block.type === "partners") {
    return (
      <PartnersBlock
        block={block}
        ink={ink}
        selectedKind={selectedKind}
        onSelectElement={onSelectElement}
      />
    )
  }
  if (block.type === "features") {
    return (
      <FeaturesBlock
        block={block}
        ink={ink}
        selectedKind={selectedKind}
        onSelectElement={onSelectElement}
      />
    )
  }
  if (block.type === "why") {
    return (
      <WhyBlock
        block={block}
        ink={ink}
        selectedKind={selectedKind}
        onSelectElement={onSelectElement}
      />
    )
  }
  if (block.type === "reviews") {
    return (
      <ReviewsBlock
        block={block}
        ink={ink}
        selectedKind={selectedKind}
        onSelectElement={onSelectElement}
      />
    )
  }
  if (block.type === "faq") {
    return (
      <FaqBlock
        block={block}
        ink={ink}
        selectedKind={selectedKind}
        onSelectElement={onSelectElement}
      />
    )
  }
  if (block.type === "cta") {
    return (
      <CtaBand
        block={block}
        ink={ink}
        selectedKind={selectedKind}
        onSelectElement={onSelectElement}
      />
    )
  }
  if (block.type === "footer") {
    return (
      <FooterBlock
        block={block}
        ink={ink}
        portfolio={portfolio}
        chrome={portfolio.chrome}
        selectedKind={selectedKind}
        onSelectElement={onSelectElement}
      />
    )
  }

  if (block.type === "hero") {
    const headingHit = hit("heading")
    const bodyHit = hit("text")
    const buttonHit = hit("button")
    const button2Hit = hit("button2")
    const badgeHit = hit("badge")
    const imageHit = hit("image")
    const secondary = block.cta2 || "See the work"
    const imageStyle = styleOf(block, "image")
    const copy = (
      <>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px]",
            ink ? "border-white/15 text-white/70" : "border-black/10 text-neutral-600",
            badgeHit.className,
          )}
          onClick={badgeHit.onClick}
        >
          <span className="size-1.5 rounded-full bg-[#3d4a28]" aria-hidden />
          {portfolio.school}
        </div>
        <h1
          className={cn("leading-[1.08]", styleClass(heading), headingHit.className)}
          style={styleVars(heading)}
          onClick={headingHit.onClick}
        >
          {block.heading}
        </h1>
        <p
          className={cn("max-w-xl leading-7", styleClass(body), bodyHit.className)}
          style={styleVars(body)}
          onClick={bodyHit.onClick}
        >
          {block.body}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {block.cta ? (
            <Cta
              href={block.ctaHref ?? "#cta"}
              label={block.cta}
              className={cn(styleClass(button), buttonHit.className)}
              style={styleVars(button)}
              onClick={buttonHit.onClick}
            />
          ) : null}
          <a
            href={block.cta2Href ?? "#features"}
            className={cn(
              "inline-flex h-11 items-center rounded-full border px-5 text-[14px] font-medium",
              ink ? "border-white/25 hover:border-white/50" : "border-black/15 hover:border-black/40",
              button2Hit.className,
            )}
            style={styleVars(button)}
            onClick={button2Hit.onClick}
          >
            {secondary}
          </a>
        </div>
      </>
    )
    return (
      <Frame
        block={block}
        className={cn(
          !ink &&
            "bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-size-[44px_44px]",
        )}
      >
        <div className="grid w-full items-center gap-10 md:grid-cols-2">
          <div className="flex flex-col items-start gap-5">{copy}</div>
          {block.image ? (
            <div
              className={cn("overflow-hidden rounded-[2rem]", imageHit.className)}
              style={{ borderRadius: imageStyle.imageRadius }}
              onClick={imageHit.onClick}
            >
              <Img
                src={block.image}
                alt={block.imageAlt ?? portfolio.name}
                className="aspect-[4/5] w-full md:aspect-[3/4]"
                style={imageStyleVars(imageStyle)}
              />
            </div>
          ) : null}
        </div>
      </Frame>
    )
  }

  if (block.type === "still") {
    const imageHit = hit("image")
    return (
      <Frame block={block}>
        <div
          className={cn("relative w-full overflow-hidden rounded-[2rem]", imageHit.className)}
          onClick={imageHit.onClick}
        >
          <Img
            src={block.image}
            alt={block.heading}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      </Frame>
    )
  }

  if (block.type === "skills") {
    const items = block.items.length ? block.items : portfolio.skills
    const listHit = hit("list")
    return (
      <Frame block={block}>
        <ul
          className={cn(
            "grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5",
            styleClass(body),
            listHit.className,
          )}
          style={styleVars(body)}
          onClick={listHit.onClick}
        >
          {items.map((skill) => (
            <li
              key={skill}
              className={cn(
                "flex min-h-24 items-center justify-center rounded-[1.75rem] px-3 text-center text-[14px] font-medium",
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

  if (block.type === "about") {
    const headingHit = hit("heading")
    const bodyHit = hit("text")
    const imageHit = hit("image")
    const buttonHit = hit("button")
    return (
      <Frame block={block} id="about">
        <div className="grid w-full items-center gap-10 md:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            {block.heading ? (
              <h2
                className={cn("leading-none", styleClass(heading), headingHit.className)}
                style={styleVars(heading)}
                onClick={headingHit.onClick}
              >
                {block.heading}
              </h2>
            ) : null}
            {block.body ? (
              <p
                className={cn("max-w-md leading-7", styleClass(body), bodyHit.className)}
                style={styleVars(body)}
                onClick={bodyHit.onClick}
              >
                {block.body}
              </p>
            ) : null}
            {block.cta ? (
              <Cta
                href={block.ctaHref ?? "#cta"}
                label={block.cta}
                className={cn(styleClass(button), buttonHit.className)}
                style={styleVars(button)}
                onClick={buttonHit.onClick}
              />
            ) : null}
          </div>
          {block.image ? (
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn("w-full overflow-hidden rounded-[2rem]", imageHit.className)}
                onClick={imageHit.onClick}
              >
                <Img
                  src={block.image}
                  alt={portfolio.name}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <p className="font-serif text-xl italic text-neutral-500">{portfolio.name}</p>
            </div>
          ) : null}
        </div>
      </Frame>
    )
  }

  if (block.type === "featured") {
    const headingHit = hit("heading")
    const bodyHit = hit("text")
    const imageHit = hit("image")
    return (
      <Frame block={block} id="work">
        <div
          className={cn(
            "w-full overflow-hidden rounded-[2rem]",
            ink ? "bg-white/5" : "bg-neutral-50",
            imageHit.className,
          )}
          onClick={imageHit.onClick}
        >
          {block.image ? (
            <Img src={block.image} alt="" className="aspect-[16/10] w-full object-cover" />
          ) : null}
        </div>
        <h2
          className={cn(styleClass(heading), headingHit.className)}
          style={styleVars(heading)}
          onClick={headingHit.onClick}
        >
          {block.heading}
        </h2>
        {block.body ? (
          <p
            className={cn("max-w-2xl leading-7", styleClass(body), bodyHit.className)}
            style={styleVars(body)}
            onClick={bodyHit.onClick}
          >
            {block.body}
          </p>
        ) : null}
      </Frame>
    )
  }

  const headingHit = hit("heading")
  const bodyHit = hit("text")
  const buttonHit = hit("button")
  return (
    <Frame block={block} id="contact" className="bg-neutral-950 text-white">
      <h3
        className={cn("text-white", styleClass(heading), headingHit.className)}
        style={{ ...styleVars(heading), color: "#ffffff" }}
        onClick={headingHit.onClick}
      >
        {block.heading}
      </h3>
      <p
        className={cn(styleClass(body), bodyHit.className)}
        style={styleVars(body)}
        onClick={bodyHit.onClick}
      >
        {block.body}
      </p>
      {block.cta ? (
        <Cta
          href={block.ctaHref ?? "#cta"}
          label={block.cta}
          className={cn(
            "bg-white text-neutral-950",
            styleClass(button),
            buttonHit.className,
          )}
          style={{ ...styleVars(button), backgroundColor: "#ffffff", color: "#111111" }}
          onClick={buttonHit.onClick}
        />
      ) : null}
    </Frame>
  )
}
