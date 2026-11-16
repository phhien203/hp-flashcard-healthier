import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"

const meta = {
  title: "Components/Empty",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const NoCardsToStudy: Story = {
  render: () => (
    <Empty className="rounded-xl bg-card">
      <EmptyHeader>
        <EmptyTitle>No cards to study</EmptyTitle>
        <EmptyDescription>
          You don’t have any cards yet. Add your first card in the All Cards
          tab.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="raised">Go to All Cards</Button>
      </EmptyContent>
    </Empty>
  ),
}
