import React from "react"

import type { Decorator, Preview } from "@storybook/react-vite"
import "@workspace/ui/styles/globals.css"

function ThemeFrame({
  theme,
  managed,
  children,
}: {
  theme: "light" | "dark"
  managed: boolean
  children: React.ReactNode
}) {
  React.useLayoutEffect(() => {
    const root = document.documentElement
    const body = document.body
    body.classList.add("bg-background", "text-foreground")
    if (!managed) {
      root.classList.toggle("dark", theme === "dark")
      root.style.colorScheme = theme
    }
    return () => {
      body.classList.remove("bg-background", "text-foreground")
      if (!managed) {
        root.classList.remove("dark")
        root.style.colorScheme = ""
      }
    }
  }, [managed, theme])

  return children
}

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === "dark" ? "dark" : "light"
  const managed = context.parameters.themeManaged === true
  return (
    <ThemeFrame theme={theme} managed={managed}>
      <Story />
    </ThemeFrame>
  )
}

const preview: Preview = {
  // Wait for Poppins so stories render with real metrics and axe's contrast
  // checks see actual text, even on machines without system fonts.
  loaders: [
    async () => {
      await Promise.all(
        [400, 500, 600, 700].map((weight) =>
          document.fonts.load(`${weight} 16px Poppins`)
        )
      )
      return {}
    },
  ],
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [withTheme],
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i } },
    // Fail the Vitest run on accessibility violations.
    a11y: { test: "error" },
  },
}

export default preview
