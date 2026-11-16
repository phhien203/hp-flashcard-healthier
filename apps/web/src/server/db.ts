import { env } from "cloudflare:workers"
import { createCardRepository } from "@workspace/db"
import * as schema from "@workspace/db/schema"
import { drizzle } from "drizzle-orm/d1"

/** Card repository bound to the Worker's D1 database. */
export function cardRepository() {
  return createCardRepository(drizzle(env.DB, { schema }))
}
