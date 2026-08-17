import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  // `generate` does not connect to Postgres. `migrate` will fail clearly if
  // DATABASE_URL has not been supplied by the deployment environment.
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
})
