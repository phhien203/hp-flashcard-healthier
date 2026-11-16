import { useCallback, useId, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { Checkbox } from "./ui/Checkbox";
import { angleDown, shuffle as shuffleIcon } from "./ui/icons";
import { useDismiss } from "./ui/useDismiss";

type FilterBarProps = {
  categories: { name: string; count: number }[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  hideMastered: boolean;
  onHideMasteredChange: (value: boolean) => void;
  onShuffle: () => void;
  /** Gap between dropdown and checkbox: 16px in Study Mode, 20px in All Cards. */
  wideGap?: boolean;
  className?: string;
};

function categoryLabel(selected: string[]) {
  if (selected.length === 0) return "All Categories";
  if (selected.length === 1) return selected[0];
  return `${selected.length} Categories`;
}

/** "All Categories ▾  ☐ Hide Mastered  …  ⤮ Shuffle" row shared by both views. */
export function FilterBar({
  categories,
  selected,
  onSelectedChange,
  hideMastered,
  onHideMasteredChange,
  onShuffle,
  wideGap = false,
  className = "",
}: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(wrapperRef, open, close);

  const toggle = (name: string, checked: boolean) =>
    onSelectedChange(checked ? [...selected, name] : selected.filter((c) => c !== name));

  return (
    <div className={`grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2.5 sm:flex sm:justify-between ${className}`}>
      <div className={`contents sm:flex sm:items-center ${wideGap ? "sm:gap-5" : "sm:gap-4"}`}>
        <div ref={wrapperRef} className="relative justify-self-start">
          <Button
            variant="outline"
            iconEnd={angleDown}
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="true"
            onClick={() => setOpen((o) => !o)}
            disabled={categories.length === 0}
          >
            <span className="max-w-[180px] truncate">{categoryLabel(selected)}</span>
          </Button>

          {open && (
            <div
              id={listId}
              role="group"
              aria-label="Filter by category"
              className="absolute top-[calc(100%+7px)] left-0 z-20 max-h-[min(408px,60vh)] w-[260px] origin-top-left animate-[popover-in_150ms_var(--ease-out)] overflow-y-auto rounded-8 border border-neutral-900 bg-neutral-0 shadow-pop"
            >
              {categories.map((cat, i) => (
                <div key={cat.name} className={i > 0 ? "border-t border-neutral-900" : ""}>
                  <Checkbox
                    checked={selected.includes(cat.name)}
                    onChange={(checked) => toggle(cat.name, checked)}
                    className="px-4 py-2 hover:bg-neutral-100"
                  >
                    <span className="text-preset-5">
                      {cat.name} <span className="text-neutral-600">({cat.count})</span>
                    </span>
                  </Checkbox>
                </div>
              ))}
            </div>
          )}
        </div>

        <Checkbox
          checked={hideMastered}
          onChange={onHideMasteredChange}
          className="col-start-1 row-start-2 justify-self-start"
        >
          <span className="text-preset-4">Hide Mastered</span>
        </Checkbox>
      </div>

      <Button variant="outline" icon={shuffleIcon} onClick={onShuffle} className="col-start-2 row-start-1">
        Shuffle
      </Button>
    </div>
  );
}
