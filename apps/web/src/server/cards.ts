import { cardInputSchema } from "@workspace/core"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { requireUser } from "./auth"
import { cardRepository } from "./db"

const cardId = z.string().min(1).max(64)

function notFound(): never {
  throw new Response("Card not found", { status: 404 })
}

export const listCards = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(({ context }) => cardRepository().listCards(context.userId))

export const createCard = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(cardInputSchema)
  .handler(({ context, data }) =>
    cardRepository().createCard(context.userId, data)
  )

export const updateCard = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: cardId, input: cardInputSchema }))
  .handler(async ({ context, data }) => {
    return (
      (await cardRepository().updateCard(
        context.userId,
        data.id,
        data.input
      )) ?? notFound()
    )
  })

export const recordProgress = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: cardId, action: z.enum(["know", "reset"]) }))
  .handler(async ({ context, data }) => {
    return (
      (await cardRepository().recordProgress(
        context.userId,
        data.id,
        data.action
      )) ?? notFound()
    )
  })

export const deleteCard = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: cardId }))
  .handler(async ({ context, data }) => {
    if (!(await cardRepository().deleteCard(context.userId, data.id)))
      notFound()
    return { id: data.id }
  })
