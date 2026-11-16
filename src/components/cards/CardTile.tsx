import { useCallback, useId, useRef, useState } from "react";
import { type Card, isMastered } from "../../lib/cards";
import { CategoryTag, MasteredBadge, ProgressIndicator } from "../ui/Badges";
import { dots, edit, trash } from "../ui/icons";
import { useDismiss } from "../ui/useDismiss";

type CardTileProps = {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
};

/** Grid card in "All Cards": question, answer, then category / progress / ⋮ menu footer. */
export function CardTile({ card, onEdit, onDelete }: CardTileProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setMenuOpen(false), []);
  useDismiss(menuRef, menuOpen, close);

  const choose = (action: (card: Card) => void) => {
    setMenuOpen(false);
    action(card);
  };

  return (
    <article className="flex min-h-[238px] flex-col rounded-16 border border-r-3 border-b-3 border-neutral-900 bg-neutral-0">
      <h3 className="text-preset-3 border-b border-neutral-900 p-4 break-words">{card.question}</h3>

      <div className="text-preset-5 flex flex-1 flex-col gap-1.5 border-b border-neutral-900 p-4">
        <p className="opacity-60">Answer:</p>
        <p className="break-words">{card.answer}</p>
      </div>

      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-full min-w-0 shrink items-center border-r border-neutral-900 pr-2.5">
          <CategoryTag>{card.category}</CategoryTag>
        </div>
        <div className="flex h-full min-w-0 flex-1 items-center border-r border-neutral-900 pr-2.5">
          {isMastered(card) ? <MasteredBadge /> : <ProgressIndicator value={card.knownCount} dimLabel />}
        </div>

        <div ref={menuRef} className="relative flex h-full items-center justify-end">
          <button
            type="button"
            aria-label={`Actions for “${card.question}”`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            onClick={() => setMenuOpen((o) => !o)}
            className={[
              "focus-ring flex size-6 items-center justify-center rounded-xs border transition-[background-color,border-color,box-shadow] duration-150",
              menuOpen
                ? "border-neutral-900 bg-neutral-0 shadow-hard-2"
                : "border-transparent hover:border-neutral-900 hover:shadow-hard-2",
            ].join(" ")}
          >
            <img src={dots} alt="" width={3.375} height={14.0625} className="h-[14.063px] w-[3.375px]" />
          </button>

          {menuOpen && (
            <div
              id={menuId}
              role="menu"
              className="absolute top-[calc(100%-8px)] right-0 z-20 w-[140px] origin-top-right animate-[popover-in_150ms_var(--ease-out)] overflow-hidden rounded-8 border border-neutral-900 bg-neutral-0 shadow-pop"
            >
              <MenuItem icon={edit} onClick={() => choose(onEdit)}>
                Edit
              </MenuItem>
              <div className="h-px bg-neutral-900" />
              <MenuItem icon={trash} onClick={() => choose(onDelete)}>
                Delete
              </MenuItem>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function MenuItem({ icon, onClick, children }: { icon: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="text-preset-5 flex w-full items-center gap-2 bg-neutral-0 px-4 py-2 text-left outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100"
    >
      <img src={icon} alt="" width={16} height={16} className="size-4" />
      {children}
    </button>
  );
}
