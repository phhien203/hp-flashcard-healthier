# Flashcard

A full-stack flashcard app built from the [Figma design](https://www.figma.com/design/pZCCWWCPe0epz7wH9f14ee/flashcard-app?node-id=299-771). You sign in, study a deck card by card, mark what you know until each card is mastered (5/5), and manage your cards. Each account gets its own deck, stored in Cloudflare D1.

- **Study Mode**: flip a card to reveal the answer, use "I Know This" and "Reset Progress", move with Previous / Next or ← / →, and see deck statistics.
- **All Cards**: create cards with validation, edit or delete them from each card's menu, and load 12 more at a time.
- **Shared filters**: a multi-select category filter, "Hide Mastered" and a seeded "Shuffle". The filters live in the URL, so they survive reloads and carry over between modes.
- **Responsive layouts** for mobile (375px), tablet (768px) and desktop (1440px), matching the Figma frames, including the hover, focus, empty, error and toast states.

## Stack

| Concern        | Choice                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Monorepo       | pnpm workspaces + Turborepo                                                                              |
| App            | React 19, TanStack Start (SSR + server functions), TanStack Router, TanStack Query, TanStack Form        |
| Hosting        | Cloudflare Workers via `@cloudflare/vite-plugin`, with D1 (SQLite) through Drizzle ORM                   |
| Auth           | Clerk (`@clerk/tanstack-react-start`)                                                                    |
| UI             | shadcn/ui (Radix) + Tailwind CSS v4, themed with the Figma variables                                     |
| Testing        | Vitest: Node projects, plus browser mode on Playwright/Chromium for components and every Storybook story |
| Component docs | Storybook 10 with the a11y and Vitest addons                                                             |

## Layout

```
apps/web                 TanStack Start app (Cloudflare Worker)
  src/routes             file routes: /study, /cards, /sign-in, /sign-up
  src/features           Study Mode, All Cards, deck controls, app shell
  src/lib                *.functions.ts server functions + auth middleware, *.server.ts D1 access,
                         *.schema.ts shared Zod schemas, TanStack Query options and mutations
packages/core            domain rules: mastery, stats, filters, seeded shuffle, validation, starter deck
packages/db              Drizzle schema, migrations, user-scoped card repository
packages/ui              design system: Figma tokens, restyled shadcn components, icons, Storybook
```

## Getting started

Prerequisites: Node 22.12+ (see `.nvmrc`), pnpm 12, and a [Clerk](https://dashboard.clerk.com) application.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env              # VITE_CLERK_PUBLISHABLE_KEY
cp apps/web/.dev.vars.example apps/web/.dev.vars    # CLERK_SECRET_KEY
pnpm db:migrate:local                               # create the local D1 database
pnpm dev                                            # http://localhost:3000
```

On first sign-in, each user gets the 40-card starter deck from the design.

## Scripts

| Command             | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `pnpm dev`          | Run the app on the local Workers runtime with a local D1         |
| `pnpm build`        | Build the Worker and the static Storybook                        |
| `pnpm test`         | Run every Vitest project (unit, DB, browser components, stories) |
| `pnpm test:unit`    | Run only the fast Node projects (`core`, `db`)                   |
| `pnpm test:browser` | Run only the browser projects (`ui`, `storybook`, `web`)         |
| `pnpm storybook`    | Start Storybook at http://localhost:6006                         |
| `pnpm typecheck`    | Type-check every package                                         |
| `pnpm lint`         | Run ESLint in every package                                      |
| `pnpm format`       | Format the repo with Prettier                                    |
| `pnpm db:generate`  | Generate a migration after editing `packages/db/src/schema.ts`   |

The browser test projects need Chromium: run `pnpm --filter @workspace/ui exec playwright install --with-deps chromium` once.

The Husky pre-commit hook runs Prettier on staged files, then the typecheck and the Node tests. CI runs everything, including the browser suites and the build.

## Deploying to Cloudflare

1. Create the database with `pnpm --filter web exec wrangler d1 create flashcard`, and put the printed `database_id` into `apps/web/wrangler.jsonc`.
2. Set the Clerk secret: `pnpm --filter web exec wrangler secret put CLERK_SECRET_KEY`.
3. Apply migrations and deploy:
   ```bash
   pnpm --filter web db:migrate:remote
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_… pnpm deploy
   ```
4. In the Clerk dashboard, add the Worker's domain.

`.github/workflows/deploy.yml` automates steps 3–4 on every push to `main` once you set the repository variable `DEPLOY_ENABLED=true` and the secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and `VITE_CLERK_PUBLISHABLE_KEY`.

## Design decisions

- **Server as source of truth, optimistic UI.** The whole deck loads in one query, prefetched during SSR. "I Know This", "Reset Progress" and Delete update the cache instantly using the same `applyProgress` rule the server runs, and roll back with a toast if the request fails.
- **Per-user isolation.** Every server function goes through the `requireUser` middleware, which reads the Clerk session. The repository scopes every query by that user id, and tests assert that one user can never read or change another user's cards. Server functions are also protected by TanStack Start's CSRF middleware.
- **Validation in one place.** The same Zod schema in `@workspace/core` drives the form errors (copy taken from the design) and the server-function validators.
- **Stable shuffle.** Shuffle stores a seed in the URL. The order is a hash of the seed and each card id, so it stays put while you mark or delete cards.
- **Design deviations:**
  - A Clerk `UserButton` sits next to the mode switch, so users can sign out. Sign-in and sign-up use Clerk's components, themed with the Figma tokens.
  - The study statistics always cover the whole deck, matching the "all caught up" frame.
