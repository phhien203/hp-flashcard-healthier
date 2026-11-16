import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Icon } from "@workspace/ui/icons"

const meta = { title: "Components/Badge & Progress" } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const CategoryTag: Story = {
  render: () => <Badge>Web Development</Badge>,
}

export const MasteredChip: Story = {
  render: () => (
    <Badge variant="success">
      <Icon name="brain-solid" className="size-3" />
      Mastered 5/5
    </Badge>
  ),
}

export const ProgressSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3, 4].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <Progress value={n} max={5} aria-label={`Progress ${n} of 5`} />
          <span className="text-preset-6">{n}/5</span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("progressbar", { name: "Progress 2 of 5" })
    await expect(bar).toHaveAttribute("aria-valuenow", "2")
  },
}
