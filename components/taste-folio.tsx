"use client"

import * as React from "react"

import { type ElementKind, type Portfolio } from "@/lib/demo"
import { blocksOf, defaultBlocks, layoutOf } from "@/lib/blocks"
import { imageStyleVars, styleClass, styleOf, styleVars } from "@/lib/elements"
import {
  PROJECT_SRC,
  STUDENT_WORK,
  type StudentPiece,
  type TemplateId,
} from "@/lib/tastes"
import { cn } from "@/lib/utils"

function hitHelper(
  blockId: string,
  kind: ElementKind,
  selectedId?: string,
  selectedKind?: ElementKind | null,
  onSelectElement?: (id: string, kind: ElementKind) => void
) {
  if (!onSelectElement) return {}
  const isSelected = selectedId === blockId && selectedKind === kind
  return {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onSelectElement(blockId, kind)
    },
    className: cn(
      "pointer-events-auto cursor-pointer rounded-xs transition-[outline-color,box-shadow] duration-150",
      "outline outline-1 outline-offset-2 outline-transparent hover:outline-primary/60",
      isSelected &&
        "relative z-20 ring-2 ring-primary/30 outline-2 outline-offset-2 outline-primary"
    ),
  }
}

function blockHitHelper(
  blockId: string,
  selectedId?: string,
  selectedKind?: ElementKind | null,
  onSelectBlock?: (id: string) => void
) {
  if (!onSelectBlock) return {}
  const isBlockSelected = selectedId === blockId && !selectedKind
  return {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onSelectBlock(blockId)
    },
    className: cn(
      "cursor-pointer transition-[outline-color,box-shadow] duration-150",
      isBlockSelected &&
        "z-10 ring-2 ring-primary ring-offset-2 ring-offset-background"
    ),
  }
}

function extractFramePieces(portfolio: Portfolio): {
  pieces: StudentPiece[]
  featured: StudentPiece
} {
  const list: StudentPiece[] = []
  const seen = new Set<string>()

  // 1. Stills from media
  if (portfolio.media?.stills?.length) {
    portfolio.media.stills.forEach((src, idx) => {
      if (!src || seen.has(src)) return
      seen.add(src)
      list.push({
        src,
        title: idx === 0 ? portfolio.project.name : `Work 0${idx + 1}`,
        slug: idx === 0 ? "Featured" : "Project",
        note: idx === 0 ? portfolio.project.copy : "Studio portfolio project",
        category: idx % 3 === 0 ? "film" : idx % 3 === 1 ? "ad" : "graphic",
      })
    })
  }

  // 2. Images from blocks
  for (const block of portfolio.blocks ?? []) {
    if (!block.image || seen.has(block.image)) continue
    if (
      block.type !== "featured" &&
      block.type !== "still" &&
      block.type !== "hero"
    )
      continue
    seen.add(block.image)
    list.push({
      src: block.image,
      title: block.heading || portfolio.project.name,
      slug: block.body || block.eyebrow || "Featured piece",
      note: block.body || portfolio.project.copy,
      mediaKind: block.mediaKind,
      category:
        block.eyebrow?.toLowerCase() === "film" ||
        block.eyebrow?.toLowerCase() === "ad" ||
        block.eyebrow?.toLowerCase() === "graphic"
          ? block.eyebrow.toLowerCase()
          : block.type === "still"
            ? "graphic"
            : block.type === "featured"
              ? "film"
              : "ad",
    })
  }

  // 3. Fallback to STUDENT_WORK
  if (list.length === 0) {
    list.push(...STUDENT_WORK)
  }

  const featured = list[0] ?? STUDENT_WORK[0]
  return { pieces: list, featured }
}

