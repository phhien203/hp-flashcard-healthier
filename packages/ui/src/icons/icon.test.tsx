import { describe, expect, it } from "vitest"
import { render } from "vitest-browser-react"

import { Icon } from "@workspace/ui/icons"

describe("Icon", () => {
  it("paints ink icons with currentColor so they follow the theme", async () => {
    const screen = await render(
      <div id="ink-icons" className="text-foreground">
        <Icon name="dots" />
        <Icon name="logo-title" label="Flashcard" />
        <Icon name="edit" />
        <Icon name="trash" />
        <Icon name="close" />
        <Icon name="stat-total" />
      </div>
    )

    const icons = document.querySelectorAll("#ink-icons [data-slot=icon]")
    expect(icons.length).toBeGreaterThanOrEqual(6)
    for (const icon of icons) {
      expect(icon.outerHTML).toContain("currentColor")
      expect(icon.outerHTML.toLowerCase()).not.toContain("#2e1401")
    }
    await expect
      .element(screen.getByRole("img", { name: "Flashcard" }))
      .toBeVisible()
  })

  it("keeps the checkbox yellow and the pattern as artwork", async () => {
    await render(
      <div id="artwork-icons">
        <Icon name="checkbox-checked" />
        <Icon name="pattern" />
      </div>
    )
    const [checkbox, pattern] = document.querySelectorAll(
      "#artwork-icons [data-slot=icon]"
    )
    expect(checkbox.outerHTML).toContain("currentColor")
    expect(checkbox.outerHTML.toUpperCase()).toContain("#F8CB46")
    expect(pattern.tagName).toBe("IMG")
  })
})
