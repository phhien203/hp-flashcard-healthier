import type { StorybookConfig } from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  // Design-system stories plus the web app's feature components (rendered with fixture data).
  stories: [
    "../src/**/*.stories.@(ts|tsx)",
    "../../../apps/web/src/features/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  core: { disableTelemetry: true },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()]
    return viteConfig
  },
}

export default config
