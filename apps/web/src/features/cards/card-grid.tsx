import type { Card } from "@workspace/core"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { useState } from "react"
import { CardTile, type CardTileProps } from "./card-tile"

export const PAGE_SIZE = 12

export type CardGridProps = Pick<CardTileProps, "onEdit" | "onDelete"> & {
  cards: ReadonlyArray<Card>
  emptyReason: "no-cards" | "no-matches"
}

/** All Cards grid: 1/2/3 columns, 12 cards at a time with "Load More". */
export function CardGrid({
  cards,
  emptyReason,
  onEdit,
  onDelete,
}: CardGridProps) {
  const [limit, setLimit] = useState(PAGE_SIZE)

  if (cards.length === 0) {
    return (
      <Empty className="min-h-62">
        <EmptyHeader>
          <EmptyTitle>
            {emptyReason === "no-cards"
              ? "No cards yet"
              : "No cards match these filters"}
          </EmptyTitle>
          <EmptyDescription className="text-foreground">
            {emptyReason === "no-cards"
              ? "Add your first card using the form above and it will show up here."
              : "Try other categories or turn off “Hide Mastered”."}
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
