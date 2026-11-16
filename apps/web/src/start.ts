import { clerkMiddleware } from "@clerk/tanstack-react-start/server"
import { createCsrfMiddleware, createStart } from "@tanstack/react-start"

/** Rejects cross-site calls to server functions (they are same-origin RPC endpoints). */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
})

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, clerkMiddleware()],
}))
