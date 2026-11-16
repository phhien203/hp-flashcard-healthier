import type { Card } from "@workspace/core"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Icon } from "@workspace/ui/icons"
import { CardProgress } from "@/features/deck/card-progress"

export type CardTileProps = {
  card: Card
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
}

/** One card in the All Cards grid (Figma "Flashcard"). */
export function CardTile({ card, onEdit, onDelete }: CardTileProps) {
  return (
    <article
      aria-label={card.question}
      className="flex min-h-[258px] flex-col overflow-hidden rounded-xl panel-edge-3 bg-card"
    >
      <h3 className="border-b border-border p-4 text-preset-3 break-words">
        {card.question}
      </h3>
      <div className="flex flex-1 flex-col gap-1.5 border-b border-border p-4 text-preset-5">
        <p className="opacity-60">Answer:</p>
        <p className="break-words whitespace-pre-line">{card.answer}</p>
      </div>
      <footer className="flex h-14 items-center">
        <div className="flex h-full min-w-0 items-center border-r border-border px-4 pr-2.5">
          <Badge className="max-w-40 truncate">{card.category}</Badge>
        </div>
        <div className="flex h-full flex-1 items-center border-r border-border px-2.5">
          <CardProgress knownCount={card.knownCount} />
        </div>
        <div className="flex h-full items-center justify-center px-2.5">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for “${card.question}”`}
              >
                <Icon name="dots" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-35">
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => onEdit(card)}>
                  <Icon name="edit" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDelete(card)}>
                  <Icon name="trash" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </footer>
    </article>
  )
}
