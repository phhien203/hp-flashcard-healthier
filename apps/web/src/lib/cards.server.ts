import { env } from "cloudflare:workers"
import { createServerOnlyFn } from "@tanstack/react-start"
import { createCardRepository } from "@workspace/db"
import * as schema from "@workspace/db/schema"
import { drizzle } from "drizzle-orm/d1"

/**
 * Card repository bound to the Worker's D1 database. Server-only: call it from
 * server function handlers, never from route or component code.
 */
export const cardRepository = createServerOnlyFn(() =>
  createCardRepository(drizzle(env.DB, { schema }))
)
