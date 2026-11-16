import type { Preview } from "@storybook/react-vite"
import "../src/styles/globals.css"

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
  parameters: {
    layout: "centered",
    backgrounds: {
      options: {
        page: { name: "Page (neutral/100)", value: "#f7f3f0" },
        card: { name: "Card (neutral/0)", value: "#ffffff" },
      },
    },
    controls: { matchers: { color: /(background|color)$/i } },
    // Fail the Vitest run on accessibility violations.
    a11y: { test: "error" },
  },
  initialGlobals: { backgrounds: { value: "page" } },
}

export default preview
