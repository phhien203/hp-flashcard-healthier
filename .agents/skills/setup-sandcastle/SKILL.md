---
name: setup-sandcastle
description: Set up Matt Pocock's Sandcastle agent automation in a repository. Use when bootstrapping a new repository with Sandcastle, installing @ai-hero/sandcastle with noSandbox, copying or updating upstream agent GitHub Actions, or adding initialization for their required issue labels.
---

# Set up Sandcastle

Install working agent automation, not just workflow YAML. Use
`mattpocock/sandcastle` as the upstream source. Copy only `agent-*.yml` from
`.github/workflows`; leave the target's CI, release, and other workflows intact.

## 1. Inspect the target

Read repository instructions, git status, manifests, lockfiles, workspace config,
runtime version files, and existing Actions. Establish:

- Package manager and version, dependency/workspace root, and Node version.
- Actual build, typecheck, and test commands, including necessary workspace filters.
- Default branch and any rebase-only policy.
- Existing `.sandcastle` files and workflow filename collisions.

Use `packageManager`, lockfiles, and existing CI as evidence. Ask if they conflict.
For a pnpm workspace, install tooling at the workspace root (`pnpm add -Dw`).
For a nested application, identify its install directory separately from the
repository-root workflow and `.sandcastle` paths.

## 2. Resolve upstream and copy the dependency closure

Resolve upstream's default branch to one commit SHA. Read and copy all source
files from that SHA, recording the SHA and installed package version in the
target's setup documentation. A temporary shallow clone is fine.

Inspect every upstream `agent-*.yml` and its referenced local scripts, prompts,
extraction templates, shared modules, actions, and assets. Copy that dependency
closure into the target, preserving useful relative paths. Currently the scripts
live under `.sandcastle/agent-workflows`. Follow imports and filesystem reads;
copying YAML alone leaves unusable workflows. Include upstream license attribution
for copied code. Avoid unrelated upstream configuration and secrets.

On a filename collision, inspect the target and preserve its customizations.
Ask before replacing differing user-owned content. On reruns, update only the
managed files, not entire directories.

Install published `@ai-hero/sandcastle` and `tsx` as dev dependencies using the
target's package manager, updating its existing lockfile. Add any other direct
dependencies required by copied imports (including type-only imports). Compare
the installed package's exports/types with the copied code: upstream main can
be ahead of npm. Resolve mismatches explicitly, rather than leaving broken imports
or silently using an unpublished Git dependency.

Upstream uses its own source build; the target consumes the published package.
Replace upstream self-imports/source paths with supported package exports when
needed. Remove a workflow's upstream-library build step if the target doesn't
need it; retain a real target build only when required. Do not invent scripts.

## 3. Adapt every executable path

Use the target's established Actions versions and runtime setup where compatible.
For each job, including secondary jobs such as explore's apply job:

- Set up the detected package manager before installation or setup-node caching.
  Use its pinned version. For pnpm, `pnpm/action-setup` precedes setup-node's
  pnpm cache. Match Node to the target's version file/engines/existing CI, while
  satisfying Sandcastle, tsx, and copied-code runtime requirements. Report conflicts.
- Set cache dependency paths to actual lockfiles. Use deterministic installs:
  `npm ci`, `pnpm install --frozen-lockfile`, modern Yarn `--immutable`
  (classic Yarn `--frozen-lockfile`), or Bun `--frozen-lockfile`.
  Install dev dependencies, since the workflows run development tooling.
- Preserve existing step `if` conditions on inserted setup steps. Keep installs
  at the dependency root. Adapt runner commands to locally installed tsx
  (`pnpm exec tsx`, `npm exec -- tsx`, etc.); avoid accidental registry downloads.
  Resolve repository-root script paths correctly when the install root is nested.
- Adapt prompt-embedded build/typecheck/test commands and references to optional
  upstream docs (e.g. `GLOSSARY.md`). Use only commands and documents that exist.
- Adapt literal `main` branch references to the target's default branch while
  preserving dynamic PR base/head refs, fork restrictions, and checkout depth.

### PR creation and workflow handoffs

Trace the effective credential for each checkout, push, PR creation, and label
handoff. Checkout's token does not change `gh`'s `GH_TOKEN`. For PR creation,
set step-level `GH_TOKEN: ${{ secrets.AGENT_PAT || secrets.GITHUB_TOKEN }}` so
the available PAT is actually used, rather than inherited `GITHUB_TOKEN`.
Keep job-level Contents, Issues, and Pull requests permissions scoped to need.

