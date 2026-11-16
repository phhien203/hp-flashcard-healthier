import { useEffect, useReducer } from "react";
import {
  type Card,
  type CardInput,
  type Filters,
  markKnown,
  normalizeInput,
  resetProgress,
  shuffle,
} from "./cards";
import { seedCards } from "./seed";

export type State = {
  cards: Card[];
  filters: Filters;
  /** Card ids in shuffled order, or null for the natural (creation) order. */
  order: string[] | null;
};

export type Action =
  | { type: "create"; input: CardInput; id: string }
  | { type: "update"; id: string; input: CardInput }
  | { type: "delete"; id: string }
  | { type: "markKnown"; id: string }
  | { type: "resetProgress"; id: string }
  | { type: "setCategories"; categories: string[] }
  | { type: "setHideMastered"; hideMastered: boolean }
  | { type: "shuffle"; random?: () => number };

export const initialState: State = {
  cards: seedCards,
  filters: { categories: [], hideMastered: false },
  order: null,
};

const updateCard = (cards: Card[], id: string, fn: (card: Card) => Card) =>
  cards.map((card) => (card.id === id ? fn(card) : card));

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "create": {
      const card: Card = { id: action.id, ...normalizeInput(action.input), knownCount: 0 };
      // Newest cards first, so a freshly created card is visible at the top of the grid.
      return {
        ...state,
        cards: [card, ...state.cards],
        order: state.order ? [card.id, ...state.order] : null,
      };
    }
    case "update":
      return {
        ...state,
        cards: updateCard(state.cards, action.id, (c) => ({ ...c, ...normalizeInput(action.input) })),
      };
    case "delete": {
      const cards = state.cards.filter((c) => c.id !== action.id);
      // Drop a category filter that no longer matches any card.
      const remaining = new Set(cards.map((c) => c.category));
      return {
        ...state,
        cards,
        order: state.order?.filter((id) => id !== action.id) ?? null,
        filters: {
          ...state.filters,
          categories: state.filters.categories.filter((c) => remaining.has(c)),
        },
      };
    }
    case "markKnown":
      return { ...state, cards: updateCard(state.cards, action.id, markKnown) };
    case "resetProgress":
      return { ...state, cards: updateCard(state.cards, action.id, resetProgress) };
    case "setCategories":
      return { ...state, filters: { ...state.filters, categories: action.categories } };
    case "setHideMastered":
      return { ...state, filters: { ...state.filters, hideMastered: action.hideMastered } };
    case "shuffle":
      return { ...state, order: shuffle(state.cards.map((c) => c.id), action.random) };
  }
}

const STORAGE_KEY = "flashcard-app:v1";

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<State>;
    if (!Array.isArray(parsed.cards)) return initialState;
    return {
      cards: parsed.cards,
      filters: { ...initialState.filters, ...parsed.filters },
      order: Array.isArray(parsed.order) ? parsed.order : null,
    };
  } catch {
    return initialState;
  }
}

/** App state, persisted to localStorage so progress survives reloads. */
export function useFlashcardStore() {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable (private mode) — keep working in memory.
    }
  }, [state]);

  return [state, dispatch] as const;
}

export const newCardId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `card-${Date.now()}-${Math.random().toString(36).slice(2)}`;
