import { expect } from "storybook/test"

import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Components/Theme switcher",
  component: ThemeSwitcher,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ThemeSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const System: Story = {
  parameters: { themeManaged: true },
  render: () => (
    <ThemeProvider preference="system" resolved="light">
      <ThemeSwitcher />
    </ThemeProvider>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole("radiogroup", { name: "Theme" })
    ).toBeVisible()
    const dark = canvas.getByRole("radio", { name: "Dark" })
    await userEvent.click(dark)
    await expect(dark).toBeChecked()
    await expect(document.documentElement).toHaveClass("dark")
    dark.focus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("radio", { name: "System" })).toBeChecked()
  },
}

export const OnDark: Story = {
  globals: { theme: "dark" },
  parameters: { themeManaged: false },
  render: () => (
    <ThemeProvider preference="dark" resolved="dark">
      <ThemeSwitcher />
    </ThemeProvider>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: "Dark" })).toBeChecked()
    await expect(document.documentElement).toHaveClass("dark")
  },
}
