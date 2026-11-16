import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("keeps a Figma text preset next to a text color", () => {
    expect(cn("text-preset-4 text-foreground")).toBe(
      "text-preset-4 text-foreground"
    )
  })

  it("lets a later text preset replace an earlier one", () => {
    expect(cn("text-preset-4", "text-preset-5")).toBe("text-preset-5")
  })
})
