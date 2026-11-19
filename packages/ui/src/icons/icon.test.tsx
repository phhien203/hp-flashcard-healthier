import { describe, expect, it } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"

import { Button } from "@workspace/ui/components/button"
import { Icon, iconNames } from "@workspace/ui/icons"

const ALLOWED_FILLS = new Set(["currentColor", "#F8CB46", "#f8cb46", "none"])

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

  it("leaves no hardcoded ink fill, and does not force the export's display", async () => {
    await render(
      <div id="all-icons">
        {iconNames.map((name) => (
          <Icon key={name} name={name} />
        ))}
      </div>
    )
    const icons = document.querySelectorAll("#all-icons [data-slot=icon]")
    expect(icons.length).toBe(iconNames.length)
    for (const icon of icons) {
      if (icon.tagName === "IMG") continue
      expect(icon.getAttribute("style") ?? "").not.toContain("display")
      expect(icon.outerHTML).not.toContain('preserveAspectRatio="none"')
      for (const painted of icon.querySelectorAll("[fill]")) {
        if (painted.closest("clipPath, mask, defs")) continue
        expect(ALLOWED_FILLS.has(painted.getAttribute("fill") ?? "")).toBe(true)
      }
    }
  })

  it("keeps the card-actions dots at their intrinsic size inside a button", async () => {
    await render(
      <Button variant="ghost" size="icon-sm" aria-label="Card actions">
        <Icon name="dots" />
      </Button>
    )
    const svg = document.querySelector("button [data-slot=icon]")
    if (!(svg instanceof SVGElement)) throw new Error("dots svg missing")
    expect(svg.getAttribute("style")).toContain("width:3.375px")
    expect(svg.getAttribute("style")).toContain("height:14.0625px")
    const box = svg.getBoundingClientRect()
    expect(box.width).toBeGreaterThan(3)
    expect(box.width).toBeLessThan(6)
    expect(box.height).toBeGreaterThan(13)
    expect(box.height).toBeLessThan(16)
  })

  it("hides the wordmark below the sm breakpoint", async () => {
    await page.viewport(375, 800)
    try {
      await render(
        <Icon
          name="logo-title"
          label="Flashcard"
          className="text-foreground max-sm:hidden"
        />
      )
      const svg = document.querySelector("[data-slot=icon]")
      if (!(svg instanceof SVGElement)) throw new Error("wordmark missing")
      expect(svg.getAttribute("style") ?? "").not.toContain("display")
      expect(getComputedStyle(svg).display).toBe("none")
    } finally {
      await page.viewport(1280, 800)
    }
  })
})
