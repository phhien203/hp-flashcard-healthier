import { and, asc, eq, sql } from "drizzle-orm"

import {
  type Card,
  type CardInput,
  MASTERY_THRESHOLD,
  type ProgressAction,
  STARTER_DECK,
} from "@workspace/core"

import { type CardRow, cards, users } from "./schema"

import type * as schema from "./schema"
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core"

/** Any Drizzle SQLite database: D1 in the Worker, better-sqlite3 in tests. */
export type Database = BaseSQLiteDatabase<
  "sync" | "async",
  unknown,
  typeof schema
>

/**
 * D1 caps a statement at 100 bound parameters. A card insert binds 8 values,
 * so starter-deck rows are written 12 at a time.
 */
const ROWS_PER_INSERT = 12

/**
 * Every read and write is scoped to a user id. Callers pass the id of the
 * authenticated user and never see another user's rows.
 */
export type CardRepository = ReturnType<typeof createCardRepository>

export function createCardRepository(db: Database) {
  /** Registers the user on first contact and copies in the starter deck. */
  async function ensureUser(userId: string) {
    const inserted = await db
      .insert(users)
      .values({ id: userId })
      .onConflictDoNothing()
      .returning({ id: users.id })
    if (inserted.length === 0) return

    // Backdate the starter cards (1 ms apart, oldest first) so they keep their
    // curated order and always sort before anything the user creates next.
    const start = Date.now() - STARTER_DECK.length
    const rows = STARTER_DECK.map((card, i) => ({
      userId,
      question: card.question,
      answer: card.answer,
      category: card.category,
      knownCount: card.knownCount,
      createdAt: new Date(start + i),
      updatedAt: new Date(start + i),
    }))
    for (let i = 0; i < rows.length; i += ROWS_PER_INSERT) {
      await db.insert(cards).values(rows.slice(i, i + ROWS_PER_INSERT))
    }
  }

  const ownedBy = (userId: string, cardId: string) =>
    and(eq(cards.userId, userId), eq(cards.id, cardId))

  return {
    async listCards(userId: string): Promise<Card[]> {
      await ensureUser(userId)
      const rows = await db
        .select()
        .from(cards)
        .where(eq(cards.userId, userId))
        .orderBy(asc(cards.createdAt), asc(cards.id))
      return rows.map(toCard)
    },

    async createCard(userId: string, input: CardInput): Promise<Card> {
      await ensureUser(userId)
      const [row] = await db
        .insert(cards)
        .values({ userId, ...input })
        .returning()
      return toCard(row!)
    },

    /** Returns `null` when the card does not exist or belongs to someone else. */
    async updateCard(
      userId: string,
      cardId: string,
      input: CardInput
    ): Promise<Card | null> {
      const [row] = await db
        .update(cards)
        .set({ ...input, updatedAt: new Date() })
        .where(ownedBy(userId, cardId))
        .returning()
      return row ? toCard(row) : null
    },

    /** Applies "I Know This" or "Reset Progress" atomically in SQL. */
    async recordProgress(
      userId: string,
      cardId: string,
      action: ProgressAction
    ): Promise<Card | null> {
      const knownCount =
        action === "reset"
          ? 0
          : sql`min(${cards.knownCount} + 1, ${MASTERY_THRESHOLD})`
      const [row] = await db
        .update(cards)
        .set({ knownCount, updatedAt: new Date() })
        .where(ownedBy(userId, cardId))
        .returning()
      return row ? toCard(row) : null
    },

    async deleteCard(userId: string, cardId: string): Promise<boolean> {
      const deleted = await db
        .delete(cards)
        .where(ownedBy(userId, cardId))
        .returning({ id: cards.id })
      return deleted.length > 0
    },
  }
}

function toCard(row: CardRow): Card {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    knownCount: row.knownCount,
    createdAt: row.createdAt.toISOString(),
  }
}
