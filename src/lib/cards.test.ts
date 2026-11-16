import { describe, expect, it } from "vitest";
import {
  type Card,
  MASTERY_THRESHOLD,
  applyOrder,
  filterCards,
  getCategoryCounts,
  getStats,
  markKnown,
  resetProgress,
  shuffle,
  validateCard,
} from "./cards";
import { seedCards } from "./seed";
import { initialState, reducer } from "./store";

const card = (id: string, category: string, knownCount: number): Card => ({
  id,
  question: `Q${id}`,
  answer: `A${id}`,
  category,
  knownCount,
});

describe("seed deck", () => {
  it("matches the Figma mock: 40 cards, 11 mastered, 21 in progress, 8 not started", () => {
    expect(getStats(seedCards)).toEqual({ total: 40, mastered: 11, inProgress: 21, notStarted: 8 });
  });

  it("matches the category counts from the dropdown design", () => {
    expect(getCategoryCounts(seedCards)).toEqual([
      { name: "Art", count: 1 },
      { name: "CSS", count: 6 },
      { name: "Geography", count: 4 },
      { name: "History", count: 1 },
      { name: "HTML", count: 3 },
      { name: "JavaScript", count: 14 },
      { name: "Literature", count: 1 },
      { name: "Mathematics", count: 1 },
      { name: "Programming Concepts", count: 1 },
      { name: "Science", count: 3 },
      { name: "Web Development", count: 5 },
    ]);
  });
});

describe("progress", () => {
  it("markKnown increments and caps at the mastery threshold", () => {
    let c = card("1", "X", MASTERY_THRESHOLD - 1);
    c = markKnown(c);
    expect(c.knownCount).toBe(MASTERY_THRESHOLD);
    expect(markKnown(c).knownCount).toBe(MASTERY_THRESHOLD);
  });

  it("resetProgress returns the card to 0", () => {
    expect(resetProgress(card("1", "X", 4)).knownCount).toBe(0);
  });
});

describe("filterCards", () => {
  const cards = [card("1", "A", 0), card("2", "B", 5), card("3", "A", 5), card("4", "C", 2)];

  it("returns everything with no filters", () => {
    expect(filterCards(cards, { categories: [], hideMastered: false })).toHaveLength(4);
  });

  it("filters by any of the selected categories", () => {
    const ids = filterCards(cards, { categories: ["A", "C"], hideMastered: false }).map((c) => c.id);
    expect(ids).toEqual(["1", "3", "4"]);
  });

  it("hides mastered cards", () => {
    const ids = filterCards(cards, { categories: ["A"], hideMastered: true }).map((c) => c.id);
    expect(ids).toEqual(["1"]);
  });
});

describe("ordering", () => {
  it("shuffle keeps every item", () => {
    const items = [1, 2, 3, 4, 5];
    expect(shuffle(items).sort()).toEqual(items);
  });

  it("applyOrder sorts by id order and puts unknown ids last", () => {
    const cards = [card("a", "X", 0), card("b", "X", 0), card("c", "X", 0)];
    expect(applyOrder(cards, ["c", "a"]).map((c) => c.id)).toEqual(["c", "a", "b"]);
    expect(applyOrder(cards, null)).toBe(cards);
  });
});

describe("validateCard", () => {
  it("requires every field, ignoring whitespace", () => {
    expect(validateCard({ question: " ", answer: "", category: "\n" })).toEqual({
      question: "Please enter a question.",
      answer: "Please enter an answer.",
      category: "Please enter a category.",
    });
    expect(validateCard({ question: "Q", answer: "A", category: "C" })).toEqual({});
  });
});

describe("reducer", () => {
  const base = { ...initialState, cards: [card("1", "A", 0), card("2", "B", 3)] };

  it("creates a trimmed card at the top with no progress", () => {
    const next = reducer(base, { type: "create", id: "new", input: { question: " Q ", answer: "A", category: " Cat " } });
    expect(next.cards[0]).toEqual({ id: "new", question: "Q", answer: "A", category: "Cat", knownCount: 0 });
  });

  it("updates content but keeps progress", () => {
    const next = reducer(base, { type: "update", id: "2", input: { question: "New", answer: "Ans", category: "B" } });
    expect(next.cards[1]).toMatchObject({ question: "New", knownCount: 3 });
  });

  it("deletes a card and drops a category filter that no longer exists", () => {
    const filtered = { ...base, filters: { categories: ["B"], hideMastered: false }, order: ["2", "1"] };
    const next = reducer(filtered, { type: "delete", id: "2" });
    expect(next.cards.map((c) => c.id)).toEqual(["1"]);
    expect(next.filters.categories).toEqual([]);
    expect(next.order).toEqual(["1"]);
  });

  it("shuffle stores a permutation of all ids", () => {
    const next = reducer(base, { type: "shuffle", random: () => 0 });
    expect([...(next.order ?? [])].sort()).toEqual(["1", "2"]);
  });
});
