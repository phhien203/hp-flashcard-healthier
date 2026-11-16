import {
  Outlet,
  createFileRoute,
  redirect,
  retainSearchParams,
} from "@tanstack/react-router"
import { AppHeader } from "../features/app-shell/app-header"
import { Page } from "../features/app-shell/page"
import { cardsQueryOptions } from "../lib/cards-query"
import { deckSearchSchema } from "../lib/deck-search"

/** Signed-in area: Study Mode and All Cards share the header and deck filters. */
export const Route = createFileRoute("/_app")({
  validateSearch: deckSearchSchema,
  search: { middlewares: [retainSearchParams(true)] },
  beforeLoad: ({ context, location }) => {
    if (!context.userId) {
      throw redirect({
        to: "/sign-in/$",
        search: { redirect_url: location.href },
      })
    }
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(cardsQueryOptions),
  component: AppLayout,
})

function AppLayout() {
  return (
    <Page>
      <AppHeader />
      <main className="flex flex-col gap-8">
        <Outlet />
      </main>
    </Page>
  )
}
