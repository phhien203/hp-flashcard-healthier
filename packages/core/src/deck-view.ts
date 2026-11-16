import { isMastered, type Card } from "./card"

/**
 * How the learner is currently looking at the deck. Shared by Study Mode and
 * All Cards, and stored in the URL so it survives reloads and navigation.
 */
export type DeckView = {
  /** Categories to include. Empty or missing means "All Categories". */
  categories?: ReadonlyArray<string>
  hideMastered?: boolean
  /** When set, cards are shuffled into a stable order derived from this seed. */
  shuffleSeed?: number | null
}

/** Cards visible under `view`, in display order. */
export function selectCards(
  cards: ReadonlyArray<Card>,
  view: DeckView
): Card[] {
  const selected = new Set(view.categories ?? [])
  const visible = cards.filter(
    (card) =>
      (selected.size === 0 || selected.has(card.category)) &&
      !(view.hideMastered && isMastered(card))
  )

  const seed = view.shuffleSeed
  if (seed == null) {
    return visible.sort(
      (a, b) =>
        a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
    )
  }

  // Rank each card by a hash of (seed, id) rather than shuffling the array.
  // The order is then a pure function of the seed and the card ids, so
  // marking, editing or deleting one card never reshuffles the others.
  const rank = new Map(
    visible.map((card) => [card.id, hash(`${seed}:${card.id}`)])
  )
  return visible.sort(
    (a, b) => rank.get(a.id)! - rank.get(b.id)! || a.id.localeCompare(b.id)
  )
}

/** A fresh seed for the Shuffle button. */
export function newShuffleSeed(random: () => number = Math.random): number {
  return Math.floor(random() * 2 ** 31)
}

/** 32-bit FNV-1a followed by a murmur3 finalizer for good bit dispersion. */
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}
