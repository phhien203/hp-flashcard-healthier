import { describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"
import { render } from "vitest-browser-react"

import type { Card } from "@workspace/core"
import { makeCard } from "@workspace/core/testing"

import { StudySession, type StudySessionProps } from "./study-session"

const deck: Card[] = [
  makeCard({
    question: "What does HTML stand for?",
    answer: "HyperText Markup Language",
    category: "Web Development",
  }),
  makeCard({
    question: "What is the capital of France?",
    answer: "Paris",
    category: "Geography",
    knownCount: 2,
  }),
  makeCard({
    question: "Who wrote 'Romeo and Juliet'?",
    answer: "William Shakespeare",
    category: "Literature",
    knownCount: 5,
  }),
]

async function renderSession(props: Partial<StudySessionProps> = {}) {
  const onProgress = vi.fn()
  const screen = await render(
    <StudySession
      cards={deck}
      emptyReason="no-cards"
      onProgress={onProgress}
      {...props}
    />
  )
  return { screen, onProgress }
}

describe("StudySession", () => {
  it("shows the question first and reveals the answer when the card is clicked", async () => {
    const { screen } = await renderSession()

    await expect
      .element(screen.getByText("What does HTML stand for?"))
      .toBeVisible()
    await expect
      .element(screen.getByText("Click to reveal answer"))
      .toBeVisible()

    await screen.getByRole("button", { name: /Click to reveal answer/ }).click()

    await expect
      .element(screen.getByText("HyperText Markup Language"))
      .toBeVisible()
    await expect
      .element(screen.getByText("What does HTML stand for?"))
      .not.toBeInTheDocument()
  })

  it("records 'I Know This' and 'Reset Progress' for the current card", async () => {
    const { screen, onProgress } = await renderSession()

    await screen.getByRole("button", { name: "I Know This" }).click()
    await screen.getByRole("button", { name: "Reset Progress" }).click()

    expect(onProgress.mock.calls).toEqual([
      [deck[0]!.id, "know"],
      [deck[0]!.id, "reset"],
    ])
  })

  it("moves between cards with Previous / Next and the arrow keys, wrapping at the ends", async () => {
    const { screen } = await renderSession()
    await expect.element(screen.getByText("Card 1 of 3")).toBeVisible()

    await screen.getByRole("button", { name: "Next" }).click()
    await expect
      .element(screen.getByText("What is the capital of France?"))
      .toBeVisible()
    await expect.element(screen.getByText("Card 2 of 3")).toBeVisible()

    await userEvent.keyboard("{ArrowRight}")
    await expect.element(screen.getByText("Card 3 of 3")).toBeVisible()

    await userEvent.keyboard("{ArrowRight}")
    await expect.element(screen.getByText("Card 1 of 3")).toBeVisible()

    await screen.getByRole("button", { name: "Previous" }).click()
    await expect.element(screen.getByText("Card 3 of 3")).toBeVisible()
  })

  it("fades the content on pointer navigation but changes instantly for the arrow keys", async () => {
    const { screen } = await renderSession()

    // A pointer click animates the content swapping in.
    await screen.getByRole("button", { name: "Next" }).click()
    const animated = screen
      .getByText("What is the capital of France?")
      .element()
      .closest("div")!
    expect(animated.className).toContain("animate-in")

    // Arrow-key navigation changes instantly, with no enter animation.
    await userEvent.keyboard("{ArrowRight}")
    const instant = screen
      .getByText("Who wrote 'Romeo and Juliet'?")
      .element()
      .closest("div")!
    expect(instant.className).not.toContain("animate-in")
  })

  it("hides the answer again when moving to another card", async () => {
    const { screen } = await renderSession()
    await screen.getByRole("button", { name: /Click to reveal answer/ }).click()
    await screen.getByRole("button", { name: "Next" }).click()

    await expect
      .element(screen.getByText("Click to reveal answer"))
      .toBeVisible()
  })

  it("shows progress, and marks a 5/5 card as mastered with 'I Know This' disabled", async () => {
    const { screen } = await renderSession({ cards: [deck[1]!, deck[2]!] })
    await expect
      .element(screen.getByRole("progressbar", { name: "Progress: 2 of 5" }))
      .toBeVisible()

    await screen.getByRole("button", { name: "Next" }).click()

    await expect
      .element(screen.getByText("Mastered", { exact: true }))
      .toBeVisible()
    await expect.element(screen.getByText("5/5")).toBeVisible()
    await expect
      .element(screen.getByRole("button", { name: "Already Mastered" }))
      .toBeDisabled()
  })

  it("keeps the same slot when the current card drops out of the list", async () => {
    const { screen } = await renderSession()
    await screen.getByRole("button", { name: "Next" }).click()

    // e.g. the card was just mastered while "Hide Mastered" is on
    await screen.rerender(
      <StudySession
        cards={[deck[0]!, deck[2]!]}
        emptyReason="no-cards"
        onProgress={vi.fn()}
      />
    )

    await expect
      .element(screen.getByText("Who wrote 'Romeo and Juliet'?"))
      .toBeVisible()
    await expect.element(screen.getByText("Card 2 of 2")).toBeVisible()
  })

  it("shows the question of a card that slides into the slot of a revealed one", async () => {
    const { screen } = await renderSession()
    await screen.getByRole("button", { name: /Click to reveal answer/ }).click()

    // e.g. "I Know This" mastered the card while "Hide Mastered" is on
    await screen.rerender(
      <StudySession
        cards={deck.slice(1)}
        emptyReason="no-cards"
        onProgress={vi.fn()}
      />
    )

    await expect
      .element(screen.getByText("What is the capital of France?"))
      .toBeVisible()
    await expect
      .element(screen.getByText("Click to reveal answer"))
      .toBeVisible()
  })

  it.each([
    ["no-cards", "No cards to study"],
    ["all-mastered", "You’re all caught up!"],
    ["no-matches", "No cards match these filters"],
  ] as const)("explains an empty %s session", async (reason, title) => {
    const { screen } = await renderSession({
      cards: [],
      emptyReason: reason,
      emptyAction: <a href="/cards">Go to All Cards</a>,
    })

    await expect.element(screen.getByText(title)).toBeVisible()
    if (reason === "no-cards") {
      await expect
        .element(screen.getByRole("link", { name: "Go to All Cards" }))
        .toBeVisible()
    }
  })
})
