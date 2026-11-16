import { describe, expect, it } from "vitest"
import { STARTER_DECK, getStats, cardInputSchema } from "./index"

describe("STARTER_DECK", () => {
  it("matches the deck shown in the design: 40 cards, 11 mastered, 21 in progress, 8 not started", () => {
    const stats = getStats(
      STARTER_DECK.map((card, i) => ({ ...card, id: String(i), createdAt: "" }))
    )
    expect(stats).toEqual({
      total: 40,
      mastered: 11,
      inProgress: 21,
      notStarted: 8,
    })
  })

  it("only contains cards that pass validation", () => {
    for (const card of STARTER_DECK) {
      expect(cardInputSchema.safeParse(card).success).toBe(true)
    }
  })
})
