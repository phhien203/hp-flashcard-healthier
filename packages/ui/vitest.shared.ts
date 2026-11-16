import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { fileURLToPath } from "node:url"
import type { ViteUserConfig } from "vitest/config"

/** Real headless Chromium via Playwright for every browser-mode project. */
export const browser = {
  enabled: true,
  headless: true,
  provider: playwright(),
  instances: [{ browser: "chromium" as const }],
}

export const shared: ViteUserConfig = {
  plugins: [react(), tailwindcss()],
  // Fonts and other assets live in the workspace's pnpm store, outside this package.
  server: { fs: { allow: ["../.."] } },
  resolve: {
    alias: {
      "@workspace/ui": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}
