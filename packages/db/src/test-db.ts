import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { fileURLToPath } from "node:url"
import * as schema from "./schema"

/**
 * In-memory SQLite with the real migrations applied. D1 is SQLite, so this
 * exercises the same SQL the Worker runs, including the generated migrations.
 */
export function createTestDb() {
  const sqlite = new Database(":memory:")
  sqlite.pragma("foreign_keys = ON")
  const db = drizzle(sqlite, { schema })
  migrate(db, {
    migrationsFolder: fileURLToPath(new URL("../migrations", import.meta.url)),
  })
  return db
}
