import { z } from "zod"

export const jsonObjectSchema = z.record(z.string(), z.unknown())

export const portfolioCreateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .min(2)
    .max(64)
    .optional(),
  template: z.literal("frame").default("frame"),
  onboarding: jsonObjectSchema.optional(),
  draftSnapshot: jsonObjectSchema.optional(),
})

export const portfolioPatchSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .min(2)
      .max(64)
      .optional(),
    draftSnapshot: jsonObjectSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "No changes supplied")

export function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64) || "portfolio"
  )
}
