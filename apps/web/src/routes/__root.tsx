import { ClerkProvider } from "@clerk/tanstack-react-start"
import type { QueryClient } from "@tanstack/react-query"
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { Toaster } from "@workspace/ui/components/sonner"
import appCss from "@workspace/ui/globals.css?url"
import { fetchSession } from "../server/auth"

export type RouterContext = {
  queryClient: QueryClient
  /** Clerk user id of the signed-in learner, or null when signed out. */
  userId: string | null
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const { userId } = await fetchSession()
    return { userId }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#f7f3f0" },
      {
        name: "description",
        content: "Study with flashcards and track what you’ve mastered.",
      },
      { title: "Flashcard" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootDocument,
})

const clerkAppearance = {
  variables: {
    colorPrimary: "#f8cb46",
    colorPrimaryForeground: "#2e1401",
    colorForeground: "#2e1401",
    colorMutedForeground: "#6d5b4d",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorBorder: "#2e1401",
    colorDanger: "#e11966",
    colorRing: "#5072c7",
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "12px",
  },
} as const

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body className="min-h-svh">
          {children}
          <Toaster />
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  )
}
