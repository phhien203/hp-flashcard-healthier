/** Number of "I Know This" presses needed before a card counts as mastered. */
export const MASTERY_THRESHOLD = 5;

export type Card = {
  id: string;
  question: string;
  answer: string;
  category: string;
  /** How many times the learner has marked this card as known (0..MASTERY_THRESHOLD). */
  knownCount: number;
};

export type CardInput = Pick<Card, "question" | "answer" | "category">;

export type Filters = {
  /** Selected categories. Empty means "All Categories". */
  categories: string[];
  hideMastered: boolean;
};

export type Stats = {
  total: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
};

export const isMastered = (card: Card) => card.knownCount >= MASTERY_THRESHOLD;

export function getStats(cards: Card[]): Stats {
  const stats: Stats = { total: cards.length, mastered: 0, inProgress: 0, notStarted: 0 };
  for (const card of cards) {
    if (isMastered(card)) stats.mastered++;
    else if (card.knownCount > 0) stats.inProgress++;
    else stats.notStarted++;
  }
  return stats;
}

/** Categories sorted alphabetically (case-insensitive) with their card counts. */
export function getCategoryCounts(cards: Card[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const card of cards) counts.set(card.category, (counts.get(card.category) ?? 0) + 1);
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export function filterCards(cards: Card[], filters: Filters): Card[] {
  const selected = new Set(filters.categories);
  return cards.filter(
    (card) =>
      (selected.size === 0 || selected.has(card.category)) &&
      !(filters.hideMastered && isMastered(card)),
  );
}

/** Returns `cards` ordered by `order` (a list of ids); ids missing from `order` keep their place at the end. */
export function applyOrder(cards: Card[], order: string[] | null): Card[] {
  if (!order) return cards;
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...cards].sort(
    (a, b) => (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  );
}

/** Fisher–Yates shuffle. `random` is injectable for tests. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const markKnown = (card: Card): Card => ({
  ...card,
  knownCount: Math.min(card.knownCount + 1, MASTERY_THRESHOLD),
});

export const resetProgress = (card: Card): Card => ({ ...card, knownCount: 0 });

export type CardErrors = Partial<Record<keyof CardInput, string>>;

const ERROR_MESSAGES: Record<keyof CardInput, string> = {
  question: "Please enter a question.",
  answer: "Please enter an answer.",
  category: "Please enter a category.",
};

export function validateCard(input: CardInput): CardErrors {
  const errors: CardErrors = {};
  for (const field of Object.keys(ERROR_MESSAGES) as (keyof CardInput)[]) {
    if (!input[field].trim()) errors[field] = ERROR_MESSAGES[field];
  }
  return errors;
}

export const normalizeInput = (input: CardInput): CardInput => ({
  question: input.question.trim(),
  answer: input.answer.trim(),
  category: input.category.trim(),
});
