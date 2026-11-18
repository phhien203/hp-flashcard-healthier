import { themeColors } from "@workspace/ui/lib/tokens"

export const THEME_OPTIONS = ["light", "dark", "system"] as const

export type ThemePreference = (typeof THEME_OPTIONS)[number]
export type ResolvedTheme = "light" | "dark"

export type ThemeChoice = {
  preference: ThemePreference
  resolved: ResolvedTheme
}

/** No saved choice follows the operating system. */
export const DEFAULT_THEME: ThemePreference = "system"

/** Preference cookie. Not HttpOnly: the pre-paint script has to read it. */
export const THEME_COOKIE = "fc-theme"

/**
 * Last resolved light/dark value. Lets SSR paint System correctly on the
 * next request, including when the OS preference changed with the page closed.
 */
export const RESOLVED_COOKIE = "fc-color"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function parseThemePreference(
  value: string | null | undefined
): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") return value
  return DEFAULT_THEME
}

export function parseResolvedTheme(
  value: string | null | undefined
): ResolvedTheme | null {
  if (value === "light" || value === "dark") return value
  return null
}

/** Explicit Light/Dark wins. System uses the scheme the caller measured. */
export function resolveTheme(
  preference: ThemePreference,
  systemScheme: ResolvedTheme
): ResolvedTheme {
  return preference === "system" ? systemScheme : preference
}

export function readCookie(
  cookieHeader: string | null | undefined,
  name: string
): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=")
    if (separator === -1) continue
    if (part.slice(0, separator).trim() !== name) continue
    const raw = part.slice(separator + 1).trim()
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }
  return null
}

export function readThemeChoice(
  cookieHeader: string | null | undefined,
  systemScheme: ResolvedTheme
): ThemeChoice {
  const preference = parseThemePreference(
    readCookie(cookieHeader, THEME_COOKIE)
  )
  return {
    preference,
    resolved: resolveTheme(preference, systemScheme),
  }
}

/**
 * System scheme for a request that cannot see `prefers-color-scheme`.
 * A client hint wins; otherwise the resolved cookie from the last visit.
 */
export function systemSchemeFromRequest(
  clientHint: string | null | undefined,
  cookieHeader: string | null | undefined
): ResolvedTheme {
  const hint = parseResolvedTheme(clientHint)
  if (hint) return hint
  return (
    parseResolvedTheme(readCookie(cookieHeader, RESOLVED_COOKIE)) ?? "light"
  )
}

export function readThemeFromDocument(): ThemeChoice {
  let cookieHeader: string | null = null
  try {
    cookieHeader = document.cookie
  } catch {
    cookieHeader = null
  }
  let systemScheme: ResolvedTheme = "light"
  try {
    systemScheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  } catch {
    systemScheme =
      parseResolvedTheme(readCookie(cookieHeader, RESOLVED_COOKIE)) ?? "light"
  }
  return readThemeChoice(cookieHeader, systemScheme)
}

export function themeClassName(resolved: ResolvedTheme): string | undefined {
  return resolved === "dark" ? "dark" : undefined
}

export function themeColor(resolved: ResolvedTheme): string {
  return themeColors[resolved].themeColor
}

/** Paint `<html>` to match a resolved theme. Safe to call before React hydrates. */
export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
  const color = themeColor(resolved)
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement("meta")
    meta.setAttribute("name", "theme-color")
    document.head.appendChild(meta)
  }
  meta.setAttribute("content", color)
}

/**
 * Last theme committed on the client. The root document subscribes so the
 * `<html>` class stays under React's control after the pre-paint script, and
 * hydration still starts from the server snapshot (this stays null until the
 * first client commit).
 */
let published: ThemeChoice | null = null
const themeListeners = new Set<() => void>()

export function publishTheme(choice: ThemeChoice): void {
  published = choice
  applyResolvedTheme(choice.resolved)
  for (const listener of themeListeners) listener()
}

export function subscribePublishedTheme(listener: () => void): () => void {
  themeListeners.add(listener)
  return () => {
    themeListeners.delete(listener)
  }
}

export function publishedTheme(): ThemeChoice | null {
  return published
}

export function writeThemeCookies(
  preference: ThemePreference,
  resolved: ResolvedTheme
): void {
  try {
    const secure = location.protocol === "https:" ? "; Secure" : ""
    const base = `; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
    document.cookie = `${THEME_COOKIE}=${preference}${base}`
    document.cookie = `${RESOLVED_COOKIE}=${resolved}${base}`
  } catch {
    // `document.cookie` throws when storage is blocked. The choice still
    // applies for this page view.
  }
}

export type SystemSchemeQuery = {
  matches: boolean
  addEventListener: (type: "change", listener: () => void) => void
  removeEventListener: (type: "change", listener: () => void) => void
}

/**
 * Publish the resolved theme and, only while the preference is System,
 * subscribe to OS changes. The returned function detaches that listener.
 */
export function subscribeSystemScheme(
  preference: ThemePreference,
  query: SystemSchemeQuery,
  onChange: (resolved: ResolvedTheme) => void
): () => void {
  const publish = () => {
    onChange(resolveTheme(preference, query.matches ? "dark" : "light"))
  }
  publish()
  if (preference !== "system") return () => {}
  const onSchemeChange = () => publish()
  try {
    query.addEventListener("change", onSchemeChange)
  } catch {
    return () => {}
  }
  return () => {
    try {
      query.removeEventListener("change", onSchemeChange)
    } catch {
      // The query may already be gone if the document is unloading.
    }
  }
}

/**
 * Blocking script for `<head>`. It runs before first paint, so a reload does
 * not flash the wrong theme, and it never throws if cookie or matchMedia
 * access is blocked. Keep the cookie names in sync with the constants above.
 */
export const themeInitScript = `(function(){try{var preference="system";var hinted="";try{var cookies=document.cookie||"";var pref=cookies.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var hint=cookies.match(/(?:^|; )${RESOLVED_COOKIE}=([^;]*)/);if(pref&&pref[1])preference=decodeURIComponent(pref[1]);if(hint&&hint[1])hinted=decodeURIComponent(hint[1]);}catch(e){}if(preference!=="light"&&preference!=="dark"&&preference!=="system")preference="system";var dark=false;if(preference==="dark")dark=true;else if(preference==="light")dark=false;else{var systemDark=hinted==="dark";try{systemDark=window.matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){}dark=systemDark;}var root=document.documentElement;if(root&&root.classList){root.classList.toggle("dark",dark);if(root.style)root.style.colorScheme=dark?"dark":"light";}try{var color=dark?"${themeColors.dark.themeColor}":"${themeColors.light.themeColor}";var meta=document.querySelector('meta[name="theme-color"]');if(!meta){meta=document.createElement("meta");meta.setAttribute("name","theme-color");(document.head||root).appendChild(meta);}meta.setAttribute("content",color);}catch(e){}try{var secure=location.protocol==="https:"?"; Secure":"";var base="; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax"+secure;document.cookie="${RESOLVED_COOKIE}="+(dark?"dark":"light")+base;}catch(e){}}catch(e){}})();`
