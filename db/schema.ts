import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const portfolioStatus = pgEnum("portfolio_status", [
  "draft",
  "published",
])

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    onboardingDraft: jsonb("onboarding_draft")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)]
)

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ]
)

export const portfolios = pgTable(
  "portfolios",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    template: text("template").notNull().default("frame"),
    status: portfolioStatus("status").notNull().default("draft"),
    draftSnapshot: jsonb("draft_snapshot")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    publishedSnapshot: jsonb("published_snapshot").$type<Record<
      string,
      unknown
    > | null>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("portfolios_slug_unique").on(table.slug),
    index("portfolios_user_id_updated_at_idx").on(
      table.userId,
      table.updatedAt
    ),
    index("portfolios_publication_idx").on(table.status, table.slug),
  ]
)

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    portfolioId: uuid("portfolio_id").references(() => portfolios.id, {
      onDelete: "set null",
    }),
    key: text("object_key").notNull(),
    url: text("url").notNull(),
    kind: text("kind").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    status: text("status").notNull().default("ready"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("media_assets_object_key_unique").on(table.key),
    index("media_assets_user_id_created_at_idx").on(
      table.userId,
      table.createdAt
    ),
    index("media_assets_portfolio_id_idx").on(table.portfolioId),
  ]
)

export type User = typeof users.$inferSelect
export type PortfolioRecord = typeof portfolios.$inferSelect
export type MediaAssetRecord = typeof mediaAssets.$inferSelect
