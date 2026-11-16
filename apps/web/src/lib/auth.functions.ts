import { auth } from "@clerk/tanstack-react-start/server"
import { redirect } from "@tanstack/react-router"
import { createMiddleware, createServerFn } from "@tanstack/react-start"

/**
 * Who is signed in, read from the Clerk session on the server. Returns a null
 * id rather than throwing: the root route uses it on public pages too.
 */
export const fetchSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { userId } = await auth()
    return { userId }
  }
)

/**
 * Server-function middleware that hands the Clerk user id to the handler.
 * A call without a session (e.g. it expired mid-use) is redirected to sign in;
 * `useServerFn` performs that navigation on the client.
 */
export const requireUser = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { userId } = await auth()
    if (!userId) throw redirect({ to: "/sign-in/$" })
    return next({ context: { userId } })
  }
)
