import { expect, fn, waitFor } from "storybook/test"

import { type Card, getStats, STARTER_DECK } from "@workspace/core"

import { StatsPanel } from "./stats-panel"
import { StudyCard } from "./study-card"
import { StudySession } from "./study-session"

import type { Meta, StoryObj } from "@storybook/react-vite"

const deck: Card[] = STARTER_DECK.slice(0, 6).map((card, i) => ({
  ...card,
  id: `card-${i}`,
  createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
}))
const [html, , dom] = deck as [Card, Card, Card]
const restApi = deck[4]!

const meta = {
  title: "Features/Study Mode",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const QuestionFace: Story = {
  render: () => (
    <div className="max-w-[776px]">
      <StudyCard card={html} revealed={false} onToggle={fn()} />
    </div>
  ),
}

export const AnswerFace: Story = {
  render: () => (
    <div className="max-w-[776px]">
      <StudyCard card={dom} revealed onToggle={fn()} />
    </div>
  ),
}

export const MasteredCard: Story = {
  render: () => (
    <div className="max-w-[776px]">
      <StudyCard card={restApi} revealed={false} onToggle={fn()} />
    </div>
  ),
}

export const Statistics: Story = {
  render: () => <StatsPanel stats={getStats(deck)} className="max-w-[392px]" />,
}

const onProgress = fn()

export const Session: Story = {
  render: () => (
    <section className="max-w-[816px] overflow-hidden rounded-xl panel-edge-3 bg-card">
      <StudySession
        cards={deck}
        emptyReason="no-cards"
        onProgress={onProgress}
      />
    </section>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /Click to reveal answer/ })
    )
    await waitFor(() =>
      expect(canvas.getByText("HyperText Markup Language")).toBeVisible()
    )
    await userEvent.click(canvas.getByRole("button", { name: "I Know This" }))
    await expect(onProgress).toHaveBeenCalledWith("card-0", "know")
    await userEvent.click(canvas.getByRole("button", { name: "Next" }))
    await expect(canvas.getByText("Card 2 of 6")).toBeVisible()
  },
}

export const AllCaughtUp: Story = {
  render: () => (
    <section className="max-w-[816px] overflow-hidden rounded-xl panel-edge-3 bg-card">
      <StudySession cards={[]} emptyReason="all-mastered" onProgress={fn()} />
    </section>
  ),
}
