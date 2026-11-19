import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineProject } from "vitest/config"

/** Feature components of the web app, rendered in headless Chromium. */
export default defineProject({
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  // Pre-bundle the deps Vite otherwise discovers mid-run and reloads on.
  optimizeDeps: {
    include: ["@clerk/tanstack-react-start", "@tanstack/react-router"],
  },
  // Fonts and other assets live in the workspace's pnpm store, outside this package.
  server: { fs: { allow: ["../.."] } },
  test: {
    name: "web",
    include: ["src/**/*.test.tsx"],
    setupFiles: ["./src/test/setup.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
})
