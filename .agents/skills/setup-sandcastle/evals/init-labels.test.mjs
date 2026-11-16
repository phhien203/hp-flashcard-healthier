import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const labels = [
  { name: "agent:explore", color: "123abc", description: "Explore issues" },
  { name: "ready-for-human", color: "abcdef", description: "Human review" },
];

function fixture(t, manifest = labels) {
  const root = mkdtempSync(path.join(tmpdir(), "sandcastle-label-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of ["scripts", ".github", "bin"]) mkdirSync(path.join(root, dir));
  const script = path.join(root, "scripts/sandcastle-labels.mjs");
  copyFileSync(new URL("../assets/init-labels.mjs", import.meta.url), script);
  writeFileSync(path.join(root, ".github/sandcastle-labels.json"), JSON.stringify(manifest));
  const statePath = path.join(root, "state.json");
  writeFileSync(statePath, JSON.stringify({ labels: [{ name: "Agent:Explore", color: "ffffff", description: "Keep me" }], calls: [] }));
  const mock = path.join(root, "bin/gh");
  writeFileSync(mock, `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
const state = JSON.parse(fs.readFileSync(process.env.MOCK_STATE, "utf8"));
state.calls.push(args);
fs.writeFileSync(process.env.MOCK_STATE, JSON.stringify(state));
if (process.env.MOCK_FAIL) { console.error("mock permission denied"); process.exit(1); }
if (args[0] === "repo") console.log("example/repository");
else if (args[0] === "api") console.log(JSON.stringify([state.labels.slice(0, 1), state.labels.slice(1)]));
else if (args[0] === "label" && args[1] === "create") {
  if (args.includes("--force")) throw new Error("must preserve existing metadata");
  state.labels.push({ name: args[2], color: args[args.indexOf("--color") + 1], description: args[args.indexOf("--description") + 1] });
  fs.writeFileSync(process.env.MOCK_STATE, JSON.stringify(state));
} else { console.error("Unexpected gh arguments"); process.exit(2); }
`);
  chmodSync(mock, 0o755);
  return {
    state: () => JSON.parse(readFileSync(statePath, "utf8")),
    run: (args = [], env = {}) => spawnSync(process.execPath, [script, ...args], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, PATH: path.join(root, "bin"), MOCK_STATE: statePath, ...env },
    }),
  };
}

test("dry-run is offline, even without authenticated gh", (t) => {
  const f = fixture(t);
  const result = f.run(["--dry-run"], { MOCK_FAIL: "1" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ready-for-human/);
  assert.deepEqual(f.state().calls, []);
});

test("initialization paginates, preserves metadata, and is idempotent", (t) => {
  const f = fixture(t);
  const first = f.run(["--repo", "example/repository"]);
  assert.equal(first.status, 0, first.stderr);
  const second = f.run(["--repo", "example/repository"]);
  assert.equal(second.status, 0, second.stderr);
  const state = f.state();
  assert.equal(state.labels.length, 2);
  assert.deepEqual(state.labels[0], { name: "Agent:Explore", color: "ffffff", description: "Keep me" });
  assert.equal(state.calls.filter((args) => args[0] === "label").length, 1);
  assert.ok(state.calls.filter((args) => args[0] === "api").every((args) => args.includes("--paginate")));
});

test("repository is inferred with gh when omitted", (t) => {
  const f = fixture(t);
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.state().calls[0][0], "repo");
});

test("invalid manifests fail before contacting GitHub", (t) => {
  for (const manifest of [[], [{ ...labels[0], color: "#123abc" }], [labels[0], { ...labels[0], name: "AGENT:EXPLORE" }]]) {
    const f = fixture(t, manifest);
    const result = f.run();
    assert.equal(result.status, 1);
    assert.deepEqual(f.state().calls, []);
  }
});

test("unknown options and invalid repositories fail before contacting GitHub", (t) => {
  const f = fixture(t);
  for (const args of [["--force"], ["--repo"], ["--repo", "../bad/path"]]) {
    assert.equal(f.run(args).status, 1);
  }
  assert.deepEqual(f.state().calls, []);
});

test("gh failures surface as failures rather than apparent success", (t) => {
  const f = fixture(t);
  const result = f.run(["--repo", "example/repository"], { MOCK_FAIL: "1" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /mock permission denied/);
  assert.equal(f.state().calls.length, 1);
});
