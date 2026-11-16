import { describe, expect, it } from "vitest"
import { CARD_LIMITS, cardInputSchema } from "./index"

const errorsFor = (input: unknown) => {
  const result = cardInputSchema.safeParse(input)
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((i) => [i.path.join("."), i.message])
      )
}

describe("cardInputSchema", () => {
  it("accepts a complete card and trims surrounding whitespace", () => {
    expect(
      cardInputSchema.parse({
        question: "  What is the capital of France? ",
        answer: "\nParis\n",
        category: " Geography ",
      })
    ).toEqual({
      question: "What is the capital of France?",
      answer: "Paris",
      category: "Geography",
    })
  })

  it("uses the copy from the design for each missing field", () => {
    expect(errorsFor({ question: "", answer: "   ", category: "" })).toEqual({
      question: "Please enter a question.",
      answer: "Please enter an answer.",
      category: "Please enter a category.",
    })
  })

  it("rejects text longer than the field limits", () => {
    expect(
      errorsFor({
        question: "q".repeat(CARD_LIMITS.question + 1),
        answer: "a".repeat(CARD_LIMITS.answer + 1),
        category: "c".repeat(CARD_LIMITS.category + 1),
      })
    ).toEqual({
      question: `Keep the question under ${CARD_LIMITS.question} characters.`,
      answer: `Keep the answer under ${CARD_LIMITS.answer} characters.`,
      category: `Keep the category under ${CARD_LIMITS.category} characters.`,
    })
  })
})
