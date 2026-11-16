import { cardStatus, type Card } from "./card"

export type Stats = {
  total: number
  mastered: number
  inProgress: number
  notStarted: number
}

/** Counts for the "Study Statistics" panel. */
export function getStats(cards: ReadonlyArray<Card>): Stats {
  const stats: Stats = {
    total: cards.length,
    mastered: 0,
    inProgress: 0,
    notStarted: 0,
  }
  for (const card of cards) {
    const status = cardStatus(card)
    if (status === "mastered") stats.mastered++
    else if (status === "in-progress") stats.inProgress++
    else stats.notStarted++
  }
  return stats
}
