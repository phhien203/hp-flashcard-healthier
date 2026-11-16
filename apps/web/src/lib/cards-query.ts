import {
  applyProgress,
  type Card,
  type CardInput,
  type ProgressAction,
} from "@workspace/core"
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"
import {
  createCard,
  deleteCard,
  listCards,
  recordProgress,
  updateCard,
} from "../server/cards"

/** The signed-in user's whole deck. Decks are small, so it is loaded in one go. */
export const cardsQueryOptions = queryOptions({
  queryKey: ["cards"],
  queryFn: () => listCards(),
  staleTime: 30_000,
})

const DECK_KEY = cardsQueryOptions.queryKey

function useDeckCache() {
  const queryClient = useQueryClient()
  return {
    /** Apply `update` to the cached deck now and return a rollback function. */
    async optimistic(update: (cards: Card[]) => Card[]) {
      await queryClient.cancelQueries({ queryKey: DECK_KEY })
      const previous = queryClient.getQueryData(DECK_KEY)
      queryClient.setQueryData(DECK_KEY, (cards) =>
        cards ? update(cards) : cards
      )
      return () => queryClient.setQueryData(DECK_KEY, previous)
    },
    append(card: Card) {
      queryClient.setQueryData(DECK_KEY, (cards) =>
        cards ? [...cards, card] : [card]
      )
    },
    replace(card: Card) {
      queryClient.setQueryData(DECK_KEY, (cards) =>
        cards?.map((c) => (c.id === card.id ? card : c))
      )
    },
    invalidate: () => queryClient.invalidateQueries({ queryKey: DECK_KEY }),
  }
}

function toastFailure(what: string) {
  toast.error(`Couldn’t ${what}. Check your connection and try again.`)
}

/** "I Know This" / "Reset Progress": updates instantly, rolls back on failure. */
export function useRecordProgress() {
  const cache = useDeckCache()
  const record = useServerFn(recordProgress)
  return useMutation({
    mutationFn: (vars: { id: string; action: ProgressAction }) =>
      record({ data: vars }),
    onMutate: ({ id, action }) =>
      cache.optimistic((cards) =>
        cards.map((c) =>
          c.id === id
            ? { ...c, knownCount: applyProgress(c.knownCount, action) }
            : c
        )
      ),
    onError: (_error, _vars, rollback) => {
      rollback?.()
      toastFailure("save your progress")
    },
    onSuccess: (card) => cache.replace(card),
  })
}

export function useCreateCard() {
  const cache = useDeckCache()
  const create = useServerFn(createCard)
  return useMutation({
    mutationFn: (input: CardInput) => create({ data: input }),
    onSuccess: (card) => {
      cache.append(card)
      toast("Card created successfully.")
    },
    onError: () => toastFailure("create the card"),
  })
}

export function useUpdateCard() {
  const cache = useDeckCache()
  const update = useServerFn(updateCard)
  return useMutation({
    mutationFn: (vars: { id: string; input: CardInput }) =>
      update({ data: vars }),
    onSuccess: (card) => {
      cache.replace(card)
      toast("Card updated successfully.")
    },
    onError: () => toastFailure("update the card"),
  })
}

export function useDeleteCard() {
  const cache = useDeckCache()
  const remove = useServerFn(deleteCard)
  return useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onMutate: (id) =>
      cache.optimistic((cards) => cards.filter((c) => c.id !== id)),
    onError: (_error, _id, rollback) => {
      rollback?.()
      toastFailure("delete the card")
    },
    onSuccess: () => toast("Card deleted."),
    onSettled: () => cache.invalidate(),
  })
}
