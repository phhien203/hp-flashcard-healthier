import { expect, fn } from "storybook/test"

import { Button } from "@workspace/ui/components/button"
import { Icon } from "@workspace/ui/icons"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "I Know This", onClick: fn() },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "raised", "outline", "ghost"],
    },
    size: {
      control: "inline-radio",
      options: ["default", "lg", "sm", "icon", "icon-sm"],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    size: "lg",
    children: (
      <>
        <Icon name="check-circle" />I Know This
      </>
    ),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "I Know This" }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const Raised: Story = {
  args: {
    variant: "raised",
    size: "lg",
    children: (
      <>
        <Icon name="undo" />
        Reset Progress
      </>
    ),
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: (
      <>
        <Icon name="shuffle" />
        Shuffle
      </>
    ),
  },
}

export const IconOnly: Story = {
  args: {
    variant: "ghost",
    size: "icon-sm",
    "aria-label": "Card actions",
    children: <Icon name="dots" />,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    size: "lg",
    children: (
      <>
        <Icon name="check-circle" />
        Already Mastered
      </>
    ),
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Already Mastered" })
    await expect(button).toBeDisabled()
    await expect(getComputedStyle(button).pointerEvents).toBe("none")
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="lg">
        <Icon name="circle-plus" />
        Create Card
      </Button>
      <Button variant="raised">Load More</Button>
      <Button variant="outline">
        <Icon name="angle-left" />
        Previous
      </Button>
      <Button variant="outline">
        Next
        <Icon name="angle-right" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Next card">
        <Icon name="angle-right" />
      </Button>
    </div>
  ),
}

export const PrimaryDark: Story = { ...Primary, globals: { theme: "dark" } }
export const RaisedDark: Story = { ...Raised, globals: { theme: "dark" } }
export const OutlineDark: Story = { ...Outline, globals: { theme: "dark" } }
export const AllVariantsDark: Story = {
  ...AllVariants,
  globals: { theme: "dark" },
}
