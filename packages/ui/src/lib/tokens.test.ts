import { describe, expect, it } from "vitest"
import { palette } from "./tokens"

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
})
