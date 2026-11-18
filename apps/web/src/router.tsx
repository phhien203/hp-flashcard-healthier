import { QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"

import { DEFAULT_THEME } from "@workspace/ui/lib/theme"

import { DefaultCatchBoundary } from "@/features/app-shell/default-catch-boundary"
import { NotFound } from "@/features/app-shell/not-found"

import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false },
    },
  })

  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient,
      userId: null,
      theme: { preference: DEFAULT_THEME, resolved: "light" },
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: NotFound,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
