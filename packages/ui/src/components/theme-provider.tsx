import React from "react"

import {
  publishTheme,
  type ResolvedTheme,
  subscribeSystemScheme,
  type ThemePreference,
  writeThemeCookies,
} from "@workspace/ui/lib/theme"

export type ThemeController = {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = React.createContext<ThemeController | null>(null)

function systemQuery(): MediaQueryList {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)")
  } catch {
    return {
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false
      },
    }
  }
}

/**
 * Owns the saved Light / Dark / System choice. The initial values come from
 * the server (cookie + client hint) so the first render matches SSR. A
 * layout effect then follows the live OS scheme when the choice is System
 * and drops that listener when it is not.
 */
export function ThemeProvider({
  preference: initialPreference,
  resolved: initialResolved,
  children,
}: {
  preference: ThemePreference
  resolved: ResolvedTheme
  children: React.ReactNode
}) {
  const [preference, setPreference] = React.useState(initialPreference)
  const [resolved, setResolved] = React.useState(initialResolved)

  React.useLayoutEffect(() => {
    setPreference(initialPreference)
  }, [initialPreference])

  React.useLayoutEffect(() => {
    return subscribeSystemScheme(preference, systemQuery(), (next) => {
      publishTheme({ preference, resolved: next })
      writeThemeCookies(preference, next)
      setResolved((current) => (current === next ? current : next))
    })
  }, [preference])

  const value = React.useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeController {
  const value = React.useContext(ThemeContext)
  if (!value) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return value
}
