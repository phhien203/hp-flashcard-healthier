//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

import { workspaceConfig } from "../../eslint.config.base.js"

export default [...tanstackConfig, ...workspaceConfig]
