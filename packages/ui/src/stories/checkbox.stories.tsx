import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="hide" {...args} />
      <Label htmlFor="hide">Hide Mastered</Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Unchecked: Story = {
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole("checkbox", { name: "Hide Mastered" })
    await expect(box).not.toBeChecked()
    await userEvent.click(canvas.getByText("Hide Mastered"))
    await expect(box).toBeChecked()
  },
}

export const Checked: Story = { args: { defaultChecked: true } }
