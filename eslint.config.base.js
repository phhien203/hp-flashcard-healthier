//  @ts-check

/**
 * Workspace rules layered on top of `@tanstack/eslint-config` by every
 * package's `eslint.config.js`: `[...tanstackConfig, ...workspaceConfig]`.
 *
 * Kept free of imports so it resolves from any package without a root install.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const workspaceConfig = [
  {
    rules: {
      "import/no-cycle": "off",
      "import/consistent-type-specifier-style": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",

      // Import order, autofixed by `eslint --fix` (lint-staged runs it on commit):
      // React, packages, @workspace/*, @/ aliases, relative files, then `import type`.
      // `named` sorts the names inside `{ … }`, so `sort-imports` stays off.
      "sort-imports": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "type",
          ],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "@workspace/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          named: true,
        },
      ],
    },
  },
  {
    ignores: [
      "eslint.config.js",
      "dist/**",
      "storybook-static/**",
      "src/routeTree.gen.ts",
      "worker-configuration.d.ts",
    ],
  },
]
