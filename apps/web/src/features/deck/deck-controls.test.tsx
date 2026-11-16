import { describe, expect, it, vi } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"

import { DeckControls, type DeckControlsProps } from "./deck-controls"

async function renderControls(props: Partial<DeckControlsProps> = {}) {
  const handlers = {
    onSelectedCategoriesChange: vi.fn(),
    onHideMasteredChange: vi.fn(),
    onShuffle: vi.fn(),
  }
  const screen = await render(
    <DeckControls
      categories={[
        { name: "CSS", count: 6 },
        { name: "JavaScript", count: 14 },
      ]}
      selectedCategories={[]}
      hideMastered={false}
      {...handlers}
      {...props}
    />
  )
  return { screen, ...handlers }
}

describe("DeckControls", () => {
  it("lists categories with their counts and adds a picked category to the selection", async () => {
    const { screen, onSelectedCategoriesChange } = await renderControls({
      selectedCategories: ["CSS"],
    })

    await screen.getByRole("button", { name: "CSS" }).click()
    await expect
      .element(page.getByRole("menuitemcheckbox", { name: "CSS (6)" }))
      .toBeChecked()
    await page
      .getByRole("menuitemcheckbox", { name: "JavaScript (14)" })
      .click()

    expect(onSelectedCategoriesChange).toHaveBeenCalledWith([
      "CSS",
      "JavaScript",
    ])
  })

  it("labels the filter with the selection", async () => {
    const { screen } = await renderControls({
      selectedCategories: ["CSS", "JavaScript"],
    })
    await expect
      .element(screen.getByRole("button", { name: "2 Categories" }))
      .toBeVisible()
  })

  it("toggles Hide Mastered from its label and shuffles on request", async () => {
    const { screen, onHideMasteredChange, onShuffle } = await renderControls()

    await screen.getByText("Hide Mastered").click()
    await screen.getByRole("button", { name: "Shuffle" }).click()

    expect(onHideMasteredChange).toHaveBeenCalledWith(true)
    expect(onShuffle).toHaveBeenCalledOnce()
  })
})
