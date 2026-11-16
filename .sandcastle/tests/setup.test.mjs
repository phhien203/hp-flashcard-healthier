import assert from "node:assert/strict"
import { execFileSync, spawnSync } from "node:child_process"
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import { Output, claudeCode, run } from "@ai-hero/sandcastle"
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox"

import {
  VERDICT_LABEL,
  EXPLORE_LABEL,
  planEffects,
  TAGS,
} from "../agent-workflows/explore/batch.ts"
import {
  assertRebaseComplete,
  rebaseInProgress,
  startRebase,
} from "../agent-workflows/update-branch/rebase.ts"

const root = fileURLToPath(new URL("../../", import.meta.url))
const labels = JSON.parse(
  readFileSync(path.join(root, ".github/sandcastle-labels.json"), "utf8")
)

test("published ESM exports load without launching an agent", () => {
  assert.equal(typeof run, "function")
  assert.equal(typeof Output.object, "function")
  assert.equal(typeof claudeCode, "function")
  assert.ok(noSandbox())
})

test("manifest equals every trigger, transition, and mapped verdict label", () => {
  const workflows = path.join(root, ".github/workflows")
  const names = readdirSync(workflows).filter((file) =>
    /^agent-.*\.yml$/.test(file)
  )
  assert.deepEqual(names.sort(), [
    "agent-explore.yml",
    "agent-implement-pr.yml",
    "agent-implement.yml",
    "agent-review.yml",
    "agent-update-branch.yml",
  ])
  const required = new Set([EXPLORE_LABEL, ...Object.values(VERDICT_LABEL)])
  for (const name of names) {
    const text = readFileSync(path.join(workflows, name), "utf8")
    for (const [label] of text.matchAll(/agent:[a-z-]+/g)) required.add(label)
    for (const [, script] of text.matchAll(/pnpm exec tsx (\S+)/g)) {
      assert.ok(readFileSync(path.join(root, script)).length)
    }
    assert.ok(!text.includes("npm ci"))
    assert.ok(!/git push --force\s/.test(text))
  }
  assert.deepEqual(
    labels.map((label) => label.name).sort(),
    [...required].sort()
  )
  for (const tag of TAGS) {
    const effects = planEffects({
      issues: [{ number: 1, tag, duplicate_of: null, comment: "Findings." }],
      patterns: "",
    })
    assert.equal(
      effects.find((effect) => effect.kind === "swap-label").to,
      VERDICT_LABEL[tag]
    )
  }
})

test("label dry-run is offline and mocked initialization is idempotent", (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "sandcastle-labels-"))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  for (const name of ["scripts", ".github", "bin"])
    mkdirSync(path.join(dir, name))
  copyFileSync(
    path.join(root, "scripts/sandcastle-labels.mjs"),
    path.join(dir, "scripts/sandcastle-labels.mjs")
  )
  writeFileSync(
    path.join(dir, ".github/sandcastle-labels.json"),
    JSON.stringify(labels)
  )
  const stateFile = path.join(dir, "state.json")
  const existing = {
    ...labels[0],
    color: "ffffff",
    description: "Preserve custom metadata",
  }
  writeFileSync(stateFile, JSON.stringify({ labels: [existing], calls: [] }))
  const mock = path.join(dir, "bin/gh")
  writeFileSync(
    mock,
    `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
const state = JSON.parse(fs.readFileSync(process.env.MOCK_STATE, "utf8"));
state.calls.push(args);
if (args[0] === "api") console.log(JSON.stringify([state.labels]));
else if (args[0] === "label" && args[1] === "create") {
  if (args.includes("--force")) throw new Error("must preserve metadata");
  state.labels.push({ name: args[2], color: args[args.indexOf("--color") + 1], description: args[args.indexOf("--description") + 1] });
} else throw new Error("Unexpected gh call");
fs.writeFileSync(process.env.MOCK_STATE, JSON.stringify(state));
`
  )
  chmodSync(mock, 0o755)
  const invoke = (...args) => {
    const result = spawnSync(
      process.execPath,
      ["scripts/sandcastle-labels.mjs", ...args],
      {
        cwd: dir,
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: path.join(dir, "bin"),
          MOCK_STATE: stateFile,
        },
      }
    )
    assert.equal(result.status, 0, result.stderr)
  }
  const state = () => JSON.parse(readFileSync(stateFile, "utf8"))
  invoke("--dry-run")
  assert.deepEqual(state().calls, [])
  invoke("--repo", "example/repository")
  invoke("--repo", "example/repository")
  assert.deepEqual(state().labels[0], existing)
  assert.equal(state().labels.length, labels.length)
  assert.equal(
    state().calls.filter((args) => args[0] === "label").length,
    labels.length - 1
  )
})

test("rebase handles clean history and rejects an unfinished multi-conflict rebase", (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "sandcastle-rebase-"))
  const previous = process.cwd()
  t.after(() => {
    process.chdir(previous)
    rmSync(dir, { recursive: true, force: true })
  })
  process.chdir(dir)
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, GIT_EDITOR: "true" },
    }).trim()
  const commit = (file, text, message) => {
    writeFileSync(file, text)
    git("add", file)
    git("commit", "-m", message)
  }
  git("init", "-b", "main")
  git("config", "user.name", "Test")
  git("config", "user.email", "test@example.com")
  commit("a", "original\n", "initial a")
  commit("b", "original\n", "initial b")
  git("checkout", "-b", "topic")
  commit("a", "topic\n", "topic a")
  commit("b", "topic\n", "topic b")
  git("checkout", "main")
  commit("a", "base\n", "base a")
  commit("b", "base\n", "base b")
  const base = git("rev-parse", "HEAD")
  git("checkout", "topic")
  assert.equal(startRebase(base), "conflict")
  assert.ok(rebaseInProgress())
  assert.throws(() => assertRebaseComplete(base), /still in progress/)
  writeFileSync("a", "base and topic\n")
  git("add", "a")
  assert.throws(() => git("rebase", "--continue"))
  assert.ok(rebaseInProgress())
  assert.throws(() => assertRebaseComplete(base), /still in progress/)
  writeFileSync("b", "base and topic\n")
  git("add", "b")
  git("rebase", "--continue")
  assertRebaseComplete(base)
  assert.equal(git("rev-list", "--merges", `${base}..HEAD`), "")
  assert.equal(startRebase(base), "clean")
  assertRebaseComplete(base)
  git("checkout", "main")
  commit("c", "new base file\n", "advance base without conflicts")
  const nextBase = git("rev-parse", "HEAD")
  git("checkout", "topic")
  commit("d", "new topic file\n", "advance topic without conflicts")
  const previousHead = git("rev-parse", "HEAD")
  assert.equal(startRebase(nextBase), "clean")
  assert.notEqual(git("rev-parse", "HEAD"), previousHead)
  assertRebaseComplete(nextBase)
  writeFileSync("untracked", "not clean")
  assert.throws(() => assertRebaseComplete(nextBase), /uncommitted changes/)
})
