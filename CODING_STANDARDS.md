# Coding standards

- **Always rebase, never merge.** Integrate upstream changes with `git pull --rebase` (or `git rebase origin/main`), never with a merge commit, so history stays linear. To make plain `git pull` rebase by default, run `git config pull.rebase true` in your clone.
- Use alias import with prefix `@` as much as possible, if the file is in the same directory, use relative import.
- Always import React as `import React from 'react'` and use React namespace for everything inside React, for example React.useState, React.useEffect
- Keep imports sorted. ESLint's `import/order` (configured in `eslint.config.base.js`) enforces the order, and lint-staged autofixes it on commit: React first, then packages, `@workspace/*`, `@/` aliases, relative files and `import type`, with a blank line between groups and names sorted alphabetically within each group. Run `pnpm lint` to check, or `pnpm exec eslint --fix .` inside a package to fix.
