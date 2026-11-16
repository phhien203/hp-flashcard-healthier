# Flashcard monorepo: agent notes

Conventions and gotchas that the code and config don't spell out. Scripts live in the root `package.json`; layout and setup live in `README.md`. Follow `CODING_STANDARDS.md` (rebase-only history, `@` alias imports, `React.` namespace).

## Import aliases

- `apps/web` maps `@/*` to `src/*` (tsconfig `paths`, resolved by Vite's `resolve.tsconfigPaths`). Storybook and the `ui`/`storybook` Vitest projects enable `tsconfigPaths` too, so web feature stories resolve `@/` through `apps/web/tsconfig.json`.
- `packages/ui` imports itself as `@workspace/ui/*`. Same-directory imports stay relative (`./card-form`); anything that would need `../` uses an alias. `routeTree.gen.ts` is generated and keeps its relative paths.

## Boundaries

- `packages/core` owns every flashcard rule (mastery threshold, stats, filtering, seeded shuffle, empty-state reason, card validation). The UI and the server import these rules and never re-derive them.
  - The one exception is `recordProgress` in `packages/db`. It mirrors `applyProgress` in SQL (`min(known_count + 1, 5)`) so concurrent presses stay atomic. The repository tests pin the two together; change both at once.
- `packages/db` is the only code that touches SQL. Every repository method takes the Clerk `userId` first and scopes its query by it. Server functions (`apps/web/src/lib/*.functions.ts`) get that id from the `requireUser` middleware, never from client input.
- `packages/ui` holds design-system primitives only (shadcn components restyled to the Figma tokens). Flashcard-specific components live in `apps/web/src/features`.

## Design system

- Tokens are mapped once, in `packages/ui/src/styles/globals.css`: Figma variables → `--fc-*` → shadcn semantic tokens. Use semantic utilities (`bg-primary`, `border-border`) or the `text-preset-*` type scale. Raw hex values live only there and in `src/lib/tokens.ts`, which serves consumers that can't read CSS variables (Clerk's `appearance`, the `theme-color` meta tag). `tokens.test.ts` fails if the two drift apart.
- When you add a custom utility that shares a Tailwind prefix (`text-*`, `shadow-*`), register it in `extendTailwindMerge` in `packages/ui/src/lib/utils.ts`. Otherwise `cn()` silently drops it when it meets a conflicting class.
- Icons are the Figma SVG exports in `packages/ui/src/assets/icons`, rendered through `<Icon name=…>`. To add one, export it from Figma into that folder and register it in `src/icons/index.tsx` with its intrinsic size.

## TanStack Start conventions

Follows `.agents/skills/tanstack-start-best-practices`, adapted to the installed Start version:

- File suffixes in `apps/web/src/lib`: `*.functions.ts` holds `createServerFn` wrappers and function middleware (safe to import anywhere; the client gets RPC stubs), `*.server.ts` holds server-only code wrapped in `createServerOnlyFn`, `*.schema.ts` holds Zod schemas shared by server-function validators, mutation hooks and routes. Routes and components never import `*.server.ts`.
- Validate every server-function input with a schema. This Start version names the method `.validator()`; the skill's `.inputValidator()` does not exist here.
- Throw `notFound()` for a missing card and `redirect()` for a missing session, never a raw `Response`. `useServerFn` follows the redirect and then resolves to `undefined`, which is why mutation results are typed `Card | undefined`.
- The global function middleware in `src/start.ts` logs unexpected server-function errors and, in production, replaces them with a generic message.

## Data and state

- Deck filters (`categories`, `hideMastered`, `shuffle`) live in the URL search params on the `/_app` layout route and are retained across Study Mode and All Cards. Component state is for UI only (current card, revealed side, dialogs).
- Shuffle order is `selectCards(cards, { shuffleSeed })`, a pure function of the seed and the card ids. Marking or deleting a card never reshuffles the rest.
- D1 allows at most 100 bound parameters per statement, so batch multi-row inserts (see `ROWS_PER_INSERT`).
- Schema changes: edit `packages/db/src/schema.ts`, run `pnpm db:generate`, and commit the SQL in `packages/db/migrations`. Wrangler applies that folder.

## Testing

- Storybook lives in `packages/ui`. It also loads `apps/web/src/features/**/*.stories.tsx`, so feature components get stories next to their code, rendered with fixture data. Those components take props and callbacks, not router or query hooks.
- Node projects (`core`, `db`) run anywhere. The `db` tests run the real migrations against SQLite, so a broken migration fails there.
- Browser projects (`ui`, `storybook`, `web`) need Playwright's Chromium: `pnpm --filter @workspace/ui exec playwright install chromium`. Every Storybook story is also a test, and an axe violation fails it.
- Run a single project with `pnpm vitest run --project <name>`.
- The test setup preloads Poppins. Without it, a machine with no system fonts renders blank text and every "visible" assertion fails.

## Commands with a twist

- `apps/web/worker-configuration.d.ts` (the `env` bindings and the `cloudflare:workers` module types) is generated and gitignored. `pnpm install` creates it; after editing `wrangler.jsonc`, rerun `pnpm --filter web cf-typegen`.

- `deploy` collides with pnpm's built-in `pnpm deploy`, so call it as `pnpm --filter web run deploy`.
