import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import {
  readThemeChoice,
  systemSchemeFromRequest,
} from "@workspace/ui/lib/theme"
import type { ThemeChoice } from "@workspace/ui/lib/theme"

/**
 * Theme for this request. The resolved cookie from the last visit seeds
 * System; otherwise the markup is light and the stylesheet's
 * `prefers-color-scheme` rule paints a dark OS before JavaScript runs.
 * The pre-paint script keeps System in step with the live OS once JS runs.
 */
export const readTheme = createServerFn({ method: "GET" }).handler(
  async (): Promise<ThemeChoice> => {
    const request = getRequest()
    const cookies = request.headers.get("cookie")
    return readThemeChoice(cookies, systemSchemeFromRequest(cookies))
  }
)
