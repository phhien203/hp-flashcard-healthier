import { expect } from "storybook/test"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Icon } from "@workspace/ui/icons"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Components/Form fields",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FieldGroup className="w-[min(600px,90vw)] gap-4">
      <Field>
        <FieldLabel htmlFor="q">Question</FieldLabel>
        <Input id="q" placeholder="e.g., What is the capital of France?" />
      </Field>
      <Field>
        <FieldLabel htmlFor="a">Answer</FieldLabel>
        <Textarea id="a" placeholder="e.g., Paris" />
      </Field>
    </FieldGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const question = canvas.getByLabelText("Question")
    await userEvent.type(question, "What does CSS stand for?")
    await expect(question).toHaveValue("What does CSS stand for?")
  },
}

export const Invalid: Story = {
  render: () => (
    // Errors only ever appear inside the white "Create card" panel.
    <div className="rounded-xl bg-card p-6">
      <Field data-invalid className="w-[min(600px,90vw)]">
        <FieldLabel htmlFor="c">Category</FieldLabel>
        <Input
          id="c"
          placeholder="e.g., Geography"
          aria-invalid
          aria-describedby="c-error"
        />
        <FieldError id="c-error">
          <Icon name="error" className="size-3.5" />
          Please enter a category.
        </FieldError>
      </Field>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Category")).toHaveAccessibleDescription(
      "Please enter a category."
    )
  },
}
