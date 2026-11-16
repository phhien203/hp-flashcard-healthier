import type { Card } from "@workspace/core"
import { Badge } from "@workspace/ui/components/badge"
import { Icon } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { CardProgress } from "@/features/deck/card-progress"

export type StudyCardProps = {
  card: Card
  revealed: boolean
  onToggle: () => void
}

/**
 * The big flashcard from the Figma "Flashcard Content" component: pink while
 * showing the question, blue once the answer is revealed. The whole card is
 * one button so it works with a click, a tap, Enter or Space. Its accessible
 * name is its visible text (question or answer); `aria-pressed` tells whether
 * the answer side is showing.
 */
export function StudyCard({ card, revealed, onToggle }: StudyCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={revealed}
      className={cn(
        "relative flex h-[300px] w-full cursor-pointer flex-col items-center gap-4 overflow-hidden rounded-xl border-2 border-border p-6 text-foreground shadow-hard-2 focus-ring transition-[background-color,translate,box-shadow] duration-200 ease-out-strong select-none active:translate-x-px active:translate-y-px active:shadow-hard-1 sm:h-[360px]",
        revealed ? "bg-blue-400" : "bg-pink-400"
      )}
    >
      <Icon
        name="pattern"
        className="absolute -top-3 left-1/2 max-w-none -translate-x-1/2 opacity-100"
      />
      <Badge className="relative">{card.category}</Badge>

      <div
        key={revealed ? "answer" : "question"}
        className="relative flex min-h-0 w-full flex-1 animate-in flex-col items-center justify-center gap-4 text-center duration-200 fade-in-0 zoom-in-[0.98]"
      >
        {revealed ? (
          <>
            <p className="text-preset-4 opacity-80">Answer:</p>
            <p className="line-clamp-5 text-preset-3 break-words sm:text-preset-2">
              {card.answer}
            </p>
          </>
        ) : (
          <>
            <p className="line-clamp-4 text-preset-2 font-bold break-words sm:text-preset-1">
              {card.question}
            </p>
            <p className="text-preset-4 opacity-80">Click to reveal answer</p>
          </>
        )}
      </div>

      <Icon
        name={revealed ? "sparkle-pink" : "sparkle-blue"}
        className="absolute top-[38px] right-7"
      />
      <Icon
        name="sparkle-yellow"
        className="absolute top-[263px] left-[30px] -rotate-25 max-sm:top-[210px]"
      />

      <CardProgress knownCount={card.knownCount} className="relative" />
    </button>
  )
}
