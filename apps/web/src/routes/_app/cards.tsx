import type { Card } from "@workspace/core"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { CardForm } from "../../features/cards/card-form"
import { CardGrid } from "../../features/cards/card-grid"
import {
  DeleteCardDialog,
  EditCardDialog,
} from "../../features/cards/card-dialogs"
import { DeckControls } from "../../features/deck/deck-controls"
import { useDeck } from "../../features/deck/use-deck"
import {
  useCreateCard,
  useDeleteCard,
  useUpdateCard,
} from "../../lib/cards-query"

export const Route = createFileRoute("/_app/cards")({
  head: () => ({ meta: [{ title: "All Cards · Flashcard" }] }),
  component: AllCards,
})

function AllCards() {
  const { cards, visible, emptyReason, controls, search } = useDeck()
  const create = useCreateCard()
  const update = useUpdateCard()
  const remove = useDeleteCard()
  const [editing, setEditing] = useState<Card | null>(null)
  const [deleting, setDeleting] = useState<Card | null>(null)

  return (
    <>
      <h1 className="sr-only">All Cards</h1>
      <section
        aria-label="Create a new card"
        className="rounded-xl panel-edge-4 bg-card p-5 sm:p-8"
      >
        <CardForm
          submitLabel="Create Card"
          submitIcon="circle-plus"
          resetOnSuccess
          onSubmit={(input) => create.mutateAsync(input)}
        />
      </section>

      <section aria-label="Your cards" className="flex flex-col gap-6 pt-4">
        {cards.length > 0 && <DeckControls {...controls} />}
        <CardGrid
          key={JSON.stringify(search)}
          cards={visible}
          emptyReason={emptyReason ?? "no-cards"}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </section>

      <EditCardDialog
        card={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSubmit={async (input) => {
          await update.mutateAsync({ id: editing!.id, input })
          setEditing(null)
        }}
      />
      <DeleteCardDialog
        card={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={(card) => {
          remove.mutate(card.id)
          setDeleting(null)
        }}
      />
    </>
  )
}
