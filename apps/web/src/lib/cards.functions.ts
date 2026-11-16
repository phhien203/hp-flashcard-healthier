import { notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { cardInputSchema } from "@workspace/core"

import { requireUser } from "./auth.functions"
import {
  deleteCardSchema,
  recordProgressSchema,
  updateCardSchema,
} from "./cards.schema"
import { cardRepository } from "./cards.server"

/*
 * Card RPCs. Safe to import anywhere: the client bundle gets RPC stubs.
 * Every function runs behind `requireUser`, so the user id always comes from
 * the Clerk session and a call can only touch the caller's own deck.
 */

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
  .validator(updateCardSchema)
  .handler(async ({ context, data }) => {
    const card = await cardRepository().updateCard(
      context.userId,
      data.id,
      data.input
    )
    if (!card) throw notFound()
    return card
  })

export const recordProgress = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(recordProgressSchema)
  .handler(async ({ context, data }) => {
    const card = await cardRepository().recordProgress(
      context.userId,
      data.id,
      data.action
    )
    if (!card) throw notFound()
    return card
  })

export const deleteCard = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(deleteCardSchema)
  .handler(async ({ context, data }) => {
    const deleted = await cardRepository().deleteCard(context.userId, data.id)
    if (!deleted) throw notFound()
    return { id: data.id }
  })
