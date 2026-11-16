import { type ReactNode, useEffect, useState } from "react";
import { type Card, getStats, isMastered } from "../../lib/cards";
import { EmptyState } from "../EmptyState";
import { Button } from "../ui/Button";
import { angleLeft, angleRight, checkCircle, undo } from "../ui/icons";
import { StatsPanel } from "./StatsPanel";
import { StudyCard } from "./StudyCard";

type StudyViewProps = {
  allCards: Card[];
  /** Cards after filters + shuffle order. */
  cards: Card[];
  filterBar: ReactNode;
  hasCategoryFilter: boolean;
  onMarkKnown: (id: string) => void;
  onResetProgress: (id: string) => void;
  onGoToAllCards: () => void;
};

export function StudyView({
  allCards,
  cards,
  filterBar,
  hasCategoryFilter,
  onMarkKnown,
  onResetProgress,
  onGoToAllCards,
}: StudyViewProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Keep the index valid when the deck shrinks (filters, hide mastered, deletes).
  const safeIndex = cards.length === 0 ? 0 : Math.min(index, cards.length - 1);
  const card = cards[safeIndex] as Card | undefined;

  const go = (delta: number) => {
    if (cards.length === 0) return;
    setIndex((safeIndex + delta + cards.length) % cards.length);
    setRevealed(false);
  };

  // ← / → to move between cards (ignored while typing or when a dialog is open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [role=group], dialog")) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const sectionClasses =
    "flex min-w-0 flex-1 flex-col rounded-16 border border-r-3 border-b-3 border-neutral-900 bg-neutral-0";

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <section aria-label="Flashcard" className={`${sectionClasses} ${card ? "" : "min-h-[634px]"}`}>
        <div className="border-b border-neutral-900 px-4 py-3 sm:p-5">{filterBar}</div>

        {card ? (
          <>
            <div className="flex flex-col items-center gap-5 px-4 py-6 sm:p-5">
              <StudyCard card={card} revealed={revealed} onToggle={() => setRevealed((r) => !r)} />
              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:gap-5">
                {isMastered(card) ? (
                  <Button variant="primary" icon={checkCircle} disabled>
                    Already Mastered
                  </Button>
                ) : (
                  <Button variant="primary" icon={checkCircle} onClick={() => onMarkKnown(card.id)}>
                    I Know This
                  </Button>
                )}
                <Button
                  variant="secondary"
                  icon={undo}
                  onClick={() => onResetProgress(card.id)}
                >
                  Reset Progress
                </Button>
              </div>
            </div>

            <nav
              aria-label="Card navigation"
              className="flex items-center justify-between border-t border-neutral-900 p-4 sm:p-5"
            >
              <Button
                variant="outline"
                icon={angleLeft}
                onClick={() => go(-1)}
                aria-label="Previous card"
                className="max-sm:size-10 max-sm:px-0"
              >
                <span className="max-sm:sr-only">Previous</span>
              </Button>
              <p className="text-preset-5 text-neutral-600" aria-live="polite">
                Card {safeIndex + 1} of {cards.length}
              </p>
              <Button
                variant="outline"
                iconEnd={angleRight}
                onClick={() => go(1)}
                aria-label="Next card"
                className="max-sm:size-10 max-sm:px-0"
              >
                <span className="max-sm:sr-only">Next</span>
              </Button>
            </nav>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center py-16">
            {allCards.length === 0 ? (
              <EmptyState
                title="No cards to study"
                action={
                  <Button variant="secondary" onClick={onGoToAllCards}>
                    Go to All Cards
                  </Button>
                }
              >
                You don’t have any cards yet. Add your first card in the All Cards tab.
              </EmptyState>
            ) : (
              <EmptyState title="You’re all caught up!">
                {hasCategoryFilter
                  ? "All cards in the selected categories are mastered. Turn off “Hide mastered” to see them again."
                  : "All your cards are mastered. Turn off “Hide mastered” to see them again."}
              </EmptyState>
            )}
          </div>
        )}
      </section>

      <StatsPanel stats={getStats(allCards)} />
    </div>
  );
}
