import type { Card, EmptyReason } from "@workspace/core"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import React from "react"
import { CardTile, type CardTileProps } from "./card-tile"

export const PAGE_SIZE = 12

const EMPTY_COPY = {
  "no-cards": {
    title: "No cards yet",
    description:
      "Add your first card using the form above and it will show up here.",
  },
  "all-mastered": {
    title: "Every card here is mastered",
    description: "Turn off “Hide Mastered” to see them again.",
  },
  "no-matches": {
    title: "No cards match these filters",
    description: "Pick other categories to see more cards.",
  },
} as const

export type CardGridProps = Pick<CardTileProps, "onEdit" | "onDelete"> & {
  cards: ReadonlyArray<Card>
  emptyReason: EmptyReason
}

/** All Cards grid: 1/2/3 columns, 12 cards at a time with "Load More". */
export function CardGrid({
  cards,
  emptyReason,
  onEdit,
  onDelete,
}: CardGridProps) {
  const [limit, setLimit] = React.useState(PAGE_SIZE)

  if (cards.length === 0) {
    return (
      <Empty className="min-h-62">
        <EmptyHeader>
          <EmptyTitle>{EMPTY_COPY[emptyReason].title}</EmptyTitle>
          {/* The design sets this hint in neutral/900 rather than the muted tone. */}
          <EmptyDescription className="text-foreground">
            {EMPTY_COPY[emptyReason].description}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const shown = cards.slice(0, limit)
  return (
    <div className="flex flex-col items-center gap-8">
      <ul className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {shown.map((card) => (
          <li key={card.id} className="grid">
            <CardTile card={card} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
      {cards.length > limit && (
        <Button variant="raised" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
          Load More
        </Button>
      )}
    </div>
  )
}
