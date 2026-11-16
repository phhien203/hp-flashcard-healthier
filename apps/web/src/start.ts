import { clerkMiddleware } from "@clerk/tanstack-react-start/server"
import { isNotFound, isRedirect } from "@tanstack/react-router"
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start"

/** Rejects cross-site calls to server functions (they are same-origin RPC endpoints). */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
})

/**
 * Logs unexpected server function failures in full and, in production, sends
 * the client a generic error instead of database or validation internals.
 * `redirect()` and `notFound()` are control flow and pass through untouched.
 */
const serverFnErrorMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    try {
      return await next()
    } catch (error) {
      if (isRedirect(error) || isNotFound(error)) throw error
      console.error("Server function failed:", error)
      if (import.meta.env.DEV) throw error
      throw new Error("Something went wrong. Please try again.")
    }
  }
)

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, clerkMiddleware()],
  functionMiddleware: [serverFnErrorMiddleware],
}))
