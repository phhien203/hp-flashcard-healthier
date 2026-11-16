import type { Card } from "./card"

export type CategoryCount = { name: string; count: number }

/** Options for the category filter, sorted A–Z ignoring case. */
export function getCategoryCounts(cards: ReadonlyArray<Card>): CategoryCount[] {
  const counts = new Map<string, number>()
  for (const card of cards) {
    counts.set(card.category, (counts.get(card.category) ?? 0) + 1)
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
}
