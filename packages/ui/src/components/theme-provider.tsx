import React from "react"

import {
  broadcastThemeChoice,
  publishTheme,
  type ResolvedTheme,
  subscribeSystemScheme,
  subscribeThemeBroadcast,
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
 * the server (the preference cookie, or the last resolved color) so the
 * first render matches SSR. A layout effect then follows the live OS scheme
 * when the choice is System and drops that listener when it is not. A choice
 * made here is announced to other tabs; a choice that arrives from another
 * tab is applied and not announced again.
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
  const [preference, setPreferenceState] = React.useState(initialPreference)
  const [resolved, setResolved] = React.useState(initialResolved)
  const announce = React.useRef(false)

  const setPreference = React.useCallback((next: ThemePreference) => {
    announce.current = true
    setPreferenceState(next)
  }, [])

  React.useLayoutEffect(() => {
    setPreferenceState(initialPreference)
  }, [initialPreference])

  React.useLayoutEffect(() => {
    return subscribeSystemScheme(preference, systemQuery(), (next) => {
      const choice = { preference, resolved: next }
      publishTheme(choice)
      writeThemeCookies(preference, next)
      setResolved((current) => (current === next ? current : next))
      if (announce.current) {
        announce.current = false
        broadcastThemeChoice(choice)
      }
    })
  }, [preference])

  React.useLayoutEffect(() => {
    return subscribeThemeBroadcast((choice) => {
      announce.current = false
      setPreferenceState(choice.preference)
      publishTheme(choice)
      writeThemeCookies(choice.preference, choice.resolved)
      setResolved((current) =>
        current === choice.resolved ? current : choice.resolved
      )
    })
  }, [])

  const value = React.useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference]
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
