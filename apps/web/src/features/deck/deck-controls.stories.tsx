import { fn } from "storybook/test"

import { DeckControls } from "./deck-controls"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Features/Deck controls",
  component: DeckControls,
  parameters: { layout: "padded" },
  args: {
    categories: [
      { name: "CSS", count: 6 },
      { name: "Geography", count: 4 },
      { name: "JavaScript", count: 14 },
    ],
    selectedCategories: [],
    hideMastered: false,
    onSelectedCategoriesChange: fn(),
    onHideMasteredChange: fn(),
    onShuffle: fn(),
  },
} satisfies Meta<typeof DeckControls>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Filtered: Story = {
  args: { selectedCategories: ["CSS"], hideMastered: true },
}
