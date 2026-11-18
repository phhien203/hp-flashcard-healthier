import { afterEach, describe, expect, it, vi } from "vitest"

import {
  DEFAULT_THEME,
  parseThemePreference,
  readBroadcastChoice,
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

function installMatchMedia(matches: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation((media: string) => {
    return {
      matches: media.includes("prefers-color-scheme: dark") ? matches : false,
      media,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false
      },
    } as MediaQueryList
  })
}

function runInitScript() {
  const run = new Function(themeInitScript)
  run()
}

describe("theme preference", () => {
  afterEach(() => {
    document.cookie = `${THEME_COOKIE}=; Path=/; Max-Age=0`
    document.cookie = `${RESOLVED_COOKIE}=; Path=/; Max-Age=0`
    document.documentElement.classList.remove("dark")
    document.documentElement.style.colorScheme = ""
    document.documentElement.removeAttribute("data-theme")
    document.querySelector('meta[name="theme-color"]')?.remove()
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

  it("uses the stored scheme, then light", () => {
    expect(systemSchemeFromRequest("fc-color=dark")).toBe("dark")
    expect(systemSchemeFromRequest("fc-color=light")).toBe("light")
    expect(systemSchemeFromRequest(null)).toBe("light")
    expect(systemSchemeFromRequest("fc-color=nope")).toBe("light")
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

  it("does not persist System for a visit that never chose, and skips an unchanged write", () => {
    writeThemeCookies("system", "dark")
    expect(readCookie(document.cookie, THEME_COOKIE)).toBeNull()
    expect(readCookie(document.cookie, RESOLVED_COOKIE)).toBe("dark")

    const proto = Object.getOwnPropertyDescriptor(Document.prototype, "cookie")
    if (!proto || !proto.get || !proto.set) {
      throw new Error("document.cookie is not configurable")
    }
    const { get, set } = proto
    let writes = 0
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        return get.call(this)
      },
      set(value: string) {
        writes += 1
        set.call(this, value)
      },
    })
    try {
      writeThemeCookies("system", "dark")
      expect(writes).toBe(0)
      writeThemeCookies("light", "dark")
      expect(writes).toBe(1)
      expect(readCookie(document.cookie, THEME_COOKIE)).toBe("light")
    } finally {
      Reflect.deleteProperty(document, "cookie")
    }
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

  it("does not throw when cookie access is blocked, and still follows the OS", () => {
    expect(themeInitScript).not.toContain("localStorage")
    installMatchMedia(true)
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
      expect(() => runInitScript()).not.toThrow()
      expect(document.documentElement.classList.contains("dark")).toBe(true)
      expect(document.documentElement.dataset.theme).toBe("system")
    } finally {
      if (own) Object.defineProperty(document, "cookie", own)
      else Reflect.deleteProperty(document, "cookie")
    }
  })

  it("paints an explicit choice and treats an invalid cookie as System", () => {
    installMatchMedia(false)
    document.cookie = `${THEME_COOKIE}=dark`
    runInitScript()
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.dataset.theme).toBe("dark")

    document.documentElement.classList.remove("dark")
    installMatchMedia(true)
    document.cookie = `${THEME_COOKIE}=light`
    runInitScript()
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(document.documentElement.dataset.theme).toBe("light")

    installMatchMedia(true)
    document.cookie = `${THEME_COOKIE}=system`
    runInitScript()
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.dataset.theme).toBe("system")

    document.documentElement.classList.remove("dark")
    document.cookie = `${THEME_COOKIE}=sepia`
    runInitScript()
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.dataset.theme).toBe("system")
  })

  it("keeps the stored scheme when matchMedia throws, and does not rewrite a matching cookie", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(() => {
      throw new Error("no matchMedia")
    })
    document.cookie = `${THEME_COOKIE}=system`
    document.cookie = `${RESOLVED_COOKIE}=dark`
    const proto = Object.getOwnPropertyDescriptor(Document.prototype, "cookie")
    if (!proto || !proto.get || !proto.set) {
      throw new Error("document.cookie is not configurable")
    }
    const { get, set } = proto
    let writes = 0
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        return get.call(this)
      },
      set(value: string) {
        writes += 1
        set.call(this, value)
      },
    })
    try {
      expect(() => runInitScript()).not.toThrow()
      expect(writes).toBe(0)
      expect(document.documentElement.classList.contains("dark")).toBe(true)
      expect(document.documentElement.dataset.theme).toBe("system")
    } finally {
      Reflect.deleteProperty(document, "cookie")
    }
  })

  it("ignores a broadcast that is not a theme choice", () => {
    expect(readBroadcastChoice(null)).toBeNull()
    expect(readBroadcastChoice({ preference: "sepia", resolved: "dark" })).toBe(
      null
    )
    expect(readBroadcastChoice({ preference: "dark", resolved: "nope" })).toBe(
      null
    )
    expect(
      readBroadcastChoice({ preference: "dark", resolved: "dark" })
    ).toEqual({ preference: "dark", resolved: "dark" })
  })
})
