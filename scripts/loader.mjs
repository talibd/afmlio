import { pathToFileURL } from "node:url"
import path from "node:path"
import fs from "node:fs"

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const relative = specifier.slice(2)
    const base = path.resolve(process.cwd(), relative)
    const candidates = [
      base,
      base + ".ts",
      base + ".tsx",
      base + ".js",
      base + ".mjs",
      path.join(base, "index.ts"),
      path.join(base, "index.tsx"),
      path.join(base, "index.js"),
    ]
    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return nextResolve(pathToFileURL(candidate).href, context)
      }
    }
  }
  return nextResolve(specifier, context)
}
