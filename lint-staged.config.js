//  @ts-check

import path from "node:path"

/** Workspace packages that have their own ESLint config, by directory. */
const eslintPackages = {
  "apps/web": "web",
  "packages/core": "@workspace/core",
  "packages/db": "@workspace/db",
  "packages/ui": "@workspace/ui",
}

const lintable = /\.(js|ts|tsx)$/

/**
 * One sequential chain so ESLint's import sorting lands before Prettier
 * formats the same files (separate globs would run concurrently and race).
 *
 * @type {import("lint-staged").Configuration}
 */
export default {
  "*": (files) => {
    const quote = (/** @type {string[]} */ list) =>
      list.map((file) => JSON.stringify(file)).join(" ")

    const eslint = Object.entries(eslintPackages).flatMap(([dir, name]) => {
      const root = path.resolve(dir) + path.sep
      const own = files.filter(
        (file) => file.startsWith(root) && lintable.test(file)
      )
      return own.length
        ? [`pnpm --filter ${name} exec eslint --fix ${quote(own)}`]
        : []
    })

    return [...eslint, `prettier --ignore-unknown --write ${quote(files)}`]
  },
}
