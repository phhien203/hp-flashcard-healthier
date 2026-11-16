/** Number of "I Know This" presses after which a card counts as mastered. */
export const MASTERY_THRESHOLD = 5

export type Card = {
  id: string
  question: string
  answer: string
  category: string
  /** Times the learner pressed "I Know This", from 0 to MASTERY_THRESHOLD. */
  knownCount: number
  /** ISO-8601 creation timestamp; decks are listed oldest first. */
  createdAt: string
}

export type CardStatus = "not-started" | "in-progress" | "mastered"

export function cardStatus(card: Pick<Card, "knownCount">): CardStatus {
  if (card.knownCount >= MASTERY_THRESHOLD) return "mastered"
  if (card.knownCount > 0) return "in-progress"
  return "not-started"
}

export const isMastered = (card: Pick<Card, "knownCount">) =>
  cardStatus(card) === "mastered"
