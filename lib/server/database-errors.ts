export function isDatabaseErrorCode(error: unknown, code: string): boolean {
  const visited = new Set<unknown>()
  let current = error

  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current)

    if ("code" in current && current.code === code) return true
    current = "cause" in current ? current.cause : undefined
  }

  return false
}
