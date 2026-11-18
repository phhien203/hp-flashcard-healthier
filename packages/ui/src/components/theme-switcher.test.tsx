import { afterEach, describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher"

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
    document.documentElement.classList.remove("dark")
    document.documentElement.style.colorScheme = ""
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

    light
      .element()
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
      )
    await expect.element(dark).toBeChecked()
    expect(document.activeElement).toBe(dark.element())
    expect(document.documentElement.classList.contains("dark")).toBe(true)
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
    const { listeners, query } = installMedia(true)
    const screen = await render(
      <ThemeProvider preference="system" resolved="dark">
        <ThemeSwitcher />
      </ThemeProvider>
    )

    expect(listeners.size).toBe(1)
    await screen.getByRole("radio", { name: "Light" }).click()
    expect(listeners.size).toBe(0)
    expect(document.documentElement.classList.contains("dark")).toBe(false)

    query.matches = false
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })
})
