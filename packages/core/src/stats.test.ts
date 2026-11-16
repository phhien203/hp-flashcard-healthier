import { describe, expect, it } from "vitest"

import { getStats } from "./index"
import { makeCard } from "./testing"

describe("getStats", () => {
  it("buckets cards into mastered, in progress and not started", () => {
    const cards = [
      makeCard({ knownCount: 0 }),
      makeCard({ knownCount: 0 }),
      makeCard({ knownCount: 1 }),
      makeCard({ knownCount: 4 }),
      makeCard({ knownCount: 5 }),
    ]

    expect(getStats(cards)).toEqual({
      total: 5,
      mastered: 1,
      inProgress: 2,
      notStarted: 2,
    })
  })

  it("reports zeros for an empty deck", () => {
    expect(getStats([])).toEqual({
      total: 0,
      mastered: 0,
      inProgress: 0,
      notStarted: 0,
    })
  })
})
