import React from "react"

import {
  type Card,
  type EmptyReason,
  isMastered,
  type ProgressAction,
} from "@workspace/core"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { Separator } from "@workspace/ui/components/separator"
import { Icon } from "@workspace/ui/icons"

import { StudyCard } from "./study-card"

export type StudySessionProps = {
  /** Cards to study, already filtered and ordered. */
  cards: ReadonlyArray<Card>
  /** Why `cards` is empty, which decides the empty-state copy. */
  emptyReason: EmptyReason
  onProgress: (id: string, action: ProgressAction) => void
  /** Call to action for the "No cards" state, e.g. a link to All Cards. */
  emptyAction?: React.ReactNode
}

// Content-swap enter animations, reused from the design-system motion tokens.
// Reveal/hide the answer fades the new side in over 150ms (the pink<->blue
// background keeps its own transition); navigation is a briefer 125ms content
// fade. Both keep the card frame stationary and are suppressed for keyboard
// input and (via globals.css) reduced motion.
const SWAP_FADE = "animate-in fade-in-0 ease-out-strong"
const REVEAL_ANIMATION = `${SWAP_FADE} duration-150`
const NAV_ANIMATION = `${SWAP_FADE} duration-[125ms]`

/**
 * Study Mode's main panel: the current card, "I Know This" / "Reset
 * Progress", and Previous / Next (also ← / → on the keyboard).
 */
export function StudySession({
  cards,
  emptyReason,
  onProgress,
  emptyAction,
}: StudySessionProps) {
  const [position, setPosition] = React.useState(0)
  // Remember which card is flipped rather than a boolean, so a card that slides
  // into the slot (the previous one was mastered or deleted) starts on its question.
  const [revealedId, setRevealedId] = React.useState<string | null>(null)
  // Enter-animation classes for the current content swap, or undefined to change
  // instantly. Pointer interactions animate; keyboard ones stay at 0ms.
  const [swapAnimation, setSwapAnimation] = React.useState<string | undefined>(
    undefined
  )

  // If the current card leaves the list (mastered while "Hide Mastered" is on,
  // or deleted), the next card slides into its slot; clamp at the end.
  const index = Math.min(position, Math.max(cards.length - 1, 0))
  const card = cards[index]

  const go = (delta: number, pointer: boolean) => {
    if (cards.length === 0) return
    setSwapAnimation(pointer ? NAV_ANIMATION : undefined)
    setPosition((index + delta + cards.length) % cards.length)
    setRevealedId(null)
  }

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return
      const target = event.target as HTMLElement | null
      if (
        target?.closest(
          "input, textarea, select, [contenteditable], [role=menu]"
        )
      )
        return
      if (event.key === "ArrowLeft") go(-1, false)
      else if (event.key === "ArrowRight") go(1, false)
      else return
      event.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  if (!card) {
    return <StudyEmpty reason={emptyReason} action={emptyAction} />
  }

  const mastered = isMastered(card)
  const revealed = revealedId === card.id

  return (
    <>
      <div className="flex flex-col items-center gap-5 p-4 sm:p-5">
        <StudyCard
          card={card}
          revealed={revealed}
          swapAnimationClass={swapAnimation}
          onToggle={(pointer) => {
            setSwapAnimation(pointer ? REVEAL_ANIMATION : undefined)
            setRevealedId(revealed ? null : card.id)
          }}
        />
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-5">
          <Button
            size="lg"
            disabled={mastered}
            onClick={() => onProgress(card.id, "know")}
          >
            <Icon name="check-circle" />
            {mastered ? "Already Mastered" : "I Know This"}
          </Button>
          <Button
            variant="raised"
            size="lg"
            onClick={() => onProgress(card.id, "reset")}
          >
            <Icon name="undo" />
            Reset Progress
          </Button>
        </div>
      </div>
      <Separator />
      <nav
        aria-label="Cards"
        className="flex items-center justify-between gap-4 p-4 sm:p-5"
      >
        <Button
          variant="outline"
          onClick={(event) => go(-1, event.detail > 0)}
          className="max-sm:size-10 max-sm:p-0"
        >
          <Icon name="angle-left" />
          <span className="max-sm:sr-only">Previous</span>
        </Button>
        <p className="text-preset-5 text-muted-foreground" aria-live="polite">
          Card {index + 1} of {cards.length}
        </p>
        <Button
          variant="outline"
          onClick={(event) => go(1, event.detail > 0)}
          className="max-sm:size-10 max-sm:p-0"
        >
          <span className="max-sm:sr-only">Next</span>
          <Icon name="angle-right" />
        </Button>
      </nav>
    </>
  )
}

const EMPTY_COPY = {
  "no-cards": {
    title: "No cards to study",
    description:
      "You don’t have any cards yet. Add your first card in the All Cards tab.",
  },
  "all-mastered": {
    title: "You’re all caught up!",
    description:
      "All your cards are mastered. Turn off “Hide mastered” to see them again.",
  },
  "no-matches": {
    title: "No cards match these filters",
    description: "Pick other categories to keep studying.",
  },
} as const

function StudyEmpty({
  reason,
  action,
}: {
  reason: EmptyReason
  action?: React.ReactNode
}) {
  const copy = EMPTY_COPY[reason]
  return (
    <Empty className="min-h-[420px] sm:min-h-[550px]">
      <EmptyHeader>
        <EmptyTitle>{copy.title}</EmptyTitle>
        <EmptyDescription>{copy.description}</EmptyDescription>
      </EmptyHeader>
      {reason === "no-cards" && action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}