function FrameFolio({
  portfolio,
  className,
  selectedId,
  selectedKind,
  onSelectBlock,
  onSelectElement,
}: {
  portfolio: Portfolio
  className?: string
  selectedId?: string
  selectedKind?: ElementKind | null
  onSelectBlock?: (id: string) => void
  onSelectElement?: (id: string, kind: ElementKind) => void
}) {
  const [filter, setFilter] = React.useState("all")
  const [modalPiece, setModalPiece] = React.useState<StudentPiece | null>(null)
  const isEditing = Boolean(onSelectBlock || onSelectElement)

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setModalPiece(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const rawBlocks = portfolio.blocks?.length
    ? portfolio.blocks
    : blocksOf(portfolio, "frame")

  const visibleBlocks = React.useMemo(() => {
    const visible = rawBlocks.filter((b) => !b.hidden)
    if (visible.length > 0) return visible
    if (isEditing) return rawBlocks
    return defaultBlocks(portfolio, "frame")
  }, [rawBlocks, isEditing, portfolio])

  const heroBlock = visibleBlocks.find((b) => b.type === "hero") ?? rawBlocks[0]
  const aboutBlock = visibleBlocks.find((b) => b.type === "about")
  const contactBlock = visibleBlocks.find(
    (b) => b.type === "contact" || b.type === "cta"
  )
  const customBlocks = visibleBlocks.filter(
    (b) =>
      b.type !== "hero" &&
      b.type !== "about" &&
      b.type !== "contact" &&
      b.type !== "cta" &&
      b.type !== "footer"
  )

  const { pieces, featured } = React.useMemo(
    () => extractFramePieces(portfolio),
    [portfolio]
  )

  const heroBlockHit = blockHitHelper(
    heroBlock?.id ?? "hero",
    selectedId,
    selectedKind,
    onSelectBlock
  )
  const heroHeadingHit = hitHelper(
    heroBlock?.id ?? "hero",
    "heading",
    selectedId,
    selectedKind,
    onSelectElement
  )
  const heroBodyHit = hitHelper(
    heroBlock?.id ?? "hero",
    "text",
    selectedId,
    selectedKind,
    onSelectElement
  )
  const heroButtonHit = hitHelper(
    heroBlock?.id ?? "hero",
    "button",
    selectedId,
    selectedKind,
    onSelectElement
  )
  const heroBadgeHit = hitHelper(
    heroBlock?.id ?? "hero",
    "badge",
    selectedId,
    selectedKind,
    onSelectElement
  )
  const featuredImageHit = hitHelper(
    heroBlock?.id ?? "hero",
    "image",
    selectedId,
    selectedKind,
    onSelectElement
  )

  const heroHeadingStyle = heroBlock ? styleOf(heroBlock, "heading") : null
  const heroBodyStyle = heroBlock ? styleOf(heroBlock, "text") : null
  const heroButtonStyle = heroBlock ? styleOf(heroBlock, "button") : null
  const heroImageStyle = heroBlock ? styleOf(heroBlock, "image") : null
  const heroLayout = heroBlock ? layoutOf(heroBlock) : null

  const aboutBlockHit = aboutBlock
    ? blockHitHelper(aboutBlock.id, selectedId, selectedKind, onSelectBlock)
    : null
  const aboutHeadingHit = aboutBlock
    ? hitHelper(
        aboutBlock.id,
        "heading",
        selectedId,
        selectedKind,
        onSelectElement
      )
    : null
  const aboutBodyHit = aboutBlock
    ? hitHelper(
        aboutBlock.id,
        "text",
        selectedId,
        selectedKind,
        onSelectElement
      )
    : null
  const aboutHeadingStyle = aboutBlock ? styleOf(aboutBlock, "heading") : null
  const aboutBodyStyle = aboutBlock ? styleOf(aboutBlock, "text") : null

  const contactBlockHit = contactBlock
    ? blockHitHelper(contactBlock.id, selectedId, selectedKind, onSelectBlock)
    : null
  const contactHeadingHit = contactBlock
    ? hitHelper(
        contactBlock.id,
        "heading",
        selectedId,
        selectedKind,
        onSelectElement
      )
    : null
  const contactBodyHit = contactBlock
    ? hitHelper(
        contactBlock.id,
        "text",
        selectedId,
        selectedKind,
        onSelectElement
      )
    : null
  const contactButtonHit = contactBlock
    ? hitHelper(
        contactBlock.id,
        "button",
        selectedId,
        selectedKind,
        onSelectElement
      )
    : null
  const contactHeadingStyle = contactBlock
    ? styleOf(contactBlock, "heading")
    : null
  const contactBodyStyle = contactBlock ? styleOf(contactBlock, "text") : null
  const contactButtonStyle = contactBlock
    ? styleOf(contactBlock, "button")
    : null

  const heroHeading = heroBlock?.heading || "AI made visual."
  const heroBody =
    heroBlock?.body ||
    portfolio.bio ||
    "A simple portfolio of AI-generated films, advertisements, graphics and visual experiments."
  const email = portfolio.settings?.email || "hello@framestudio.ai"
  const emailHref = `mailto:${email}`

  const categories = React.useMemo(() => {
    const cats = new Set<string>()
    for (const p of pieces) {
      if (p.category) cats.add(p.category)
    }
    return Array.from(cats)
  }, [pieces])

  const filteredPieces = React.useMemo(() => {
    if (filter === "all") return pieces
    return pieces.filter((p) => p.category === filter)
  }, [pieces, filter])

  return (
    <div className={cn("taste taste-frame", className)} data-taste="frame">
      <div className="taste-frame-container">
        {/* Navigation */}
        <nav className="taste-frame-nav">
          <a
            className={cn("taste-frame-logo", heroBadgeHit.className)}
            href="#top"
            onClick={heroBadgeHit.onClick}
          >
            {portfolio.school || portfolio.name || "FRAME"}
          </a>
          <div className="taste-frame-links">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            {customBlocks.some((b) => b.type === "skills") ? (
              <a href="#skills">Skills</a>
            ) : null}
            {customBlocks.some((b) => b.type === "faq") ? (
              <a href="#faq">FAQ</a>
            ) : null}
          </div>
          <a
            className={cn(
              "taste-frame-contact-btn",
              contactButtonHit?.className
            )}
            href="#contact"
            onClick={contactButtonHit?.onClick}
          >
            Contact
          </a>
        </nav>

        {/* Hero Section */}
        {heroBlock ? (
          <section
            className={cn("taste-frame-hero", heroBlockHit.className)}
            id="top"
            onClick={heroBlockHit.onClick}
            style={{
              paddingTop:
                heroLayout?.padT !== undefined
                  ? `${heroLayout.padT}px`
                  : undefined,
              paddingBottom:
                heroLayout?.padB !== undefined
                  ? `${heroLayout.padB}px`
                  : undefined,
            }}
          >
            <h1
              className={cn(
                heroHeadingStyle ? styleClass(heroHeadingStyle) : "",
                heroHeadingHit.className
              )}
              style={heroHeadingStyle ? styleVars(heroHeadingStyle) : undefined}
              onClick={heroHeadingHit.onClick}
            >
              {heroHeading.includes("\n") ? (
                <>
                  {heroHeading.split("\n")[0]}
                  <br />
                  <span>{heroHeading.split("\n")[1]}</span>
                </>
              ) : heroHeading.includes(" / ") ? (
                <>
                  {heroHeading.split(" / ")[0]}
                  <br />
                  <span>{heroHeading.split(" / ")[1]}</span>
                </>
              ) : (
                <>
                  {heroHeading}
                  <br />
                  <span>{portfolio.title || "Human made creative."}</span>
                </>
              )}
            </h1>
            <p
              className={cn(
                heroBodyStyle ? styleClass(heroBodyStyle) : "",
                heroBodyHit.className
              )}
              style={heroBodyStyle ? styleVars(heroBodyStyle) : undefined}
              onClick={heroBodyHit.onClick}
            >
              {heroBody}
            </p>
            <a
              className={cn(
                "taste-frame-hero-link",
                heroButtonStyle ? styleClass(heroButtonStyle) : "",
                heroButtonHit.className
              )}
              style={heroButtonStyle ? styleVars(heroButtonStyle) : undefined}
              href="#work"
              onClick={heroButtonHit.onClick}
            >
              {heroBlock?.cta || "VIEW WORK →"}
            </a>

            <div
              className={cn("taste-frame-featured", featuredImageHit.className)}
              onClick={(e) => {
                if (isEditing && featuredImageHit.onClick) {
                  featuredImageHit.onClick(e)
                } else {
                  setModalPiece(featured)
                }
              }}
            >
              {featured.mediaKind === "video" ? (
                <video
                  src={featured.src}
                  aria-label={featured.title}
                  style={
                    heroImageStyle ? imageStyleVars(heroImageStyle) : undefined
                  }
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.src}
                  alt={featured.title}
                  style={
                    heroImageStyle ? imageStyleVars(heroImageStyle) : undefined
                  }
                />
              )}
              <div className="taste-frame-featured-overlay">
                <div>
                  <div className="taste-frame-featured-title">
                    {featured.title}
                  </div>
                  <div className="taste-frame-featured-meta">
                    {featured.slug || "FEATURED PIECE"}
                  </div>
                </div>
                <div className="taste-frame-featured-meta">
                  01 / {String(pieces.length).padStart(2, "0")}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Selected Work Section */}
        <section className="taste-frame-work" id="work">
          <h2 className="taste-frame-section-title">Selected work</h2>
          <div className="taste-frame-filters">
            <button
              type="button"
              className={cn("taste-frame-filter", filter === "all" && "active")}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={cn("taste-frame-filter", filter === cat && "active")}
                onClick={() => setFilter(cat)}
              >
                {cat === "film"
                  ? "Films"
                  : cat === "ad"
                    ? "Ads"
                    : cat === "graphic"
                      ? "Graphics"
                      : cat}
              </button>
            ))}
          </div>

          <div className="taste-frame-grid">
            {filteredPieces.map((piece, idx) => (
              <article
                key={idx}
                className="taste-frame-card"
                onClick={() => setModalPiece(piece)}
              >
                <div className="taste-frame-card-image">
                  {piece.mediaKind === "video" ? (
                    <video
                      src={piece.src}
                      aria-label={piece.title}
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={piece.src} alt={piece.title} />
                  )}
                </div>
                <div className="taste-frame-card-info">
                  <div className="taste-frame-card-title">{piece.title}</div>
                  <div className="taste-frame-card-type">
                    {piece.category === "film"
                      ? "Film"
                      : piece.category === "ad"
                        ? "Ad"
                        : piece.category === "graphic"
                          ? "Graphics"
                          : piece.category || "Work"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Dynamic Custom Blocks */}
        {customBlocks.map((block) => {
          const blockHit = blockHitHelper(
            block.id,
            selectedId,
            selectedKind,
            onSelectBlock
          )
          const headingHit = hitHelper(
            block.id,
            "heading",
            selectedId,
            selectedKind,
            onSelectElement
          )
          const bodyHit = hitHelper(
            block.id,
            "text",
            selectedId,
            selectedKind,
            onSelectElement
          )
          const listHit = hitHelper(
            block.id,
            "list",
            selectedId,
            selectedKind,
            onSelectElement
          )
          const buttonHit = hitHelper(
            block.id,
            "button",
            selectedId,
            selectedKind,
            onSelectElement
          )
          const imageHit = hitHelper(
            block.id,
            "image",
            selectedId,
            selectedKind,
            onSelectElement
          )

          const headingStyle = styleOf(block, "heading")
          const bodyStyle = styleOf(block, "text")
          const buttonStyle = styleOf(block, "button")
          const imageStyle = styleOf(block, "image")
          const layout = layoutOf(block)

          if (block.type === "skills" || block.type === "partners") {
            const items = block.items.length ? block.items : portfolio.skills
            return (
              <section
                key={block.id}
                id="skills"
                className={cn(
                  "taste-frame-work border-t border-[var(--taste-line)]",
                  blockHit.className
                )}
                onClick={blockHit.onClick}
                style={{
                  paddingTop:
                    layout.padT !== undefined ? `${layout.padT}px` : undefined,
                  paddingBottom:
                    layout.padB !== undefined ? `${layout.padB}px` : undefined,
                }}
              >
                {block.heading ? (
                  <h2
                    className={cn(
                      "taste-frame-section-title",
                      styleClass(headingStyle),
                      headingHit.className
                    )}
                    style={styleVars(headingStyle)}
                    onClick={headingHit.onClick}
                  >
                    {block.heading}
                  </h2>
                ) : null}
                {block.body ? (
                  <p
                    className={cn(
                      "mb-6 max-w-xl text-sm leading-relaxed text-[#666]",
                      styleClass(bodyStyle),
                      bodyHit.className
                    )}
                    style={styleVars(bodyStyle)}
                    onClick={bodyHit.onClick}
                  >
                    {block.body}
                  </p>
                ) : null}
                <div
                  className={cn("flex flex-wrap gap-2.5", listHit.className)}
                  onClick={listHit.onClick}
                >
                  {items.map((item, idx) => (
                    <span
                      key={idx}
                      className="border border-[#ddd] bg-white px-4 py-2 text-xs font-medium tracking-wide text-[#111] uppercase"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )
          }

          if (block.type === "why" || block.type === "features") {
            return (
              <section
                key={block.id}
                className={cn(
                  "taste-frame-work border-t border-[var(--taste-line)]",
                  blockHit.className
                )}
                onClick={blockHit.onClick}
                style={{
                  paddingTop:
                    layout.padT !== undefined ? `${layout.padT}px` : undefined,
                  paddingBottom:
                    layout.padB !== undefined ? `${layout.padB}px` : undefined,
                }}
              >
                {block.heading ? (
                  <h2
                    className={cn(
                      "taste-frame-section-title",
                      styleClass(headingStyle),
                      headingHit.className
                    )}
                    style={styleVars(headingStyle)}
                    onClick={headingHit.onClick}
                  >
                    {block.heading}
                  </h2>
                ) : null}
                {block.body ? (
                  <p
                    className={cn(
                      "mb-8 max-w-xl text-sm leading-relaxed text-[#666]",
                      styleClass(bodyStyle),
                      bodyHit.className
                    )}
                    style={styleVars(bodyStyle)}
                    onClick={bodyHit.onClick}
                  >
                    {block.body}
                  </p>
                ) : null}
                {block.items && block.items.length > 0 ? (
                  <div
                    className={cn(
                      "grid grid-cols-1 gap-6 md:grid-cols-2",
                      listHit.className
                    )}
                    onClick={listHit.onClick}
                  >
                    {block.items.map((item, idx) => {
                      const [title, desc] = item.split("|")
                      return (
                        <div
                          key={idx}
                          className="flex flex-col gap-2 border border-[var(--taste-line)] bg-white p-6"
                        >
                          <h3 className="font-serif text-xl font-normal text-[#111]">
                            {title?.trim()}
                          </h3>
                          {desc ? (
                            <p className="text-xs leading-relaxed text-[#666]">
                              {desc.trim()}
                            </p>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </section>
            )
          }

          if (block.type === "reviews") {
            return (
              <section
                key={block.id}
                className={cn(
                  "taste-frame-work border-t border-[var(--taste-line)]",
                  blockHit.className
                )}
                onClick={blockHit.onClick}
                style={{
                  paddingTop:
                    layout.padT !== undefined ? `${layout.padT}px` : undefined,
                  paddingBottom:
                    layout.padB !== undefined ? `${layout.padB}px` : undefined,
                }}
              >
                {block.heading ? (
                  <h2
                    className={cn(
                      "taste-frame-section-title",
                      styleClass(headingStyle),
                      headingHit.className
                    )}
                    style={styleVars(headingStyle)}
                    onClick={headingHit.onClick}
                  >
                    {block.heading}
                  </h2>
                ) : null}
                {block.items && block.items.length > 0 ? (
                  <div
                    className={cn(
                      "grid grid-cols-1 gap-6 md:grid-cols-3",
                      listHit.className
                    )}
                    onClick={listHit.onClick}
                  >
                    {block.items.map((item, idx) => {
                      const [quote, author, role] = item.split("|")
                      return (
                        <div
                          key={idx}
                          className="flex flex-col justify-between gap-4 border border-[var(--taste-line)] bg-white p-6"
                        >
                          <p className="font-serif text-lg leading-snug text-[#222] italic">
                            &ldquo;{quote?.trim()}&rdquo;
                          </p>
                          <div className="border-t border-[#eee] pt-3">
                            <p className="text-xs font-semibold text-[#111]">
                              {author?.trim()}
                            </p>
                            {role ? (
                              <p className="text-xxs text-[#888] uppercase">
                                {role.trim()}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </section>
            )
          }

          if (block.type === "faq") {
            return (
              <section
                key={block.id}
                id="faq"
                className={cn(
                  "taste-frame-work border-t border-[var(--taste-line)]",
                  blockHit.className
                )}
                onClick={blockHit.onClick}
                style={{
                  paddingTop:
                    layout.padT !== undefined ? `${layout.padT}px` : undefined,
                  paddingBottom:
                    layout.padB !== undefined ? `${layout.padB}px` : undefined,
                }}
              >
                {block.heading ? (
                  <h2
                    className={cn(
                      "taste-frame-section-title",
                      styleClass(headingStyle),
                      headingHit.className
                    )}
                    style={styleVars(headingStyle)}
                    onClick={headingHit.onClick}
                  >
                    {block.heading}
                  </h2>
                ) : null}
                {block.items && block.items.length > 0 ? (
                  <div
                    className={cn(
                      "flex flex-col border-t border-[var(--taste-line)]",
                      listHit.className
                    )}
                    onClick={listHit.onClick}
                  >
                    {block.items.map((item, idx) => {
                      const [q, a] = item.split("|")
                      return (
                        <div
                          key={idx}
                          className="flex flex-col justify-between gap-4 border-b border-[var(--taste-line)] py-5 md:flex-row md:items-start"
                        >
                          <h3 className="font-serif text-xl font-normal text-[#111] md:w-1/3">
                            {q?.trim()}
                          </h3>
                          <p className="text-sm leading-relaxed text-[#666] md:w-2/3">
                            {a?.trim()}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </section>
            )
          }

          if (block.type === "still") {
            return (
              <section
                key={block.id}
                className={cn(
                  "taste-frame-work border-t border-[var(--taste-line)]",
                  blockHit.className
                )}
                onClick={blockHit.onClick}
              >
                {block.image ? (
                  <div
                    className={cn(
                      "aspect-[16/9] w-full overflow-hidden bg-[#eee]",
                      imageHit.className
                    )}
                    onClick={imageHit.onClick}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={block.image}
                      alt={block.imageAlt || block.heading || ""}
                      className="h-full w-full object-cover"
                      style={
                        imageStyle ? imageStyleVars(imageStyle) : undefined
                      }
                    />
                  </div>
                ) : null}
                {block.heading ? (
                  <h3
                    className={cn(
                      "mt-4 font-serif text-2xl font-normal text-[#111]",
                      styleClass(headingStyle),
                      headingHit.className
                    )}
                    style={styleVars(headingStyle)}
                    onClick={headingHit.onClick}
                  >
                    {block.heading}
                  </h3>
                ) : null}
                {block.body ? (
                  <p
                    className={cn(
                      "mt-1 text-sm text-[#666]",
                      styleClass(bodyStyle),
                      bodyHit.className
                    )}
                    style={styleVars(bodyStyle)}
                    onClick={bodyHit.onClick}
                  >
                    {block.body}
                  </p>
                ) : null}
              </section>
            )
          }

          return null
        })}

        {/* About Section */}
        {aboutBlock ? (
          <section
            className={cn("taste-frame-about", aboutBlockHit?.className)}
            id="about"
            onClick={aboutBlockHit?.onClick}
          >
            <div className="taste-frame-about-grid">
              <h2
                className={cn(
                  aboutHeadingStyle ? styleClass(aboutHeadingStyle) : "",
                  aboutHeadingHit?.className
                )}
                style={
                  aboutHeadingStyle ? styleVars(aboutHeadingStyle) : undefined
                }
                onClick={aboutHeadingHit?.onClick}
              >
                {aboutBlock?.heading ? (
                  aboutBlock.heading.includes("\n") ? (
                    aboutBlock.heading.split("\n").map((line, i, arr) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 ? <br /> : null}
                      </React.Fragment>
                    ))
                  ) : (
                    aboutBlock.heading
                  )
                ) : (
                  <>
                    Less noise.
                    <br />
                    More work.
                  </>
                )}
              </h2>
              <p
                className={cn(
                  aboutBodyStyle ? styleClass(aboutBodyStyle) : "",
                  aboutBodyHit?.className
                )}
                style={aboutBodyStyle ? styleVars(aboutBodyStyle) : undefined}
                onClick={aboutBodyHit?.onClick}
              >
                {aboutBlock?.body ||
                  portfolio.bio ||
                  "FRAME is a visual archive for AI-generated creative work. Films, ads and graphics are presented first. Everything else stays secondary so the work gets the attention."}
              </p>
            </div>
          </section>
        ) : null}

        {/* CTA / Contact Section */}
        {contactBlock ? (
          <section
            className={cn("taste-frame-cta", contactBlockHit?.className)}
            id="contact"
            onClick={contactBlockHit?.onClick}
          >
            <h2
              className={cn(
                contactHeadingStyle ? styleClass(contactHeadingStyle) : "",
                contactHeadingHit?.className
              )}
              style={
                contactHeadingStyle ? styleVars(contactHeadingStyle) : undefined
              }
              onClick={contactHeadingHit?.onClick}
            >
              {contactBlock?.heading ? (
                contactBlock.heading.includes("\n") ? (
                  <>
                    {contactBlock.heading.split("\n")[0]}
                    <br />
                    <span className="taste-frame-accent">
                      {contactBlock.heading.split("\n").slice(1).join(" ")}
                    </span>
                  </>
                ) : (
                  <>
                    {contactBlock.heading}
                    <br />
                    <span className="taste-frame-accent">
                      Let&apos;s make it.
                    </span>
                  </>
                )
              ) : (
                <>
                  Have an idea?
                  <br />
                  <span className="taste-frame-accent">
                    Let&apos;s make it.
                  </span>
                </>
              )}
            </h2>
            <p
              className={cn(
                contactBodyStyle ? styleClass(contactBodyStyle) : "",
                contactBodyHit?.className
              )}
              style={contactBodyStyle ? styleVars(contactBodyStyle) : undefined}
              onClick={contactBodyHit?.onClick}
            >
              {contactBlock?.body ||
                (portfolio.skills?.length
                  ? portfolio.skills.join(" · ")
                  : "Films · Ads · Graphics · Visual experiments")}
            </p>
            <a
              className={cn(
                "taste-frame-hero-link",
                contactButtonStyle ? styleClass(contactButtonStyle) : "",
                contactButtonHit?.className
              )}
              style={
                contactButtonStyle ? styleVars(contactButtonStyle) : undefined
              }
              href={contactBlock?.ctaHref || emailHref}
              onClick={contactButtonHit?.onClick}
            >
              {contactBlock?.cta || `${email.toUpperCase()} ↗`}
            </a>
          </section>
        ) : null}

        {/* Footer */}
        <footer className="taste-frame-footer">
          <span>
            © {new Date().getFullYear()} {portfolio.name || "FRAME"}
          </span>
          <span>
            {portfolio.skills?.length
              ? portfolio.skills.join(" · ").toUpperCase()
              : "AI FILMS · ADS · GRAPHICS"}
          </span>
        </footer>
      </div>

      {/* Lightbox Modal */}
      {modalPiece ? (
        <div
          className="taste-frame-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalPiece(null)
          }}
        >
          <div className="taste-frame-modal-box">
            <button
              type="button"
              className="taste-frame-modal-close"
              aria-label="Close modal"
              onClick={() => setModalPiece(null)}
            >
              ×
            </button>
            <div className="taste-frame-modal-image">
              {modalPiece.mediaKind === "video" ? (
                <video
                  src={modalPiece.src}
                  aria-label={modalPiece.title}
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={modalPiece.src} alt={modalPiece.title} />
              )}
            </div>
            <div className="taste-frame-modal-info">
              <h3>{modalPiece.title}</h3>
              <p>{modalPiece.note}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function TasteFolio({
  portfolio,
  template,
  className,
  selectedId,
  selectedKind,
  onSelectBlock,
  onSelectElement,
}: {
  portfolio: Portfolio
  template: TemplateId
  className?: string
  selectedId?: string
  selectedKind?: ElementKind | null
  onSelectBlock?: (id: string) => void
  onSelectElement?: (id: string, kind: ElementKind) => void
  onBlockKeySelect?: (id: string) => void
}) {
  if (template === "frame") {
    return (
      <FrameFolio
        portfolio={portfolio}
        className={className}
        selectedId={selectedId}
        selectedKind={selectedKind}
        onSelectBlock={onSelectBlock}
        onSelectElement={onSelectElement}
      />
    )
  }

  const isEditing = Boolean(onSelectBlock || onSelectElement)
  const rawBlocks = portfolio.blocks?.length
    ? portfolio.blocks
    : blocksOf(portfolio, template)

  const activeBlocks = React.useMemo(() => {
    const visible = rawBlocks.filter((b) => !b.hidden)
    if (visible.length > 0) return visible
    if (isEditing) return rawBlocks
    return defaultBlocks(portfolio, template)
  }, [rawBlocks, isEditing, portfolio, template])

  const firstBlock = activeBlocks[0] ?? defaultBlocks(portfolio, template)[0]
  const suiteBlocks = activeBlocks.slice(1)

  const hasSynthetic = suiteBlocks.length === 0
  const syntheticWorkPieces: StudentPiece[] = hasSynthetic
    ? STUDENT_WORK.slice(1, 4)
    : []

  const first = portfolio.name ? portfolio.name.split(" ")[0] : "Student"
  const writeHref = portfolio.settings?.email
    ? `mailto:${portfolio.settings.email}`
    : "#cta"

  // First wall elements
  const heroImage =
    firstBlock.image ||
    portfolio.media?.headshot ||
    PROJECT_SRC[template] ||
    STUDENT_WORK[0].src
  const heroHeading = firstBlock.heading || portfolio.project.name
  const heroBody = firstBlock.body || portfolio.project.copy

  const heroHeadingStyle = styleOf(firstBlock, "heading")
  const heroBodyStyle = styleOf(firstBlock, "text")
  const heroButtonStyle = styleOf(firstBlock, "button")
  const heroImageStyle = styleOf(firstBlock, "image")

  const heroBlockHit = blockHitHelper(
    firstBlock.id,
    selectedId,
    selectedKind,
    onSelectBlock
  )
  const heroImageHit = hitHelper(
    firstBlock.id,
    "image",
    selectedId,
    selectedKind,
    onSelectElement
  )
  const heroBadgeHit = hitHelper(
    firstBlock.id,
    "badge",
    selectedId,
    selectedKind,
    onSelectElement
  )
  const heroHeadingHit = hitHelper(
    firstBlock.id,
    "heading",
    selectedId,
    selectedKind,
    onSelectElement
  )
  const heroBodyHit = hitHelper(
    firstBlock.id,
    "text",
    selectedId,
    selectedKind,
    onSelectElement
  )
  const heroButtonHit = hitHelper(
    firstBlock.id,
    "button",
    selectedId,
    selectedKind,
    onSelectElement
  )
  const heroButton2Hit = hitHelper(
    firstBlock.id,
    "button2",
    selectedId,
    selectedKind,
    onSelectElement
  )

  const heroLayout = layoutOf(firstBlock)

  return (
    <div className={cn("taste", className)} data-taste={template}>
      <a className="taste-skip" href="#rooms">
        The pieces
      </a>

      <section
        className={cn("taste-hero", heroBlockHit.className)}
        id={firstBlock.id || "top"}
        onClick={heroBlockHit.onClick}
        style={{
          paddingTop:
            heroLayout.padT !== undefined
              ? `min(${heroLayout.padT}px, 25vh)`
              : undefined,
          paddingBottom:
            heroLayout.padB !== undefined
              ? `min(${heroLayout.padB}px, 25vh)`
              : undefined,
        }}
      >
        <div className="taste-window">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={firstBlock.imageAlt || heroHeading}
            className={cn(heroImageHit.className)}
            style={imageStyleVars(heroImageStyle)}
            onClick={heroImageHit.onClick}
          />
          <header className="taste-label">
            <strong
              className={cn(heroBadgeHit.className)}
              onClick={heroBadgeHit.onClick}
            >
              {portfolio.school || portfolio.name}
            </strong>
            <nav aria-label="On this page">
              <a href="#rooms">Works</a>
              <a href="#cta">Write</a>
            </nav>
          </header>
          <div
            className="taste-in"
            style={{
              textAlign:
                heroLayout.align === "center"
                  ? "center"
                  : heroLayout.align === "end"
                    ? "right"
                    : undefined,
              maxWidth: heroLayout.maxWidth
                ? `min(${heroLayout.maxWidth}px, calc(100% - 2.4rem))`
                : undefined,
            }}
          >
            <p
              className={cn("taste-name", heroBadgeHit.className)}
              onClick={heroBadgeHit.onClick}
            >
              {portfolio.name}
            </p>
            <h1
              className={cn(
                styleClass(heroHeadingStyle),
                heroHeadingHit.className
              )}
              style={styleVars(heroHeadingStyle)}
              onClick={heroHeadingHit.onClick}
            >
              {heroHeading}
            </h1>
            <p
              className={cn(
                "taste-lede",
                styleClass(heroBodyStyle),
                heroBodyHit.className
              )}
              style={styleVars(heroBodyStyle)}
              onClick={heroBodyHit.onClick}
            >
              {heroBody}
            </p>
            <div className="taste-pills">
              {firstBlock.cta ? (
                <a
                  className={cn(
                    "taste-pill taste-pill--solid",
                    styleClass(heroButtonStyle),
                    heroButtonHit.className
                  )}
                  href={firstBlock.ctaHref || "#rooms"}
                  style={styleVars(heroButtonStyle)}
                  onClick={heroButtonHit.onClick}
                >
                  {firstBlock.cta}
                </a>
              ) : null}
              {firstBlock.cta2 ? (
                <a
                  className={cn(
                    "taste-pill taste-pill--glass",
                    styleClass(heroButtonStyle),
                    heroButton2Hit.className
                  )}
                  href={firstBlock.cta2Href || writeHref}
                  style={styleVars(heroButtonStyle)}
                  onClick={heroButton2Hit.onClick}
                >
                  {firstBlock.cta2}
                </a>
              ) : null}
            </div>
          </div>
          <div className="taste-band" aria-hidden="true" />
        </div>
      </section>

      <section className="taste-suite" id="rooms" aria-label="Pieces">
        {suiteBlocks.map((block, i) => {
          const blockHit = blockHitHelper(
            block.id,
            selectedId,
            selectedKind,
            onSelectBlock
          )
          const headingHit = hitHelper(
            block.id,
            "heading",
            selectedId,
            selectedKind,
            onSelectElement
          )
          const bodyHit = hitHelper(
            block.id,
            "text",
            selectedId,
            selectedKind,
            onSelectElement
          )
          const imageHit = hitHelper(
            block.id,
            "image",
            selectedId,
            selectedKind,
            onSelectElement
          )
          const buttonHit = hitHelper(
            block.id,
            "button",
            selectedId,
            selectedKind,
            onSelectElement
          )
          const listHit = hitHelper(
            block.id,
            "list",
            selectedId,
            selectedKind,
            onSelectElement
          )

          const headingStyle = styleOf(block, "heading")
          const bodyStyle = styleOf(block, "text")
          const buttonStyle = styleOf(block, "button")
          const imageStyle = styleOf(block, "image")
          const layout = layoutOf(block)

          if (
            block.type === "still" ||
            block.type === "featured" ||
            block.type === "about" ||
            block.type === "hero"
          ) {
            return (
              <article
                key={block.id}
                className={cn("taste-hang", blockHit.className)}
                data-hang={String((i % 3) + 1)}
                id={block.id}
                onClick={blockHit.onClick}
                style={{
                  paddingTop:
                    layout.padT !== undefined
                      ? `min(${layout.padT}px, 25vh)`
                      : undefined,
                  paddingBottom:
                    layout.padB !== undefined
                      ? `min(${layout.padB}px, 25vh)`
                      : undefined,
                  paddingLeft:
                    layout.padL !== undefined
                      ? `min(${layout.padL}px, 20%)`
                      : undefined,
                  paddingRight:
                    layout.padR !== undefined
                      ? `min(${layout.padR}px, 20%)`
                      : undefined,
                }}
              >
                {block.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.image}
                    alt={block.imageAlt || block.heading || ""}
                    className={cn(imageHit.className)}
                    style={imageStyleVars(imageStyle)}
                    onClick={imageHit.onClick}
                  />
                ) : null}
                <div
                  className="taste-hang-cap"
                  style={{
                    textAlign:
                      layout.align === "center"
                        ? "center"
                        : layout.align === "end"
                          ? "right"
                          : undefined,
                    gap: layout.gap ? `${layout.gap}px` : undefined,
                  }}
                >
                  {block.heading ? (
                    <h2
                      className={cn(
                        styleClass(headingStyle),
                        headingHit.className
                      )}
                      style={styleVars(headingStyle)}
                      onClick={headingHit.onClick}
                    >
                      {block.heading}
                    </h2>
                  ) : null}
                  {block.body ? (
                    <p
                      className={cn(styleClass(bodyStyle), bodyHit.className)}
                      style={styleVars(bodyStyle)}
                      onClick={bodyHit.onClick}
                    >
                      {block.body}
                    </p>
                  ) : null}
                  {block.items && block.items.length > 0 ? (
                    <ul
                      className={cn(
                        "mt-3 flex flex-wrap gap-1.5",
                        layout.align === "center" && "justify-center",
                        layout.align === "end" && "justify-end",
                        listHit.className
                      )}
                      onClick={listHit.onClick}
                    >
                      {block.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="taste-pill taste-pill--glass px-2.5 py-1 text-xs"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {block.cta ? (
                    <div
                      className={cn(
                        "mt-3",
                        layout.align === "center" && "text-center",
                        layout.align === "end" && "text-right"
                      )}
                    >
                      <a
                        href={block.ctaHref || "#cta"}
                        className={cn(
                          "taste-pill taste-pill--solid inline-flex px-3 py-1 text-xs",
                          styleClass(buttonStyle),
                          buttonHit.className
                        )}
                        style={styleVars(buttonStyle)}
                        onClick={buttonHit.onClick}
                      >
                        {block.cta}
                      </a>
                    </div>
                  ) : null}
                </div>
              </article>
            )
          }

          if (block.type === "skills" || block.type === "partners") {
            const items = block.items.length ? block.items : portfolio.skills
            return (
              <article
                key={block.id}
                className={cn(
                  "taste-hang col-span-full p-6",
                  blockHit.className
                )}
                id={block.id}
                onClick={blockHit.onClick}
                style={{
                  paddingTop:
                    layout.padT !== undefined
                      ? `min(${layout.padT}px, 25vh)`
                      : undefined,
                  paddingRight:
                    layout.padR !== undefined
                      ? `min(${layout.padR}px, 20%)`
                      : undefined,
                  paddingBottom:
                    layout.padB !== undefined
                      ? `min(${layout.padB}px, 25vh)`
                      : undefined,
                  paddingLeft:
                    layout.padL !== undefined
                      ? `min(${layout.padL}px, 20%)`
                      : undefined,
                }}
              >
                <div
                  className={cn(
                    "flex w-full flex-col",
                    layout.align === "center" &&
                      "mx-auto items-center text-center",
                    layout.align === "end" && "ml-auto items-end text-right"
                  )}
                  style={{
                    maxWidth: layout.maxWidth
                      ? `${layout.maxWidth}px`
                      : undefined,
                    gap: layout.gap ? `${layout.gap}px` : undefined,
                  }}
                >
                  {block.heading ? (
                    <h2
                      className={cn(
                        "mb-2",
                        styleClass(headingStyle),
                        headingHit.className
                      )}
                      style={styleVars(headingStyle)}
                      onClick={headingHit.onClick}
                    >
                      {block.heading}
                    </h2>
                  ) : null}
                  {block.body ? (
                    <p
                      className={cn(
                        "mb-3 max-w-xl text-sm leading-relaxed",
                        styleClass(bodyStyle),
                        bodyHit.className
                      )}
                      style={styleVars(bodyStyle)}
                      onClick={bodyHit.onClick}
                    >
                      {block.body}
                    </p>
                  ) : null}
                  <ul
                    className={cn(
                      "flex flex-wrap gap-2.5",
                      layout.align === "center" && "justify-center",
                      layout.align === "end" && "justify-end",
                      listHit.className
                    )}
                    onClick={listHit.onClick}
                  >
                    {items.map((skill, idx) => (
                      <li
                        key={idx}
                        className="taste-pill taste-pill--glass px-3.5 py-1.5 text-sm"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          }

          if (
            block.type === "why" ||
            block.type === "reviews" ||
            block.type === "faq" ||
            block.type === "features"
          ) {
            return (
              <article
                key={block.id}
                className={cn(
                  "taste-hang col-span-full p-6",
                  blockHit.className
                )}
                id={block.id}
                onClick={blockHit.onClick}
                style={{
                  paddingTop:
                    layout.padT !== undefined
                      ? `min(${layout.padT}px, 25vh)`
                      : undefined,
                  paddingRight:
                    layout.padR !== undefined
                      ? `min(${layout.padR}px, 20%)`
                      : undefined,
                  paddingBottom:
                    layout.padB !== undefined
                      ? `min(${layout.padB}px, 25vh)`
                      : undefined,
                  paddingLeft:
                    layout.padL !== undefined
                      ? `min(${layout.padL}px, 20%)`
                      : undefined,
                }}
              >
                <div
                  className={cn(
                    "flex w-full flex-col",
                    layout.align === "center" &&
                      "mx-auto items-center text-center",
                    layout.align === "end" && "ml-auto items-end text-right"
                  )}
                  style={{
                    maxWidth: layout.maxWidth
                      ? `${layout.maxWidth}px`
                      : undefined,
                    gap: layout.gap ? `${layout.gap}px` : undefined,
                  }}
                >
                  {block.heading ? (
                    <h2
                      className={cn(
                        "mb-3",
                        styleClass(headingStyle),
                        headingHit.className
                      )}
                      style={styleVars(headingStyle)}
                      onClick={headingHit.onClick}
                    >
                      {block.heading}
                    </h2>
                  ) : null}
                  {block.body ? (
                    <p
                      className={cn(
                        "mb-4 max-w-xl text-sm leading-relaxed",
                        styleClass(bodyStyle),
                        bodyHit.className
                      )}
                      style={styleVars(bodyStyle)}
                      onClick={bodyHit.onClick}
                    >
                      {block.body}
                    </p>
                  ) : null}
                  {block.items && block.items.length > 0 ? (
                    <div
                      className={cn(
                        "grid w-full gap-3",
                        template === "ground"
                          ? "grid-cols-1"
                          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
                        listHit.className
                      )}
                      onClick={listHit.onClick}
                    >
                      {block.items.map((item, idx) => {
                        const parts = item.split("|")
                        const title = parts[0]?.trim() || item
                        const desc = parts[1]?.trim() || ""
                        return (
                          <div
                            key={idx}
                            className="taste-pill--glass flex flex-col gap-1.5 rounded-xl p-4 text-left"
                          >
                            <p className="text-sm font-medium">{title}</p>
                            {desc ? (
                              <p className="text-xs leading-relaxed opacity-80">
                                {desc}
                              </p>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          }

          if (block.type === "cta") {
            return (
              <article
                key={block.id}
                className={cn(
                  "taste-hang col-span-full rounded-2xl bg-[var(--taste-panel)] p-8 text-[var(--taste-ink)]",
                  blockHit.className
                )}
                id={block.id}
                onClick={blockHit.onClick}
                style={{
                  paddingTop:
                    layout.padT !== undefined
                      ? `min(${layout.padT}px, 25vh)`
                      : undefined,
                  paddingRight:
                    layout.padR !== undefined
                      ? `min(${layout.padR}px, 20%)`
                      : undefined,
                  paddingBottom:
                    layout.padB !== undefined
                      ? `min(${layout.padB}px, 25vh)`
                      : undefined,
                  paddingLeft:
                    layout.padL !== undefined
                      ? `min(${layout.padL}px, 20%)`
                      : undefined,
                }}
              >
                <div
                  className={cn(
                    "flex w-full flex-col",
                    layout.align === "center" &&
                      "mx-auto items-center text-center",
                    layout.align === "end" && "ml-auto items-end text-right"
                  )}
                  style={{
                    maxWidth: layout.maxWidth
                      ? `${layout.maxWidth}px`
                      : undefined,
                    gap: layout.gap ? `${layout.gap}px` : undefined,
                  }}
                >
                  {block.heading ? (
                    <h2
                      className={cn(
                        styleClass(headingStyle),
                        headingHit.className
                      )}
                      style={styleVars(headingStyle)}
                      onClick={headingHit.onClick}
                    >
                      {block.heading}
                    </h2>
                  ) : null}
                  {block.body ? (
                    <p
                      className={cn(
                        "mt-2 max-w-xl text-sm leading-relaxed opacity-90",
                        styleClass(bodyStyle),
                        bodyHit.className
                      )}
                      style={styleVars(bodyStyle)}
                      onClick={bodyHit.onClick}
                    >
                      {block.body}
                    </p>
                  ) : null}
                  {block.cta ? (
                    <div className="mt-4">
                      <a
                        href={block.ctaHref || "#cta"}
                        className={cn(
                          "taste-pill taste-pill--solid inline-flex text-sm",
                          styleClass(buttonStyle),
                          buttonHit.className
                        )}
                        style={styleVars(buttonStyle)}
                        onClick={buttonHit.onClick}
                      >
                        {block.cta}
                      </a>
                    </div>
                  ) : null}
                </div>
              </article>
            )
          }

          return (
            <article
              key={block.id}
              className={cn("taste-hang col-span-full p-6", blockHit.className)}
              id={block.id}
              onClick={blockHit.onClick}
              style={{
                paddingTop:
                  layout.padT !== undefined
                    ? `min(${layout.padT}px, 25vh)`
                    : undefined,
                paddingRight:
                  layout.padR !== undefined
                    ? `min(${layout.padR}px, 20%)`
                    : undefined,
                paddingBottom:
                  layout.padB !== undefined
                    ? `min(${layout.padB}px, 25vh)`
                    : undefined,
                paddingLeft:
                  layout.padL !== undefined
                    ? `min(${layout.padL}px, 20%)`
                    : undefined,
              }}
            >
              <div
                className={cn(
                  "flex w-full flex-col",
                  layout.align === "center" &&
                    "mx-auto items-center text-center",
                  layout.align === "end" && "ml-auto items-end text-right"
                )}
                style={{
                  maxWidth: layout.maxWidth
                    ? `${layout.maxWidth}px`
                    : undefined,
                  gap: layout.gap ? `${layout.gap}px` : undefined,
                }}
              >
                {block.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.image}
                    alt={block.imageAlt || block.heading || ""}
                    className={cn(
                      "mb-4 w-full max-w-md rounded-xl object-cover",
                      imageHit.className
                    )}
                    style={imageStyleVars(imageStyle)}
                    onClick={imageHit.onClick}
                  />
                ) : null}
                {block.heading ? (
                  <h2
                    className={cn(
                      styleClass(headingStyle),
                      headingHit.className
                    )}
                    style={styleVars(headingStyle)}
                    onClick={headingHit.onClick}
                  >
                    {block.heading}
                  </h2>
                ) : null}
                {block.body ? (
                  <p
                    className={cn(
                      "mt-1 max-w-xl text-sm leading-relaxed",
                      styleClass(bodyStyle),
                      bodyHit.className
                    )}
                    style={styleVars(bodyStyle)}
                    onClick={bodyHit.onClick}
                  >
                    {block.body}
                  </p>
                ) : null}
                {block.items && block.items.length > 0 ? (
                  <ul
                    className={cn(
                      "mt-3 flex flex-wrap gap-2",
                      layout.align === "center" && "justify-center",
                      layout.align === "end" && "justify-end",
                      listHit.className
                    )}
                    onClick={listHit.onClick}
                  >
                    {block.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="taste-pill taste-pill--glass px-3 py-1 text-xs"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {block.cta ? (
                  <div className="mt-4">
                    <a
                      href={block.ctaHref || writeHref}
                      className={cn(
                        "taste-pill taste-pill--solid inline-flex text-sm",
                        styleClass(buttonStyle),
                        buttonHit.className
                      )}
                      style={styleVars(buttonStyle)}
                      onClick={buttonHit.onClick}
                    >
                      {block.cta}
                    </a>
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}

        {syntheticWorkPieces.map((piece, i) => (
          <article
            key={piece.src}
            className="taste-hang"
            data-hang={String(((suiteBlocks.length + i) % 3) + 1)}
            id={`piece-${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={piece.src} alt={piece.title} />
            <div className="taste-hang-cap">
              <h2>{piece.title}</h2>
              <p>{piece.note}</p>
            </div>
          </article>
        ))}
      </section>

      <footer className="taste-end" id="cta">
        {hasSynthetic ? (
          <p className="taste-syn">
            Synthetic student work — replace with yours
          </p>
        ) : null}
        <p className="taste-bio">{portfolio.bio}</p>
        {portfolio.settings?.email ? (
          <a href={`mailto:${portfolio.settings.email}`}>Write {first}</a>
        ) : (
          <p className="taste-bio">Write {first} at critique.</p>
        )}
      </footer>
    </div>
  )
}
