import { describe, expect, it } from "vitest"

import { getCategoryCounts } from "./index"
import { makeCard } from "./testing"

describe("getCategoryCounts", () => {
  it("lists every category once, alphabetically and case-insensitively, with its card count", () => {
    const cards = [
      makeCard({ category: "JavaScript" }),
      makeCard({ category: "CSS" }),
      makeCard({ category: "art" }),
      makeCard({ category: "JavaScript" }),
    ]

    expect(getCategoryCounts(cards)).toEqual([
      { name: "art", count: 1 },
      { name: "CSS", count: 1 },
      { name: "JavaScript", count: 2 },
    ])
  })
})
