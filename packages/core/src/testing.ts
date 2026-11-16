import type { Card } from "./card"

let sequence = 0

/** Test helper: build a card with sensible defaults. */
export function makeCard(overrides: Partial<Card> = {}): Card {
  sequence += 1
  return {
    id: `card-${sequence}`,
    question: `Question ${sequence}?`,
    answer: `Answer ${sequence}`,
    category: "General",
    knownCount: 0,
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, sequence)).toISOString(),
    ...overrides,
  }
}
