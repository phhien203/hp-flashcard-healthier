import { MASTERY_THRESHOLD } from "./card"

/** What the learner did with a card in Study Mode. */
export const PROGRESS_ACTIONS = ["know", "reset"] as const
export type ProgressAction = (typeof PROGRESS_ACTIONS)[number]

/** Next `knownCount` after a study action, clamped to the mastery threshold. */
export function applyProgress(
  knownCount: number,
  action: ProgressAction
): number {
  if (action === "reset") return 0
  return Math.min(knownCount + 1, MASTERY_THRESHOLD)
}
