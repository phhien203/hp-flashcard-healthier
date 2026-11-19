import { afterEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { render } from "vitest-browser-react"

import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher"
import {
  RESOLVED_COOKIE,
  THEME_CHANNEL,
  THEME_COOKIE,
} from "@workspace/ui/lib/theme"

function installMedia(matches: boolean) {
  const listeners = new Set<() => void>()
  const query = {
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener(_type: string, listener: () => void) {
      listeners.add(listener)
    },
    removeEventListener(_type: string, listener: () => void) {
      listeners.delete(listener)
    },
    dispatchEvent() {
      return false
    },
  }
  vi.spyOn(window, "matchMedia").mockReturnValue(
    query as unknown as MediaQueryList
  )
  return { listeners, query }
}

describe("ThemeSwitcher", () => {
  afterEach(() => {
    document.cookie = `${THEME_COOKIE}=; Path=/; Max-Age=0`
    document.cookie = `${RESOLVED_COOKIE}=; Path=/; Max-Age=0`
    document.documentElement.classList.remove("dark")
    document.documentElement.style.colorScheme = ""
    document.documentElement.removeAttribute("data-theme")
    vi.restoreAllMocks()
  })

  it("exposes a labelled, keyboard-operable radiogroup with a visible focus ring", async () => {
    installMedia(false)
    const screen = await render(
      <ThemeProvider preference="light" resolved="light">
        <ThemeSwitcher />
      </ThemeProvider>
    )

    await expect
      .element(screen.getByRole("radiogroup", { name: "Theme" }))
      .toBeVisible()
    const light = screen.getByRole("radio", { name: "Light" })
    const dark = screen.getByRole("radio", { name: "Dark" })
    await expect.element(light).toBeChecked()
    expect(light.element().className).toContain("focus-ring")
    expect(light.element().tabIndex).toBe(0)
    expect(dark.element().tabIndex).toBe(-1)

    light.element().focus()
    await userEvent.keyboard("{ArrowRight}")
    await expect.element(dark).toBeChecked()
    expect(document.activeElement).toBe(dark.element())
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("moves with the arrow keys, Home, End, Space and Enter", async () => {
    installMedia(false)
    const screen = await render(
      <ThemeProvider preference="light" resolved="light">
        <ThemeSwitcher />
      </ThemeProvider>
    )
    const light = screen.getByRole("radio", { name: "Light" })
    const dark = screen.getByRole("radio", { name: "Dark" })
    const system = screen.getByRole("radio", { name: "System" })

    await light.click()
    await userEvent.keyboard("{ArrowRight}")
    await expect.element(dark).toBeChecked()
    await userEvent.keyboard("{ArrowLeft}")
    await expect.element(light).toBeChecked()
    await userEvent.keyboard("{ArrowLeft}")
    await expect.element(system).toBeChecked()
    await userEvent.keyboard("{ArrowDown}")
    await expect.element(light).toBeChecked()
    await userEvent.keyboard("{ArrowUp}")
    await expect.element(system).toBeChecked()
    await userEvent.keyboard("{Home}")
    await expect.element(light).toBeChecked()
    await userEvent.keyboard("{End}")
    await expect.element(system).toBeChecked()

    dark.element().focus()
    await userEvent.keyboard("{Enter}")
    await expect.element(dark).toBeChecked()
    expect(document.documentElement.classList.contains("dark")).toBe(true)

    light.element().focus()
    await userEvent.keyboard(" ")
    await expect.element(light).toBeChecked()
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("follows the OS while System is selected", async () => {
    const { listeners, query } = installMedia(false)
    await render(
      <ThemeProvider preference="system" resolved="light">
        <ThemeSwitcher />
      </ThemeProvider>
    )

    expect(listeners.size).toBe(1)
    query.matches = true
    for (const listener of listeners) listener()
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("detaches the OS listener after a fixed Light or Dark choice", async () => {
    const { listeners } = installMedia(true)
    const screen = await render(
      <ThemeProvider preference="system" resolved="dark">
        <ThemeSwitcher />
      </ThemeProvider>
    )

    expect(listeners.size).toBe(1)
    await screen.getByRole("radio", { name: "Light" }).click()
    expect(listeners.size).toBe(0)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("tells other tabs about a choice and applies theirs", async () => {
    installMedia(false)
    const screen = await render(
      <ThemeProvider preference="light" resolved="light">
        <ThemeSwitcher />
      </ThemeProvider>
    )
    const other = new BroadcastChannel(THEME_CHANNEL)
    try {
      const incoming = new Promise<MessageEvent>((resolve) => {
        other.addEventListener("message", resolve, { once: true })
      })
      await screen.getByRole("radio", { name: "Dark" }).click()
      expect((await incoming).data).toEqual({
        preference: "dark",
        resolved: "dark",
      })

      other.postMessage({ preference: "system", resolved: "light" })
      await expect
        .element(screen.getByRole("radio", { name: "System" }))
        .toBeChecked()
      expect(document.documentElement.classList.contains("dark")).toBe(false)
      expect(document.documentElement.dataset.theme).toBe("system")
    } finally {
      other.close()
    }
  })
})
