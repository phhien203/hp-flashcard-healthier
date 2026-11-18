import { describe, expect, it } from "vitest"

import { contrastRatio } from "./color"
import { palette, themeColors } from "./tokens"

function probe(variable: string, dark: boolean) {
  const el = document.createElement("div")
  if (dark) el.classList.add("dark")
  el.style.color = `var(${variable})`
  document.body.appendChild(el)
  const value = getComputedStyle(el).color
  el.remove()
  return value.replaceAll(" ", "")
}

function rgb(hex: string) {
  const value = parseInt(hex.slice(1), 16)
  return `rgb(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255})`
}

describe("palette", () => {
  it.each(Object.entries(palette))(
    "matches --fc-%s in globals.css",
    (name, hex) => {
      const css = getComputedStyle(document.documentElement).getPropertyValue(
        `--fc-${name}`
      )
      expect(css.trim().toLowerCase()).toBe(hex)
    }
  )

  it("keeps the Figma primitives when dark is on, so the scrim stays a dark veil", () => {
    const root = document.documentElement
    root.classList.add("dark")
    try {
      for (const [name, hex] of Object.entries(palette)) {
        const css = getComputedStyle(root).getPropertyValue(`--fc-${name}`)
        expect(css.trim().toLowerCase()).toBe(hex)
      }
      expect(probe("--overlay", true)).toBe("rgba(8,4,2,0.75)")
      expect(probe("--destructive", true)).toBe(
        rgb(themeColors.dark.destructive)
      )
      expect(probe("--background", true)).toBe(rgb(themeColors.dark.background))
    } finally {
      root.classList.remove("dark")
    }
  })
})

describe("theme contrast", () => {
  it.each([
    [
      "light destructive on the page",
      themeColors.light.destructive,
      themeColors.light.background,
    ],
    [
      "light destructive on a card",
      themeColors.light.destructive,
      themeColors.light.card,
    ],
    ["light link on a card", themeColors.light.link, themeColors.light.card],
    [
      "light link on the page",
      themeColors.light.link,
      themeColors.light.background,
    ],
    [
      "light muted text on a card",
      themeColors.light.mutedForeground,
      themeColors.light.card,
    ],
    [
      "dark text on the page",
      themeColors.dark.foreground,
      themeColors.dark.background,
    ],
    ["dark text on a card", themeColors.dark.foreground, themeColors.dark.card],
    [
      "dark muted text on a card",
      themeColors.dark.mutedForeground,
      themeColors.dark.card,
    ],
    [
      "dark destructive on a card",
      themeColors.dark.destructive,
      themeColors.dark.card,
    ],
    ["dark link on a card", themeColors.dark.link, themeColors.dark.card],
    [
      "ink on the yellow primary",
      themeColors.light.primaryForeground,
      themeColors.light.primary,
    ],
  ])("%s clears WCAG AA", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5)
  })

  it("keeps semantic colors in sync with the stylesheet", () => {
    expect(probe("--destructive", false)).toBe(
      rgb(themeColors.light.destructive)
    )
    expect(probe("--link", false)).toBe(rgb(themeColors.light.link))
    expect(probe("--background", false)).toBe(rgb(themeColors.light.background))
    expect(probe("--ink", true)).toBe(rgb(themeColors.light.primaryForeground))
    expect(probe("--overlay", false)).toBe("rgba(46,20,1,0.7)")
  })
})
