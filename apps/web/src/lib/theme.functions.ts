import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import {
  readThemeChoice,
  systemSchemeFromRequest,
} from "@workspace/ui/lib/theme"
import type { ThemeChoice } from "@workspace/ui/lib/theme"

/**
 * Theme for this request. A `Sec-CH-Prefers-Color-Scheme` hint wins, then the
 * resolved cookie from the last visit, then light. The pre-paint script is
 * what keeps System in step with the live OS; this only seeds the SSR markup.
 */
export const readTheme = createServerFn({ method: "GET" }).handler(
  async (): Promise<ThemeChoice> => {
    const request = getRequest()
    const hint = request.headers.get("sec-ch-prefers-color-scheme")
    const cookies = request.headers.get("cookie")
    return readThemeChoice(cookies, systemSchemeFromRequest(hint, cookies))
  }
)
