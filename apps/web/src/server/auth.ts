import { auth } from "@clerk/tanstack-react-start/server"
import { createMiddleware, createServerFn } from "@tanstack/react-start"

/** Who is signing in, read from the Clerk session on the server. */
export const fetchSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { userId } = await auth()
    return { userId }
  }
)

/**
 * Server-function middleware that rejects anonymous calls and hands the
 * Clerk user id to the handler. Every card operation goes through it, so a
 * request can only ever touch the caller's own deck.
 */
export const requireUser = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { userId } = await auth()
    if (!userId) {
      throw new Response("Unauthorized", { status: 401 })
    }
    return next({ context: { userId } })
  }
)
