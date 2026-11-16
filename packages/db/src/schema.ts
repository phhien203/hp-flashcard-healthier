import { sql } from "drizzle-orm"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

/** Millisecond timestamp column that defaults to the insert time. */
const timestampMs = (name: string) =>
  integer(name, { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`)

/**
 * One row per Clerk user that has opened the app. The row is created the
 * first time the user loads their deck, which is also when the starter deck
 * is copied in, so its existence doubles as the "already seeded" marker.
 */
export const users = sqliteTable("users", {
  /** Clerk user id, e.g. `user_2abc…`. */
  id: text("id").primaryKey(),
  createdAt: timestampMs("created_at"),
})

export const cards = sqliteTable(
  "cards",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    category: text("category").notNull(),
    /** "I Know This" presses, 0–5; 5 means mastered. */
    knownCount: integer("known_count").notNull().default(0),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at"),
  },
  (t) => [index("cards_user_id_created_at_idx").on(t.userId, t.createdAt)]
)

export type CardRow = typeof cards.$inferSelect
