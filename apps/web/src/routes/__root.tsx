import React from "react"

import { ClerkProvider } from "@clerk/tanstack-react-start"
import { ui } from "@clerk/ui"
import { dark } from "@clerk/ui/themes"
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router"

import { Toaster } from "@workspace/ui/components/sonner"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import appCss from "@workspace/ui/globals.css?url"
import {
  documentThemeClass,
  publishedTheme,
  readThemeFromDocument,
  subscribePublishedTheme,
  themeColor,
  themeInitScript,
} from "@workspace/ui/lib/theme"
import type { ThemeChoice } from "@workspace/ui/lib/theme"
import { clerkAppearance } from "@workspace/ui/lib/tokens"

import { fetchSession } from "@/lib/auth.functions"
import { readTheme } from "@/lib/theme.functions"

import type { QueryClient } from "@tanstack/react-query"

export type RouterContext = {
  queryClient: QueryClient
  /** Clerk user id of the signed-in learner, or null when signed out. */
  userId: string | null
  theme: ThemeChoice
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const [{ userId }, theme] = await Promise.all([
      fetchSession(),
      typeof document === "undefined"
        ? readTheme()
        : Promise.resolve(readThemeFromDocument()),
    ])
    return { userId, theme }
  },
  head: () => ({
    meta: [
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

function RootDocument({ children }: { children: React.ReactNode }) {
  const serverTheme = Route.useRouteContext().theme
  // Null until the client publishes. Hydration therefore matches the server
  // snapshot, which omits `.dark` for System.
  const live = React.useSyncExternalStore(
    subscribePublishedTheme,
    publishedTheme,
    () => null
  )
  const theme = live ?? serverTheme
  const resolved = theme.resolved
  // System omits the inline color-scheme so the prefers-color-scheme rule
  // can paint a dark OS when this script never runs. An explicit choice wins.
  const colorScheme =
    theme.preference === "system" ? undefined : { colorScheme: resolved }
  const appearance = React.useMemo(
    () => ({
      ...clerkAppearance,
      ...(resolved === "dark" ? { theme: dark } : {}),
    }),
    [resolved]
  )

  return (
    <html
      lang="en"
      className={documentThemeClass(theme, live ? "client" : "server")}
      data-theme={theme.preference}
      style={colorScheme}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta
          name="theme-color"
          content={themeColor(resolved)}
          suppressHydrationWarning
        />
        {/*
          Inline on purpose: it has to run before first paint. A CSP that
          blocks inline scripts needs a nonce on this tag. The body is a
          build-time constant.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body className="min-h-svh">
        <ClerkProvider ui={ui} appearance={appearance}>
          <ThemeProvider preference={theme.preference} resolved={resolved}>
            {children}
            <Toaster theme={resolved} />
          </ThemeProvider>
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
