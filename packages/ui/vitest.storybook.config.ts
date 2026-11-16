import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import { fileURLToPath } from "node:url"
import { defineProject, mergeConfig } from "vitest/config"
import { browser, shared } from "./vitest.shared.ts"

/** Every story becomes a test: it must render, pass its play function and pass axe. */
export default mergeConfig(
  shared,
  defineProject({
    plugins: [
      storybookTest({
        configDir: fileURLToPath(new URL(".storybook", import.meta.url)),
      }),
    ],
    test: { name: "storybook", browser },
  })
)
