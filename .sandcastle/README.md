# Sandcastle agent automation

Vendored from [mattpocock/sandcastle](https://github.com/mattpocock/sandcastle),
default branch `main`, commit `1b380ca5e7a9fbece96c49d9edba264c1f512c4e`.
The five `agent-*.yml` workflows and their complete `agent-workflows/` dependency
closure are managed copies; retain local adaptations when updating. Copied code
is MIT-licensed; see `LICENSE.upstream`.

Installed published versions: `@ai-hero/sandcastle` **0.14.0**, `tsx` **4.23.15**,
`@standard-schema/spec` **1.1.0**, and Node types **22.20.5**.
Published imports/types match this snapshot; no source build or Git dependency is
needed. Jobs use Node **24** from `.nvmrc`, pnpm **12.18.0** from `packageManager`,
root `pnpm-lock.yaml`, and `pnpm install --frozen-lockfile`.
Claude Code CLI is installed separately by the workflows, as upstream does.

## Workflows and labels

| Label                 | Purpose                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent:explore`       | Triage **all** open explore-labelled issues as a batch; duplicates can be closed. Manual dispatch defaults to dry-run (still runs the paid agent). |
| `agent:implement`     | Implement a standalone issue into a new draft PR, or address feedback on an existing same-repo PR.                                                 |
| `agent:review`        | Review and potentially improve a same-repo PR.                                                                                                     |
| `agent:update-branch` | Rebase a same-repo PR onto its dynamic base, including repeated conflicts.                                                                         |
| `agent:in-progress`   | Temporary running status.                                                                                                                          |
| `agent:blocked`       | Failure or external blocker; inspect the run/comment before retrying.                                                                              |
| `ready-for-human`     | Explore outcome requiring a human decision.                                                                                                        |

Explore's deterministic apply job validates the plan independently of the agent
job. Verdicts map to `agent:implement`, `ready-for-human`, or `agent:blocked`.
Label colors/descriptions reuse upstream's live metadata at setup time, except
`agent:update-branch`'s previously empty description now explains the rebase.

All entrypoints use `sandbox: noSandbox()`. **This runs agent code directly on
the host with its credentials and filesystem access, not inside an isolation
boundary.** Only run on trusted code, preferably GitHub-hosted ephemeral runners.
Treat issues and PR comments as untrusted data. Review code before labelling.
PR jobs reject forks. Update-branch retains upstream's `pull_request_target`
event (needed for conflicted PRs), guarded to open, same-repository PRs only;
never relax it to execute untrusted fork code with secrets.

Rebase-only policy applies to scripts and prompts. Update-branch checks no
rebase/conflicts/dirty files remain, the base is an ancestor, and no new merge
commits exist. PR pushes use an explicit `--force-with-lease` against the event's
head SHA; new issue branches use a normal push.

## Developer commands

```sh
pnpm sandcastle:labels --dry-run
pnpm sandcastle:labels --repo phhien203/hp-flashcard-healthier
pnpm sandcastle:typecheck
pnpm sandcastle:test
```

Equivalent direct label commands:

```sh
node scripts/sandcastle-labels.mjs --dry-run
node scripts/sandcastle-labels.mjs --repo OWNER/REPO
```

Dry-run is offline and needs no credentials. Real initialization requires Node
and authenticated `gh` with issue-label write access. It creates only missing
labels from `.github/sandcastle-labels.json`, preserving existing metadata.
Tests use mocked `gh` and temporary local Git repositories, never paid agents.

Target checks are `pnpm typecheck`, `pnpm test:unit`, and `pnpm test:browser`.
Browser tests require
`pnpm --filter @workspace/ui exec playwright install --with-deps chromium`.
Build app and Storybook with
`VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k pnpm build`.
No application build is required just to execute these published-package scripts.

## Manual activation

1. Review and commit these files; workflows become available after landing on
   `main`. Nothing in setup pushes, initializes remote labels, or runs agents.
2. Set repository Actions secret `CLAUDE_CODE_OAUTH_TOKEN` to a valid Claude Code
   OAuth credential with available usage/billing. Never put it in source or logs.
3. Optionally set `AGENT_PAT` for automatic workflow handoffs. Use a
   repository-scoped fine-grained PAT with Contents, Issues, and Pull requests
   read/write (or classic `repo` where required). Its owner must have repository
   access. If agents must modify workflow files, separately review the necessary
   workflow-edit permission; do not broaden permissions unnecessarily.
4. Allow Actions. If PR creation falls back to `GITHUB_TOKEN`, enable
   **Settings → Actions → General → Workflow permissions → Allow GitHub Actions
   to create and approve pull requests**. YAML write permissions alone do not
   enable this. Inspect it read-only with
   `gh api repos/phhien203/hp-flashcard-healthier/actions/permissions/workflow`.
   Job `GITHUB_TOKEN` permissions are declared in YAML: explore read-only, apply
   Issues write, mutation jobs Contents and Pull requests write (issue implement
   also Issues write).
5. Run the label initializer yourself, then deliberately apply trigger labels.
   Labels added with `GITHUB_TOKEN` generally do **not** trigger another workflow.
   `AGENT_PAT` is used for explore→implement and implement→review handoffs and
   issue-branch checkout/push and draft PR creation; otherwise manually
   remove/re-add the next label. PR creation fails immediately on API errors or
   invalid output, before requesting review.
   Other PR mutation pushes use `GITHUB_TOKEN`, so CI may need a manual rerun.

No secrets, remote labels, or paid agent runs were configured by this setup.
