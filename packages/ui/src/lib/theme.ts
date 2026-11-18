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
 * The resolved cookie from the last visit wins; otherwise light. The
 * stylesheet paints a first visit on a dark OS, and the pre-paint script
 * corrects it once JavaScript runs. A client hint is not read: browsers
 * only send `Sec-CH-Prefers-Color-Scheme` after `Accept-CH`, which this
 * response does not ask for.
 */
export function systemSchemeFromRequest(
  cookieHeader: string | null | undefined
): ResolvedTheme {
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

/**
 * Paint `<html>` to match a resolved theme. Safe to call before React hydrates.
 * `preference` is recorded as `data-theme` so the no-JS stylesheet can follow
 * the OS only while the choice is System.
 */
export function applyResolvedTheme(
  resolved: ResolvedTheme,
  preference?: ThemePreference
): void {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
  if (preference) root.dataset.theme = preference
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
  applyResolvedTheme(choice.resolved, choice.preference)
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
    const current = document.cookie
    const currentPreference = readCookie(current, THEME_COOKIE)
    const currentResolved = readCookie(current, RESOLVED_COOKIE)
    // A first visit has no preference cookie. System is already the default,
    // so don't invent fc-theme=system for someone who never chose.
    const persistPreference = !(
      preference === "system" && currentPreference == null
    )
    const preferenceChanged =
      persistPreference && currentPreference !== preference
    const resolvedChanged = currentResolved !== resolved
    if (!preferenceChanged && !resolvedChanged) return

    const secure = location.protocol === "https:" ? "; Secure" : ""
    const base = `; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
    if (preferenceChanged) {
      document.cookie = `${THEME_COOKIE}=${preference}${base}`
    }
    if (resolvedChanged) {
      document.cookie = `${RESOLVED_COOKIE}=${resolved}${base}`
    }
  } catch {
    // `document.cookie` throws when storage is blocked. The choice still
    // applies for this page view.
  }
}

/** Other tabs hear a choice on this channel. The sender does not. */
export const THEME_CHANNEL = "fc-theme"

export function readBroadcastChoice(data: unknown): ThemeChoice | null {
  if (!data || typeof data !== "object") return null
  const record = data as { preference?: unknown; resolved?: unknown }
  if (
    record.preference !== "light" &&
    record.preference !== "dark" &&
    record.preference !== "system"
  ) {
    return null
  }
  const resolved = parseResolvedTheme(
    typeof record.resolved === "string" ? record.resolved : null
  )
  if (!resolved) return null
  return { preference: record.preference, resolved }
}

export function broadcastThemeChoice(choice: ThemeChoice): void {
  try {
    const channel = new BroadcastChannel(THEME_CHANNEL)
    channel.postMessage(choice)
    channel.close()
  } catch {
    // BroadcastChannel can be missing or blocked. This tab still updates.
  }
}

export function subscribeThemeBroadcast(
  onChange: (choice: ThemeChoice) => void
): () => void {
  try {
    const channel = new BroadcastChannel(THEME_CHANNEL)
    const onMessage = (event: MessageEvent) => {
      const choice = readBroadcastChoice(event.data)
      if (choice) onChange(choice)
    }
    channel.addEventListener("message", onMessage)
    return () => {
      channel.removeEventListener("message", onMessage)
      channel.close()
    }
  } catch {
    return () => {}
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
 *
 * A Content-Security-Policy that disallows inline scripts needs a nonce on
 * the tag that injects this string. The body is a build-time constant: no
 * cookie value is interpolated into it.
 */
export const themeInitScript = `(function(){try{var preference="system";var hinted="";try{var cookies=document.cookie||"";var pref=cookies.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var hint=cookies.match(/(?:^|; )${RESOLVED_COOKIE}=([^;]*)/);if(pref&&pref[1])preference=decodeURIComponent(pref[1]);if(hint&&hint[1])hinted=decodeURIComponent(hint[1]);}catch(e){}if(preference!=="light"&&preference!=="dark"&&preference!=="system")preference="system";var dark=false;if(preference==="dark")dark=true;else if(preference==="light")dark=false;else{var systemDark=hinted==="dark";try{systemDark=window.matchMedia("(prefers-color-scheme: dark)").matches;}catch(e){}dark=systemDark;}var root=document.documentElement;if(root){try{root.setAttribute("data-theme",preference);}catch(e){}if(root.classList)root.classList.toggle("dark",dark);if(root.style)root.style.colorScheme=dark?"dark":"light";}try{var color=dark?"${themeColors.dark.themeColor}":"${themeColors.light.themeColor}";var meta=document.querySelector('meta[name="theme-color"]');if(!meta){meta=document.createElement("meta");meta.setAttribute("name","theme-color");(document.head||root).appendChild(meta);}meta.setAttribute("content",color);}catch(e){}try{var next=dark?"dark":"light";if(hinted!==next){var secure=location.protocol==="https:"?"; Secure":"";var base="; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax"+secure;document.cookie="${RESOLVED_COOKIE}="+next+base;}}catch(e){}}catch(e){}})();`
