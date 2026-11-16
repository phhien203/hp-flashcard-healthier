import type { Card, CardInput } from "@workspace/core"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CardForm } from "./card-form"

export function EditCardDialog({
  card,
  onOpenChange,
  onSubmit,
}: {
  card: Card | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CardInput) => Promise<unknown>
}) {
  return (
    <Dialog open={card !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit your card</DialogTitle>
          <DialogDescription className="sr-only">
            Change the question, answer or category. Your progress is kept.
          </DialogDescription>
        </DialogHeader>
        {card && (
          <CardForm
            key={card.id}
            defaultValues={{
              question: card.question,
              answer: card.answer,
              category: card.category,
            }}
            submitLabel="Update Card"
            onSubmit={onSubmit}
            actionsClassName="justify-end"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export function DeleteCardDialog({
  card,
  onOpenChange,
  onConfirm,
}: {
  card: Card | null
  onOpenChange: (open: boolean) => void
  onConfirm: (card: Card) => void
}) {
  return (
    <AlertDialog open={card !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this card?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" className="font-semibold">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="font-semibold"
            onClick={() => {
              if (card) onConfirm(card)
            }}
          >
            Delete Card
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
