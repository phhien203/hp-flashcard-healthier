import { defineConfig } from "vitest/config"

/**
 * One Vitest run for the whole workspace. Node projects cover the domain and
 * database packages; browser projects (Playwright + Chromium) cover the design
 * system, every Storybook story and the web app's feature components.
 */
export default defineConfig({
  test: {
    projects: [
      "packages/core",
      "packages/db",
      "packages/ui/vitest.config.ts",
      "packages/ui/vitest.storybook.config.ts",
      "apps/web",
    ],
  },
})
