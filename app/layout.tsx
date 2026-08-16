import {
  Archivo,
  Bodoni_Moda,
  Bricolage_Grotesque,
  Fredoka,
  Gloock,
  Inter,
  Instrument_Serif,
  Libre_Baskerville,
} from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: true,
})

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
})

const walk = Gloock({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-walk",
  display: "swap",
})

const tasteBody = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-taste-body",
  display: "swap",
})

const ground = Fredoka({
  subsets: ["latin"],
  variable: "--font-ground",
  display: "swap",
})

const aperture = Libre_Baskerville({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-aperture",
  display: "swap",
})

const folio = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-folio",
  display: "swap",
})

const flood = Archivo({
  subsets: ["latin"],
  variable: "--font-flood",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AFM Portfolio",
  description: "Student portfolios for AFM.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans",
        inter.variable,
        instrument.variable,
        walk.variable,
        tasteBody.variable,
        ground.variable,
        aperture.variable,
        folio.variable,
        flood.variable,
      )}
    >
      <body>
        <template
          dangerouslySetInnerHTML={{
            __html: `<!-- THESIS: The public folio is a suite of rooms you walk; the student’s still is the first wall. It refuses a numbered contact-sheet slideshow. OWN-WORLD: Graphite gallery, hung stills, wall-label type, traveling gold floor-band; five tastes Walk / Ground / Aperture / Folio / Flood recast the same walk. Garden olive stays on app chrome. STORY: A visitor stands in the work, then walks into more pieces. FIRST VIEWPORT: Full-bleed still as wall; name as a corner label; project title in the picture; gold band at the floor; next hangings below. FORM: Thesis exhibition walk (seed 48bc16ff, assigned) locked as composition One wall / walk-a. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->`,
          }}
        />
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
