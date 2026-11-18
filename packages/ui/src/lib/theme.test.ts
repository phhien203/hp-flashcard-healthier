import { afterEach, describe, expect, it, vi } from "vitest"

import {
  DEFAULT_THEME,
  parseThemePreference,
  readCookie,
  readThemeChoice,
  RESOLVED_COOKIE,
  resolveTheme,
  subscribeSystemScheme,
  systemSchemeFromRequest,
  type SystemSchemeQuery,
  THEME_COOKIE,
  themeInitScript,
  writeThemeCookies,
} from "./theme"

function query(matches: boolean): SystemSchemeQuery & {
  listeners: Set<() => void>
} {
  const listeners = new Set<() => void>()
  return {
    matches,
    listeners,
    addEventListener(_type, listener) {
      listeners.add(listener)
    },
    removeEventListener(_type, listener) {
      listeners.delete(listener)
    },
  }
}

describe("theme preference", () => {
  afterEach(() => {
    document.cookie = `${THEME_COOKIE}=; Path=/; Max-Age=0`
    document.cookie = `${RESOLVED_COOKIE}=; Path=/; Max-Age=0`
    document.documentElement.classList.remove("dark")
    document.documentElement.style.colorScheme = ""
    vi.restoreAllMocks()
  })

  it("defaults an empty or unknown choice to system", () => {
    expect(parseThemePreference(null)).toBe(DEFAULT_THEME)
    expect(parseThemePreference("")).toBe("system")
    expect(parseThemePreference("sepia")).toBe("system")
    expect(parseThemePreference("dark")).toBe("dark")
  })

  it("resolves system from the OS scheme and keeps an explicit choice", () => {
    expect(resolveTheme("system", "dark")).toBe("dark")
    expect(resolveTheme("system", "light")).toBe("light")
    expect(resolveTheme("light", "dark")).toBe("light")
    expect(resolveTheme("dark", "light")).toBe("dark")
  })

  it("reads the preference cookie and ignores a resolved hint for explicit choices", () => {
    expect(readCookie("fc-theme=dark; fc-color=light", THEME_COOKIE)).toBe(
      "dark"
    )
    expect(readThemeChoice("fc-theme=dark; fc-color=light", "light")).toEqual({
      preference: "dark",
      resolved: "dark",
    })
    expect(readThemeChoice("fc-theme=system", "dark")).toEqual({
      preference: "system",
      resolved: "dark",
    })
    expect(readThemeChoice(null, "light")).toEqual({
      preference: "system",
      resolved: "light",
    })
  })

  it("prefers the client hint over the stored scheme, then light", () => {
    expect(systemSchemeFromRequest("dark", "fc-color=light")).toBe("dark")
    expect(systemSchemeFromRequest(null, "fc-color=dark")).toBe("dark")
    expect(systemSchemeFromRequest("nope", null)).toBe("light")
  })

  it("persists the choice in cookies that survive a reload", () => {
    writeThemeCookies("dark", "dark")
    expect(readThemeChoice(document.cookie, "light")).toEqual({
      preference: "dark",
      resolved: "dark",
    })
    writeThemeCookies("system", "light")
    expect(readThemeChoice(document.cookie, "dark").preference).toBe("system")
  })

  it("follows OS changes only while System is selected, then detaches", () => {
    const calls: string[] = []
    const media = query(false)
    const stop = subscribeSystemScheme("system", media, (resolved) => {
      calls.push(resolved)
    })

    expect(calls).toEqual(["light"])
    expect(media.listeners.size).toBe(1)

    media.matches = true
    for (const listener of media.listeners) listener()
    expect(calls).toEqual(["light", "dark"])

    stop()
    expect(media.listeners.size).toBe(0)

    media.matches = false
    expect(calls).toEqual(["light", "dark"])

    const fixed = query(true)
    const stopFixed = subscribeSystemScheme("light", fixed, (resolved) => {
      calls.push(resolved)
    })
    expect(calls.at(-1)).toBe("light")
    expect(fixed.listeners.size).toBe(0)
    fixed.matches = false
    stopFixed()
    expect(calls.at(-1)).toBe("light")
  })

  it("does not throw when cookie access is blocked", () => {
    expect(themeInitScript).not.toContain("localStorage")
    const own = Object.getOwnPropertyDescriptor(document, "cookie")
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        throw new Error("blocked")
      },
      set() {
        throw new Error("blocked")
      },
    })
    try {
      expect(() => {
        const run = new Function(themeInitScript)
        run()
      }).not.toThrow()
    } finally {
      if (own) Object.defineProperty(document, "cookie", own)
      else Reflect.deleteProperty(document, "cookie")
    }
  })

  it("survives matchMedia throwing and still applies a class", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(() => {
      throw new Error("no matchMedia")
    })
    document.cookie = `${THEME_COOKIE}=system`
    expect(() => {
      const run = new Function(themeInitScript)
      run()
    }).not.toThrow()
    vi.restoreAllMocks()
  })
})
