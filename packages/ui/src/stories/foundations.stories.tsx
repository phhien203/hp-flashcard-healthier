import { Icon, iconNames } from "@workspace/ui/icons"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Foundations",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const COLORS = [
  ["neutral/0", "bg-neutral-0"],
  ["neutral/100", "bg-neutral-100"],
  ["neutral/600", "bg-neutral-600"],
  ["neutral/900", "bg-neutral-900"],
  ["yellow/500 · primary", "bg-yellow-500"],
  ["blue/400", "bg-blue-400"],
  ["blue/600 · ring", "bg-blue-600"],
  ["teal/400", "bg-teal-400"],
  ["pink/400", "bg-pink-400"],
  ["pink/500", "bg-pink-500"],
  ["pink/700 · destructive", "bg-pink-700"],
] as const

export const Colors: Story = {
  render: () => (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
      {COLORS.map(([name, className]) => (
        <li
          key={name}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className={`h-16 border-b border-border ${className}`} />
          <p className="p-3 text-preset-5">{name}</p>
        </li>
      ))}
    </ul>
  ),
}

const TYPE = [
  ["text-preset-1", "Bold 40/120%"],
  ["text-preset-2", "SemiBold 24/120%"],
  ["text-preset-3", "SemiBold 20/120%"],
  ["text-preset-4", "Medium 16/120%"],
  ["text-preset-4-regular", "Regular 16/140%"],
  ["text-preset-5", "Medium 14/140%"],
  ["text-preset-6", "Medium 12/130%, -0.36px"],
] as const

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {TYPE.map(([className, spec]) => (
        <div key={className} className="flex items-baseline gap-6">
          <code className="w-48 shrink-0 text-preset-6 text-muted-foreground">
            {className}
          </code>
          <p className={className}>What does HTML stand for? · {spec}</p>
        </div>
      ))}
    </div>
  ),
}

export const Icons: Story = {
  render: () => (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
      {iconNames
        .filter((name) => name !== "pattern")
        .map((name) => (
          <li
            key={name}
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <Icon name={name} />
            <code className="text-preset-6">{name}</code>
          </li>
        ))}
    </ul>
  ),
}
