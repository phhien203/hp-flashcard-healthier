# Skill checks

Run the bundled label-helper tests without installing dependencies:

```sh
node --test .agents/skills/setup-sandcastle/evals/init-labels.test.mjs
```

The tests copy the helper into disposable directories and put a mock `gh` on
`PATH`. They check offline dry-run, pagination, existing metadata preservation,
case-insensitive label matching, repeat execution, invalid inputs, repository
inference, and error propagation. They never contact GitHub.

## Integration evaluation fixtures

Use `evals.json` for the task prompts and expected outcomes. Create these
disposable fixtures separately for each with-skill and without-skill run:

1. **npm-single-package:** private ESM npm package; `.nvmrc` is `22`; TypeScript
   dev dependency, minimal `index.ts` and `tsconfig.json`; `typecheck` runs
   `tsc --noEmit`; `test` runs `node --test`; no build script. Git default branch
   is `trunk`. Add valid CI and release workflows with sentinel comments and
   save their original bytes.
2. **pnpm-workspace-rebase:** private ESM workspace root with
   `packageManager: pnpm@10.11.0`; `.nvmrc` is `22`; workspace globs `apps/*`
   and `packages/*`. A minimal TypeScript app in `apps/web`, named `web`, has
   build/typecheck scripts using tsc. Root `typecheck` runs
   `pnpm --filter web typecheck`; root `test` runs `node --test`; no root build
   script. Git default branch is `develop`. `AGENTS.md` requires rebase-only
   history and lease-protected rewritten pushes. Save CI/release sentinel bytes.

Generate a real lockfile in each fixture. Resolve one upstream snapshot for all
runs so changes to upstream don't confound the comparison. Allow package
installation and read-only upstream access, but prohibit target remote mutation,
secret changes, pushes, and agent execution.

For both fixtures, include a PR-creation step inheriting job-level `GITHUB_TOKEN`
and piping `gh pr create` to `tail -n1` without `pipefail`. Assume `AGENT_PAT`
is available but the repository create-PR setting is disabled. Check that setup
corrects the effective PR-creation token, documents the fallback prerequisite,
and tests the shell offline with denied, empty, malformed, and successful `gh`
responses. Failed creation must not publish a PR-number output.
The target repository's regression example runs with:

```sh
node --test .sandcastle/tests/open-pr.test.mjs
```

Keep generated repositories and `node_modules` outside the skill. Each run
should produce a review summary, its changed files, validation evidence, and
honest timing data. Grade the expectations in `evals.json` against files and
executable checks, not just the run's self-report. Generate the skill-creator
review viewer for human feedback before revising the draft.
