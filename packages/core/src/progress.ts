import { MASTERY_THRESHOLD } from "./card"

/** What the learner did with a card in Study Mode. */
export type ProgressAction = "know" | "reset"

/** Next `knownCount` after a study action, clamped to the mastery threshold. */
export function applyProgress(
  knownCount: number,
  action: ProgressAction
): number {
  if (action === "reset") return 0
  return Math.min(knownCount + 1, MASTERY_THRESHOLD)
}
