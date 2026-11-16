import * as fs from "node:fs"
import * as path from "node:path"

import * as sandcastle from "@ai-hero/sandcastle"
import { noSandbox } from "@ai-hero/sandcastle/sandboxes/no-sandbox"

import {
  asRecord,
  asString,
  claudeAgent,
  fail,
  required,
  standardSchema,
  writeText,
} from "../shared/common"
import { runWithExtraction } from "../shared/run-with-extraction"

import {
  assertRebaseComplete,
  git,
  rebaseInProgress,
  startRebase,
} from "./rebase"

const schema = standardSchema<{ readonly comment: string }>((value) => ({
  comment: asString(asRecord(value, "update-branch output").comment, "comment"),
}))

const PR_NUMBER = required("PR_NUMBER")
const BRANCH = required("BRANCH")
const BASE_REF = required("BASE_REF")
const EXPECTED_HEAD = required("BRANCH_HEAD_SHA")

try {
  writeText("should_push.txt", "false")
  git("check-ref-format", `refs/heads/${BASE_REF}`)
  git("check-ref-format", `refs/heads/${BRANCH}`)
  if (git("rev-parse", "HEAD") !== EXPECTED_HEAD) {
    fail("Checkout no longer matches the expected remote head.")
  }
  if (rebaseInProgress() || git("status", "--porcelain") !== "") {
    fail("Expected a clean checkout before starting the rebase.")
  }
  git(
    "fetch",
    "origin",
    `+refs/heads/${BASE_REF}:refs/remotes/origin/${BASE_REF}`
  )
  const baseSha = git("rev-parse", `refs/remotes/origin/${BASE_REF}`)
  if (git("merge-base", "HEAD", baseSha) === baseSha) {
    writeText(
      "comment.md",
      "`agent:update-branch`: already up to date; no rebase needed."
    )
    process.exit(0)
  }

  const status = startRebase(baseSha)
  let comment = `\`agent:update-branch\`: rebased \`${BRANCH}\` onto \`origin/${BASE_REF}\` (\`${baseSha.slice(0, 7)}\`) without conflicts.`
  if (status === "conflict") {
    const result = await runWithExtraction({
      name: `update-branch-pr-${PR_NUMBER}`,
      agent: claudeAgent(),
      sandbox: noSandbox(),
      logging: { type: "stdout" },
      promptFile: path.join(import.meta.dirname, "prompt.md"),
      promptArgs: { PR_NUMBER, BRANCH, BASE_REF },
      output: sandcastle.Output.object({ tag: "output", schema }),
      extractionPrompt: fs.readFileSync(
        path.join(import.meta.dirname, "extraction.md"),
        "utf8"
      ),
    })
    comment = result.output.comment
  }

  assertRebaseComplete(baseSha)
  if (git("branch", "--show-current") !== BRANCH) {
    fail("Agent finished on an unexpected branch.")
  }
  writeText("comment.md", comment)
  writeText(
    "should_push.txt",
    git("rev-parse", "HEAD") !== EXPECTED_HEAD ? "true" : "false"
  )
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
