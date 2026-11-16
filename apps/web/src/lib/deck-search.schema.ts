import { CARD_LIMITS, type DeckView } from "@workspace/core"
import { z } from "zod"

/**
 * Deck filters live in the URL (`?categories=…&hideMastered=true&shuffle=123`)
 * so they are shareable, survive reloads and are kept when switching between
 * Study Mode and All Cards. Invalid values are dropped rather than erroring.
 */
export const deckSearchSchema = z.object({
  categories: z
    .array(z.string().max(CARD_LIMITS.category))
    .max(50)
    .optional()
    .catch(undefined),
  hideMastered: z.boolean().optional().catch(undefined),
  shuffle: z.number().int().nonnegative().optional().catch(undefined),
})

export type DeckSearch = z.infer<typeof deckSearchSchema>

export function toDeckView(search: DeckSearch): DeckView {
  return {
    categories: search.categories,
    hideMastered: search.hideMastered,
    shuffleSeed: search.shuffle ?? null,
  }
}
