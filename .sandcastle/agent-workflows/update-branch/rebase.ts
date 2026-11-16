import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"

export const git = (...args: string[]): string =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, GIT_EDITOR: "true" },
  }).trim()

export const rebaseInProgress = (): boolean =>
  ["rebase-merge", "rebase-apply"].some((name) =>
    existsSync(git("rev-parse", "--git-path", name))
  )

export const startRebase = (baseSha: string): "clean" | "conflict" => {
  try {
    git("rebase", baseSha)
    return "clean"
  } catch (error) {
    if (
      rebaseInProgress() &&
      git("diff", "--name-only", "--diff-filter=U") !== ""
    ) {
      return "conflict"
    }
    throw error
  }
}

export const assertRebaseComplete = (baseSha: string): void => {
  if (rebaseInProgress()) throw new Error("Rebase is still in progress.")
  if (git("status", "--porcelain") !== "") {
    throw new Error("Rebase left conflicts or uncommitted changes.")
  }
  git("merge-base", "--is-ancestor", baseSha, "HEAD")
  if (git("rev-list", "--merges", `${baseSha}..HEAD`) !== "") {
    throw new Error("Rebased branch contains merge commits.")
  }
}
