import { describe, expect, it } from "vitest"

import { applyProgress } from "./index"

describe("applyProgress", () => {
  it("counts one more correct answer when the learner knows the card", () => {
    expect(applyProgress(0, "know")).toBe(1)
    expect(applyProgress(3, "know")).toBe(4)
  })

  it("stops counting once the card is mastered (5/5)", () => {
    expect(applyProgress(4, "know")).toBe(5)
    expect(applyProgress(5, "know")).toBe(5)
  })

  it("sends the card back to not started on reset", () => {
    expect(applyProgress(3, "reset")).toBe(0)
    expect(applyProgress(5, "reset")).toBe(0)
  })
})
