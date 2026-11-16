import { describe, expect, it } from "vitest"

import { deckEmptyReason, selectCards } from "./index"
import { makeCard } from "./testing"

const html = makeCard({ question: "HTML?", category: "Web", knownCount: 0 })
const css = makeCard({ question: "CSS?", category: "Web", knownCount: 5 })
const paris = makeCard({
  question: "Capital of France?",
  category: "Geography",
  knownCount: 2,
})
const deck = [paris, css, html]
const questions = (cards: ReturnType<typeof selectCards>) =>
  cards.map((c) => c.question)

describe("selectCards", () => {
  it("lists the deck oldest first when no filter or shuffle is active", () => {
    expect(questions(selectCards([css, paris, html], {}))).toEqual([
      "HTML?",
      "CSS?",
      "Capital of France?",
    ])
  })

  it("keeps only the selected categories", () => {
    expect(questions(selectCards(deck, { categories: ["Geography"] }))).toEqual(
      ["Capital of France?"]
    )
  })

  it("treats an empty category selection as all categories", () => {
    expect(selectCards(deck, { categories: [] })).toHaveLength(3)
  })

  it("hides mastered cards on request", () => {
    expect(questions(selectCards(deck, { hideMastered: true }))).toEqual([
      "HTML?",
      "Capital of France?",
    ])
  })

  it("combines category and mastery filters", () => {
    expect(
      questions(selectCards(deck, { categories: ["Web"], hideMastered: true }))
    ).toEqual(["HTML?"])
  })

  describe("shuffle", () => {
    const big = Array.from({ length: 30 }, (_, i) =>
      makeCard({ question: `Q${i}` })
    )

    it("reorders the deck deterministically for a given seed", () => {
      const first = questions(selectCards(big, { shuffleSeed: 42 }))
      const again = questions(selectCards(big, { shuffleSeed: 42 }))
      const unshuffled = questions(selectCards(big, {}))

      expect(first).toEqual(again)
      expect(first).not.toEqual(unshuffled)
      expect([...first].sort()).toEqual([...unshuffled].sort())
    })

    it("gives a different order for a different seed", () => {
      expect(questions(selectCards(big, { shuffleSeed: 1 }))).not.toEqual(
        questions(selectCards(big, { shuffleSeed: 2 }))
      )
    })

    it("keeps the relative order of the remaining cards when one card is removed", () => {
      const shuffled = questions(selectCards(big, { shuffleSeed: 7 }))
      const withoutThird = questions(
        selectCards(
          big.filter((c) => c.question !== shuffled[2]),
          { shuffleSeed: 7 }
        )
      )
      expect(withoutThird).toEqual(shuffled.filter((q) => q !== shuffled[2]))
    })
  })
})

describe("deckEmptyReason", () => {
  it("is null while some card is visible", () => {
    expect(deckEmptyReason(deck, {})).toBeNull()
  })

  it("says the deck itself is empty", () => {
    expect(deckEmptyReason([], { hideMastered: true })).toBe("no-cards")
  })

  it("blames Hide Mastered only when it is what hides the remaining cards", () => {
    expect(deckEmptyReason([css], { hideMastered: true })).toBe("all-mastered")
    expect(
      deckEmptyReason(deck, { categories: ["Web"], hideMastered: true })
    ).toBeNull()
  })

  it("blames the category filter when no card matches it, even with Hide Mastered on", () => {
    expect(
      deckEmptyReason(deck, { categories: ["History"], hideMastered: true })
    ).toBe("no-matches")
  })
})
