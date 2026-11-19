import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"

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
  // Pre-bundle the deps Vite otherwise discovers mid-run. A cold cache then
  // reloads the browser and fails the first test:browser pass.
  optimizeDeps: {
    include: ["class-variance-authority", "radix-ui"],
  },
  // Fonts and other assets live in the workspace's pnpm store, outside this package.
  server: { fs: { allow: ["../.."] } },
  resolve: {
    // Web feature stories resolve "@/" through apps/web/tsconfig.json.
    tsconfigPaths: true,
    alias: {
      "@workspace/ui": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}
