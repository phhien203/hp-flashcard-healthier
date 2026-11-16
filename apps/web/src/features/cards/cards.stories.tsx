import { expect, fn } from "storybook/test"

import { type Card, STARTER_DECK } from "@workspace/core"

import { CardForm } from "./card-form"
import { CardGrid } from "./card-grid"
import { CardTile } from "./card-tile"

import type { Meta, StoryObj } from "@storybook/react-vite"

const deck: Card[] = STARTER_DECK.map((card, i) => ({
  ...card,
  id: `card-${i}`,
  createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
}))

const meta = {
  title: "Features/All Cards",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const onSubmit = fn(async () => {})

export const CreateForm: Story = {
  render: () => (
    <section className="max-w-[1240px] rounded-xl panel-edge-4 bg-card p-8">
      <CardForm
        submitLabel="Create Card"
        submitIcon="circle-plus"
        onSubmit={onSubmit}
      />
    </section>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Create Card" }))
    await expect(
      await canvas.findByText("Please enter a question.")
    ).toBeVisible()
    await expect(onSubmit).not.toHaveBeenCalled()
  },
}

export const Tile: Story = {
  render: () => (
    <div className="grid max-w-[397px]">
      <CardTile card={deck[5]!} onEdit={fn()} onDelete={fn()} />
    </div>
  ),
}

export const Grid: Story = {
  render: () => (
    <div className="max-w-[1240px]">
      <CardGrid
        cards={deck}
        emptyReason="no-cards"
        onEdit={fn()}
        onDelete={fn()}
      />
    </div>
  ),
}

export const NoCardsYet: Story = {
  render: () => (
    <CardGrid cards={[]} emptyReason="no-cards" onEdit={fn()} onDelete={fn()} />
  ),
}
