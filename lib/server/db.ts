import "server-only"

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "@/db/schema"

const globalForDatabase = globalThis as unknown as {
  afmSql?: ReturnType<typeof postgres>
  afmDb?: ReturnType<typeof createDatabase>
}

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured")
  }
  const sql =
    globalForDatabase.afmSql ??
    postgres(databaseUrl, {
    max: process.env.NODE_ENV === "production" ? 10 : 2,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  })

  if (process.env.NODE_ENV !== "production") globalForDatabase.afmSql = sql
  return drizzle(sql, { schema })
}

type Database = ReturnType<typeof createDatabase>

/**
 * Lazily initializes Postgres on the first request. Next can therefore collect
 * route metadata and build an image without live production secrets.
 */
export function getDb(): Database {
  const existing = globalForDatabase.afmDb
  if (existing) return existing
  const database = createDatabase()
  globalForDatabase.afmDb = database
  return database
}

/** Backwards-compatible lazy facade for server modules that use `db.select()`. */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const database = getDb()
    return Reflect.get(database, property, database)
  },
})
