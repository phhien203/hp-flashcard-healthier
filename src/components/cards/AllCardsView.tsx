import { type ReactNode, useState } from "react";
import type { Card, CardInput } from "../../lib/cards";
import { EmptyState } from "../EmptyState";
import { Button } from "../ui/Button";
import { circlePlus } from "../ui/icons";
import { DeleteCardDialog, EditCardDialog } from "./CardDialogs";
import { CardForm } from "./CardForm";
import { CardTile } from "./CardTile";

export const PAGE_SIZE = 12;

type AllCardsViewProps = {
  allCards: Card[];
  /** Cards after filters + shuffle order. */
  cards: Card[];
  filterBar: ReactNode;
  onCreate: (input: CardInput) => void;
  onUpdate: (id: string, input: CardInput) => void;
  onDelete: (id: string) => void;
};

export function AllCardsView({ allCards, cards, filterBar, onCreate, onUpdate, onDelete }: AllCardsViewProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [editing, setEditing] = useState<Card | null>(null);
  const [deleting, setDeleting] = useState<Card | null>(null);

  const visible = cards.slice(0, visibleCount);

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      <section
        aria-label="Create a new card"
        className="rounded-16 border border-r-4 border-b-4 border-neutral-900 bg-neutral-0 p-5 sm:p-6 lg:p-8"
      >
        <CardForm
          placeholders
          onSubmit={(input) => {
            onCreate(input);
            return true;
          }}
          className="flex flex-col gap-6"
          footer={
            <div>
              <Button type="submit" variant="primary" weight="semibold" icon={circlePlus}>
                Create Card
              </Button>
            </div>
          }
        />
      </section>

      {allCards.length === 0 ? (
        <div className="py-[110px]">
          <EmptyState title="No cards yet">Add your first card using the form above and it will show up here.</EmptyState>
        </div>
      ) : (
        <>
          <div className="pt-0 sm:pt-4">{filterBar}</div>

          {cards.length === 0 ? (
            <div className="py-16">
              <EmptyState title="No cards match your filters">
                Try selecting different categories or turn off “Hide Mastered”.
              </EmptyState>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" aria-label="Flashcards">
              {visible.map((card) => (
                <li key={card.id} className="flex flex-col *:flex-1">
                  <CardTile card={card} onEdit={setEditing} onDelete={setDeleting} />
                </li>
              ))}
            </ul>
          )}

          {visibleCount < cards.length && (
            <div className="flex justify-center pt-4">
              <Button variant="secondary" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      <EditCardDialog
        card={editing}
        onClose={() => setEditing(null)}
        onSave={(id, input) => {
          onUpdate(id, input);
          setEditing(null);
        }}
      />
      <DeleteCardDialog
        card={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={(id) => {
          onDelete(id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
