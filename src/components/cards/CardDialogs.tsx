import type { Card, CardInput } from "../../lib/cards";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { close as closeIcon } from "../ui/icons";
import { CardForm } from "./CardForm";

export function EditCardDialog({
  card,
  onClose,
  onSave,
}: {
  card: Card | null;
  onClose: () => void;
  onSave: (id: string, input: CardInput) => void;
}) {
  return (
    <Dialog open={card !== null} onClose={onClose} labelledBy="edit-card-title">
      {card && (
        <div className="flex flex-col gap-6 px-5 py-6">
          <h2 id="edit-card-title" className="text-preset-2 pr-6">
            Edit your card
          </h2>
          <CardForm
            key={card.id}
            initial={{ question: card.question, answer: card.answer, category: card.category }}
            autoFocus
            onSubmit={(input) => onSave(card.id, input)}
            className="flex flex-col gap-6"
            footer={
              <div className="flex justify-end">
                <Button type="submit" variant="primary" weight="semibold">
                  Update Card
                </Button>
              </div>
            }
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring absolute top-[15px] right-3 flex size-4 items-center justify-center rounded-xs"
          >
            <img src={closeIcon} alt="" width={16} height={16} className="size-4" />
          </button>
        </div>
      )}
    </Dialog>
  );
}

export function DeleteCardDialog({
  card,
  onClose,
  onConfirm,
}: {
  card: Card | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  return (
    <Dialog open={card !== null} onClose={onClose} labelledBy="delete-card-title">
      {card && (
        <>
          <div className="flex flex-col gap-2 px-5 py-6">
            <h2 id="delete-card-title" className="text-preset-2">
              Delete this card?
            </h2>
            <p className="text-preset-4-regular">This action can’t be undone.</p>
          </div>
          <div className="h-px bg-neutral-900" />
          <div className="flex items-center justify-end gap-2.5 px-5 pt-3 pb-4">
            <Button variant="outline" weight="semibold" onClick={onClose} autoFocus>
              Cancel
            </Button>
            <Button variant="primary" weight="semibold" onClick={() => onConfirm(card.id)}>
              Delete Card
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
