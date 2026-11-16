import { STARTER_DECK, getStats } from "@workspace/core"
import { beforeEach, describe, expect, it } from "vitest"
import { createCardRepository, type CardRepository } from "./index"
import { createTestDb } from "./test-db"

const newCard = {
  question: "What is 2 + 2?",
  answer: "4",
  category: "Mathematics",
}

describe("card repository", () => {
  let repo: CardRepository

  beforeEach(() => {
    repo = createCardRepository(createTestDb())
  })

  describe("listCards", () => {
    it("gives a first-time user the starter deck, in starter order", async () => {
      const cards = await repo.listCards("user_a")

      expect(cards.map((c) => c.question)).toEqual(
        STARTER_DECK.map((c) => c.question)
      )
      expect(getStats(cards)).toEqual({
        total: 40,
        mastered: 11,
        inProgress: 21,
        notStarted: 8,
      })
    })

    it("seeds only once, so a user who deletes everything keeps an empty deck", async () => {
      for (const card of await repo.listCards("user_a")) {
        await repo.deleteCard("user_a", card.id)
      }

      expect(await repo.listCards("user_a")).toEqual([])
    })
  })

  describe("createCard", () => {
    it("adds a not-started card at the end of the user's deck", async () => {
      await repo.listCards("user_a")
      const created = await repo.createCard("user_a", newCard)

      expect(created).toMatchObject({ ...newCard, knownCount: 0 })
      const cards = await repo.listCards("user_a")
      expect(cards.at(-1)).toEqual(created)
      expect(cards).toHaveLength(41)
    })

    it("works for a user who has never listed their deck", async () => {
      const created = await repo.createCard("user_new", newCard)

      expect(await repo.listCards("user_new")).toContainEqual(created)
    })
  })

  describe("updateCard", () => {
    it("changes the text but keeps the learner's progress", async () => {
      const [first] = await repo.listCards("user_a")
      await repo.recordProgress("user_a", first!.id, "know")

      const updated = await repo.updateCard("user_a", first!.id, newCard)

      expect(updated).toMatchObject({
        ...newCard,
        id: first!.id,
        knownCount: 1,
      })
    })
  })

  describe("recordProgress", () => {
    it("counts up to mastered and no further, and resets to zero", async () => {
      const { id } = await repo.createCard("user_a", newCard)

      for (let i = 0; i < 7; i++)
        await repo.recordProgress("user_a", id, "know")
      expect(
        (await repo.recordProgress("user_a", id, "know"))?.knownCount
      ).toBe(5)

      expect(
        (await repo.recordProgress("user_a", id, "reset"))?.knownCount
      ).toBe(0)
    })
  })

  describe("isolation between users", () => {
    it("never lets one user read, change or delete another user's card", async () => {
      const mine = await repo.createCard("user_a", newCard)

      expect(await repo.listCards("user_b")).not.toContainEqual(mine)
      expect(
        await repo.updateCard("user_b", mine.id, { ...newCard, answer: "5" })
      ).toBeNull()
      expect(await repo.recordProgress("user_b", mine.id, "know")).toBeNull()
      expect(await repo.deleteCard("user_b", mine.id)).toBe(false)

      expect(await repo.listCards("user_a")).toContainEqual(mine)
    })
  })

  it("reports whether a delete removed anything", async () => {
    const { id } = await repo.createCard("user_a", newCard)

    expect(await repo.deleteCard("user_a", id)).toBe(true)
    expect(await repo.deleteCard("user_a", id)).toBe(false)
  })
})
