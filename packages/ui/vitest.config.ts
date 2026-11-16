import { defineProject, mergeConfig } from "vitest/config"

import { browser, shared } from "./vitest.shared.ts"

/** Component specs for the design system, in Chromium. */
export default mergeConfig(
  shared,
  defineProject({
    test: {
      name: "ui",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: ["./src/test/setup.ts"],
      browser,
    },
  })
)
