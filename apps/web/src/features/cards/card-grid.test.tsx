import { describe, expect, it, vi } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"

import { makeCard } from "@workspace/core/testing"

import { CardGrid, PAGE_SIZE } from "./card-grid"

const cards = Array.from({ length: 30 }, (_, i) =>
  makeCard({ question: `Question #${i + 1}?` })
)

describe("CardGrid", () => {
  it(`shows ${PAGE_SIZE} cards at a time and loads more on request`, async () => {
    const screen = await render(
      <CardGrid
        cards={cards}
        emptyReason="no-cards"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    await expect
      .poll(() => screen.getByRole("article").elements().length)
      .toBe(12)
    await screen.getByRole("button", { name: "Load More" }).click()
    await expect
      .poll(() => screen.getByRole("article").elements().length)
      .toBe(24)
    await screen.getByRole("button", { name: "Load More" }).click()
    await expect
      .poll(() => screen.getByRole("article").elements().length)
      .toBe(30)
    await expect
      .element(screen.getByRole("button", { name: "Load More" }))
      .not.toBeInTheDocument()
  })

  it("offers Edit and Delete from each card's menu", async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const screen = await render(
      <CardGrid
        cards={cards.slice(0, 2)}
        emptyReason="no-cards"
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    await screen
      .getByRole("button", { name: "Actions for “Question #2?”" })
      .click()
    await page.getByRole("menuitem", { name: "Edit" }).click()
    expect(onEdit).toHaveBeenCalledWith(cards[1])
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument()

    await screen
      .getByRole("button", { name: "Actions for “Question #1?”" })
      .click()
    await page.getByRole("menuitem", { name: "Delete" }).click()
    expect(onDelete).toHaveBeenCalledWith(cards[0])
  })

  it("shows the empty state from the design when there are no cards", async () => {
    const screen = await render(
      <CardGrid
        cards={[]}
        emptyReason="no-cards"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    await expect.element(screen.getByText("No cards yet")).toBeVisible()
    await expect
      .element(
        screen.getByText(
          "Add your first card using the form above and it will show up here."
        )
      )
      .toBeVisible()
  })
})
