#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

function gh(args) {
  const result = spawnSync("gh", args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `gh exited with ${result.status}`);
  }
  return result.stdout.trim();
}

function main() {
  const args = process.argv.slice(2);
  let repo;
  let dryRun = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") dryRun = true;
    else if (args[i] === "--repo" && args[i + 1]) repo = args[++i];
    else throw new Error("Usage: sandcastle-labels.mjs [--repo OWNER/REPO] [--dry-run]");
  }
  if (repo && !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new Error("--repo must be OWNER/REPO");
  }

  const labels = JSON.parse(
    readFileSync(new URL("../.github/sandcastle-labels.json", import.meta.url), "utf8"),
  );
  if (!Array.isArray(labels) || labels.length === 0) {
    throw new Error("The label manifest must be a nonempty array");
  }
  const names = new Set();
  for (const label of labels) {
    if (
      !label || typeof label.name !== "string" || !label.name.trim() ||
      typeof label.color !== "string" || !/^[a-fA-F0-9]{6}$/.test(label.color) ||
      typeof label.description !== "string" || label.description.length > 100
    ) {
      throw new Error("Each label needs a name, six-digit hex color, and description (up to 100 characters)");
    }
    const key = label.name.toLowerCase();
    if (names.has(key)) throw new Error(`Duplicate label: ${label.name}`);
    names.add(key);
  }

  if (dryRun) {
    console.log(`Required labels for ${repo || "the current repository"} (no changes):`);
    for (const label of labels) console.log(`  ${label.name}: ${label.description}`);
    return;
  }

  repo ??= gh(["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("Could not resolve OWNER/REPO");
  const pages = JSON.parse(gh(["api", "--paginate", "--slurp", `repos/${repo}/labels`]));
  const existing = new Set(pages.flat().map((label) => label.name.toLowerCase()));
  for (const label of labels) {
    if (existing.has(label.name.toLowerCase())) {
      console.log(`Keep existing: ${label.name}`);
      continue;
    }
    gh([
      "label", "create", label.name, "--repo", repo,
      "--color", label.color, "--description", label.description,
    ]);
    existing.add(label.name.toLowerCase());
    console.log(`Created: ${label.name}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
