import { MASTERY_THRESHOLD } from "../../lib/cards";
import { brainSolid } from "./icons";

/** White pill showing a card's category. */
export function CategoryTag({ children }: { children: string }) {
  return (
    <span className="text-preset-6 inline-flex max-w-full items-center justify-center rounded-full border border-neutral-900 bg-neutral-0 px-[11px] py-[5px] shadow-hard-1">
      <span className="truncate">{children}</span>
    </span>
  );
}

/** 60px pill progress bar + "n/5" label. */
export function ProgressIndicator({ value, dimLabel = false }: { value: number; dimLabel?: boolean }) {
  const pct = (value / MASTERY_THRESHOLD) * 100;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        role="progressbar"
        aria-label="Mastery progress"
        aria-valuemin={0}
        aria-valuemax={MASTERY_THRESHOLD}
        aria-valuenow={value}
        className="flex h-2.5 w-[60px] shrink-0 overflow-hidden rounded-full border border-neutral-900 bg-neutral-0"
      >
        <span
          className="h-2 rounded-[30px] bg-neutral-900 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className={`text-preset-6 whitespace-nowrap ${dimLabel ? "opacity-80" : ""}`}>
        {value}/{MASTERY_THRESHOLD}
      </span>
    </span>
  );
}

/** Teal "Mastered 5/5" pill. */
export function MasteredBadge() {
  return (
    <span className="text-preset-6 inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-900 bg-teal-400 px-[11px] py-[5px] whitespace-nowrap shadow-hard-1">
      <img src={brainSolid} alt="" width={16} height={16} className="size-4" />
      <span>Mastered</span>
      <span>
        {MASTERY_THRESHOLD}/{MASTERY_THRESHOLD}
      </span>
    </span>
  );
}
