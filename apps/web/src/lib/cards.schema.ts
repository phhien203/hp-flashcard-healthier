import { PROGRESS_ACTIONS, cardInputSchema } from "@workspace/core"
import { z } from "zod"

/**
 * Inputs of the card server functions. Client-safe: the mutation hooks type
 * their variables from these, and the server functions validate with them.
 * The card fields themselves (`cardInputSchema`) are owned by `@workspace/core`.
 */
const cardId = z.string().min(1).max(64)

export const updateCardSchema = z.object({ id: cardId, input: cardInputSchema })
export type UpdateCardVars = z.infer<typeof updateCardSchema>

export const recordProgressSchema = z.object({
  id: cardId,
  action: z.enum(PROGRESS_ACTIONS),
})
export type RecordProgressVars = z.infer<typeof recordProgressSchema>

export const deleteCardSchema = z.object({ id: cardId })