When falling back to `GITHUB_TOKEN`, document the separate repository setting
**Settings → Actions → General → Workflow permissions → Allow GitHub Actions to
create and approve pull requests**. YAML `pull-requests: write` alone does not
enable PR creation. If read-only target access is authorized, inspect
`gh api repos/OWNER/REPO/actions/permissions/workflow`; otherwise leave an explicit
manual prerequisite. Do not change settings or request secret values.

Use `set -euo pipefail` in PR-creation shell blocks. Capture `gh pr create`
directly, without a pipeline that can hide failure, and validate a positive PR
number before writing step outputs. A failed or empty result must fail that step
and prevent the review handoff. Test the actual workflow shell with mocked `gh`:
permission denial, empty/malformed output, and success. Assert failure writes no
PR-number output; inspect the YAML token expression separately.

Configure every agent run with:

```ts
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox";

// In the run/createSandbox options:
sandbox: noSandbox(),
```

Verify the export against the installed version. Preserve existing upstream
`noSandbox()` calls; a generic unrelated config file does not configure those
entrypoints. Do not add Docker or cloud sandbox setup.

Respect the target's git policy in copied scripts AND prompts. For rebase-only
repositories, upstream's update-branch merge implementation requires a real
rebase adaptation: handle repeated conflicts with `git rebase --continue`,
check that no rebase remains in progress, and preserve the expected remote head
for an explicit force-with-lease push. Merely renaming merge commands is not enough.
Use normal pushes for new branches; rewritten history uses `--force-with-lease`,
never bare `--force`.

## 4. Expose label initialization

Derive the required labels from all copied workflows AND their supporting scripts,
including trigger, transition, outcome, and dynamically mapped verdict labels.
Do not copy every upstream issue label or assume all labels start with `agent:`.
For example, explore has used the non-prefixed `ready-for-human` outcome label.

Create `.github/sandcastle-labels.json` as an array of objects with `name`, `color`
(six hex digits), and `description`. Where available, reuse upstream metadata for
these required names; otherwise supply clear metadata and report that choice.

Copy `assets/init-labels.mjs` from this skill to `scripts/sandcastle-labels.mjs`.
The helper uses only Node and authenticated `gh`, creates missing labels, and
preserves existing labels and their metadata. Expose a root developer command,
for example `"sandcastle:labels": "node scripts/sandcastle-labels.mjs"`.
If that script name already exists, preserve it and choose an unambiguous name.
For nested dependency roots, adapt the command/path without changing manifest lookup.

Document the developer commands (using the target's package manager):

```sh
node scripts/sandcastle-labels.mjs --dry-run
node scripts/sandcastle-labels.mjs --repo OWNER/REPO
```

Provide the initializer; do not run label creation remotely unless separately
requested. Dry-run is read-only and requires neither credentials nor network access.

## 5. Validate and hand off

Before declaring setup complete:

- Confirm the workflow filename set matches upstream `agent-*.yml` exactly,
  accounting for any collisions explicitly resolved with the user.
- Validate YAML/Actions expressions with available tooling (prefer actionlint).
  Check every referenced script, import, prompt, lockfile, working directory,
  command, and branch, and ensure every runner job has its own required setup.
- Verify published imports/types and local tsx resolution without invoking an
  agent. Run focused tests/type checks where feasible; report unavailable checks.
- Verify PR-creation credentials and run the mocked failure/success checks from
  “PR creation and workflow handoffs”; no remote PR or paid run is needed.
- Dry-run the labels helper and test its idempotence with a mocked `gh`, not
  a real remote. Required label names must equal the manifest names.
- Inspect the diff for unrelated overwrites, secrets, bare force pushes,
  merge-policy violations, or stale upstream build/self-import assumptions.

Write short setup documentation with the source SHA, versions, commands,
workflow/label purpose, and remaining manual prerequisites. Explain that
`noSandbox()` executes agent code directly on the host with its credentials
and filesystem access; run only on trusted code and preferably ephemeral runners.
Preserve or strengthen fork guards and event security; never switch to privileged
`pull_request_target` execution of untrusted PR code merely to obtain secrets.
Document actual referenced secrets (currently `CLAUDE_CODE_OAUTH_TOKEN` and optional
`AGENT_PAT`), their permissions, and that labels applied with `GITHUB_TOKEN`
generally do not trigger another workflow. Never request or print secret values.

Summarize changed files, validation results, developer label command, and manual
setup. Stop short of pushing, setting secrets, applying labels, or launching paid
agent runs unless the user explicitly requests those operations.
