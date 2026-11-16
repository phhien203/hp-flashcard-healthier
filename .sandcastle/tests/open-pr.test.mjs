import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"

const workflow = readFileSync(
  new URL("../../.github/workflows/agent-implement.yml", import.meta.url),
  "utf8"
)
const step = workflow
  .split("      - name: Open draft PR\n")[1]
  .split("\n      - name:")[0]
const script = step
  .split("        run: |\n")[1]
  .split("\n")
  .map((line) => line.replace(/^          /, ""))
  .join("\n")

test("PR creation prefers the handoff PAT over GITHUB_TOKEN", () => {
  assert.match(
    step,
    /GH_TOKEN: \$\{\{ secrets\.AGENT_PAT \|\| secrets\.GITHUB_TOKEN \}\}/
  )
})

for (const scenario of [
  { name: "permission denial", exit: 1, url: "", success: false },
  { name: "empty response", exit: 0, url: "", success: false },
  { name: "invalid response", exit: 0, url: "unexpected", success: false },
  {
    name: "created PR",
    exit: 0,
    url: "https://github.com/example/repo/pull/42",
    success: true,
  },
]) {
  test(`PR creation handles ${scenario.name}`, (t) => {
    const dir = mkdtempSync(path.join(tmpdir(), "sandcastle-open-pr-"))
    t.after(() => rmSync(dir, { recursive: true, force: true }))
    const output = path.join(dir, "output")
    writeFileSync(output, "")
    const mock = path.join(dir, "gh")
    writeFileSync(
      mock,
      `#!/bin/bash
if [ "$1 $2" != "pr create" ]; then exit 99; fi
if [ "$MOCK_EXIT" != "0" ]; then
  echo "GitHub Actions is not permitted to create or approve pull requests" >&2
  exit "$MOCK_EXIT"
fi
printf '%s\\n' "$MOCK_URL"
`
    )
    chmodSync(mock, 0o755)
    const result = spawnSync("bash", ["-e", "-c", script], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        ISSUE_NUMBER: "5",
        ISSUE_TITLE: "Preserve current page",
        BRANCH: "agent/issue-5",
        RUNNER_TEMP: dir,
        GITHUB_OUTPUT: output,
        MOCK_EXIT: String(scenario.exit),
        MOCK_URL: scenario.url,
      },
    })
    assert.equal(result.status === 0, scenario.success, result.stderr)
    assert.equal(
      readFileSync(output, "utf8"),
      scenario.success ? "pr_number=42\n" : ""
    )
    if (scenario.exit !== 0) {
      assert.match(result.stderr, /not permitted to create/)
    }
  })
}
