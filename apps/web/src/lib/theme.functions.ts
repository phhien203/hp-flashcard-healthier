import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import {
  readThemeChoice,
  systemSchemeFromRequest,
} from "@workspace/ui/lib/theme"
import type { ThemeChoice } from "@workspace/ui/lib/theme"

/**
 * Theme for this request. System leaves the `.dark` class off so the
 * stylesheet's `prefers-color-scheme` rule decides; `fc-color` still
 * seeds Clerk and `theme-color` from the last visit. The pre-paint script
 * replaces that with the live OS before paint.
 */
export const readTheme = createServerFn({ method: "GET" }).handler(
  async (): Promise<ThemeChoice> => {
    const request = getRequest()
    const cookies = request.headers.get("cookie")
    return readThemeChoice(cookies, systemSchemeFromRequest(cookies))
  }
)
