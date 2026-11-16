import { type Card, isMastered } from "../../lib/cards";
import { CategoryTag, MasteredBadge, ProgressIndicator } from "../ui/Badges";
import { pattern, sparkleBlue, sparklePink, sparkleYellow } from "../ui/icons";

type StudyCardProps = {
  card: Card;
  revealed: boolean;
  onToggle: () => void;
};

/** The big pink (question) / blue (answer) card. Clicking flips between the two faces. */
export function StudyCard({ card, revealed, onToggle }: StudyCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-live="polite"
      className={[
        "focus-ring relative isolate flex h-[360px] w-full flex-col items-center gap-4 overflow-hidden rounded-16 border-2 border-neutral-900 p-6 shadow-hard-2",
        "transition-[background-color,translate] duration-200 ease-out active:translate-y-px",
        revealed ? "bg-blue-400" : "bg-pink-400",
      ].join(" ")}
    >
      <img
        src={pattern}
        alt=""
        width={776.539}
        height={527.572}
        className="pointer-events-none absolute top-[-12px] left-1/2 -z-10 h-[527.033px] w-[776px] max-w-none -translate-x-1/2"
      />

      <CategoryTag>{card.category}</CategoryTag>

      {/* key forces a quick fade when the face changes */}
      <div
        key={revealed ? "answer" : "question"}
        className="flex min-h-0 w-full flex-1 animate-[face-in_200ms_var(--ease-out)] flex-col items-center justify-center gap-4 text-center"
      >
        {revealed ? (
          <>
            <p className="text-preset-4 opacity-80">Answer:</p>
            <p className="text-preset-2 line-clamp-5 break-words">{card.answer}</p>
          </>
        ) : (
          <>
            <p className="line-clamp-4 w-full text-[24px] leading-[1.2] font-bold break-words sm:text-[40px]">
              {card.question}
            </p>
            <p className="text-preset-4 opacity-80">Click to reveal answer</p>
          </>
        )}
      </div>

      {revealed ? (
        <img src={sparklePink} alt="" width={24.3} height={25.125} className="pointer-events-none absolute top-[38px] right-[38px] h-[25.125px] w-[24.3px]" />
      ) : (
        <img src={sparkleBlue} alt="" width={24.3} height={25.125} className="pointer-events-none absolute top-[38px] right-[28px] h-[25.125px] w-[24.3px]" />
      )}
      <img
        src={sparkleYellow}
        alt=""
        width={32.4}
        height={33.5}
        className="pointer-events-none absolute top-[268px] left-[31px] h-[33.5px] w-[32.4px] rotate-[-24.97deg]"
      />

      {isMastered(card) ? <MasteredBadge /> : <ProgressIndicator value={card.knownCount} />}
    </button>
  );
}
