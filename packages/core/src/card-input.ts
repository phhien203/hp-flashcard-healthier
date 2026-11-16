import { z } from "zod"

/** Maximum lengths, enforced on both the client form and the server. */
export const CARD_LIMITS = {
  question: 200,
  answer: 1000,
  category: 40,
} as const

const field = (name: keyof typeof CARD_LIMITS, missing: string) =>
  z
    .string()
    .trim()
    .min(1, missing)
    .max(
      CARD_LIMITS[name],
      `Keep the ${name} under ${CARD_LIMITS[name]} characters.`
    )

/** What the learner types to create or edit a card. */
export const cardInputSchema = z.object({
  question: field("question", "Please enter a question."),
  answer: field("answer", "Please enter an answer."),
  category: field("category", "Please enter a category."),
})

export type CardInput = z.infer<typeof cardInputSchema>
