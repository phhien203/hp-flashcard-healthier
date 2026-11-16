import { describe, expect, it, vi } from "vitest"
import { render } from "vitest-browser-react"

import { CardForm } from "./card-form"

describe("CardForm", () => {
  it("explains every missing field after a blank submit, using the copy from the design", async () => {
    const onSubmit = vi.fn()
    const screen = await render(
      <CardForm submitLabel="Create Card" onSubmit={onSubmit} />
    )

    await screen.getByRole("button", { name: "Create Card" }).click()

    await expect
      .element(screen.getByText("Please enter a question."))
      .toBeVisible()
    await expect
      .element(screen.getByText("Please enter an answer."))
      .toBeVisible()
    await expect
      .element(screen.getByText("Please enter a category."))
      .toBeVisible()
    await expect
      .element(screen.getByLabelText("Question"))
      .toHaveAttribute("aria-invalid", "true")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("clears an error as soon as the field is fixed", async () => {
    const screen = await render(
      <CardForm submitLabel="Create Card" onSubmit={vi.fn()} />
    )
    await screen.getByRole("button", { name: "Create Card" }).click()

    await screen.getByLabelText("Question").fill("What is 2 + 2?")

    await expect
      .element(screen.getByText("Please enter a question."))
      .not.toBeInTheDocument()
    await expect
      .element(screen.getByText("Please enter an answer."))
      .toBeVisible()
  })

  it("submits trimmed values and clears the form when asked to", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const screen = await render(
      <CardForm submitLabel="Create Card" onSubmit={onSubmit} resetOnSuccess />
    )

    await screen
      .getByLabelText("Question")
      .fill("  What is the capital of France? ")
    await screen.getByLabelText("Answer").fill("Paris")
    await screen.getByLabelText("Category").fill(" Geography")
    await screen.getByRole("button", { name: "Create Card" }).click()

    await vi.waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        question: "What is the capital of France?",
        answer: "Paris",
        category: "Geography",
      })
    )
    await expect.element(screen.getByLabelText("Question")).toHaveValue("")
  })

  it("keeps what was typed when saving fails", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("offline"))
    const screen = await render(
      <CardForm
        submitLabel="Update Card"
        defaultValues={{ question: "Q", answer: "A", category: "C" }}
        onSubmit={onSubmit}
        resetOnSuccess
      />
    )

    await screen.getByLabelText("Answer").fill("A new answer")
    await screen.getByRole("button", { name: "Update Card" }).click()

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await expect
      .element(screen.getByLabelText("Answer"))
      .toHaveValue("A new answer")
  })
})
