import { describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { contrastRatio } from "./color"
import { clerkAppearance, palette, themeColors } from "./tokens"

function probe(variable: string, dark: boolean) {
  const el = document.createElement("div")
  if (dark) el.classList.add("dark")
  el.style.color = `var(${variable})`
  document.body.appendChild(el)
  const value = getComputedStyle(el).color
  el.remove()
  return value.replaceAll(" ", "")
}

function walk(rules: CSSRuleList, visit: (rule: CSSRule) => void) {
  for (const rule of rules) {
    visit(rule)
    if (rule instanceof CSSGroupingRule) walk(rule.cssRules, visit)
  }
}

function sheetRules(): CSSRuleList[] {
  const lists: CSSRuleList[] = []
  for (const sheet of document.styleSheets) {
    try {
      lists.push(sheet.cssRules)
    } catch {
      // A cross-origin sheet has no readable rules.
    }
  }
  return lists
}

function findStyleRule(selector: string): CSSStyleRule | null {
  let found: CSSStyleRule | null = null
  for (const rules of sheetRules()) {
    walk(rules, (rule) => {
      if (!(rule instanceof CSSStyleRule)) return
      if (rule.parentRule instanceof CSSMediaRule) return
      if (rule.selectorText === selector) found = rule
    })
  }
  return found
}

function findMediaStyleRule(
  condition: string,
  selector: string
): CSSStyleRule | null {
  let found: CSSStyleRule | null = null
  for (const rules of sheetRules()) {
    walk(rules, (rule) => {
      if (!(rule instanceof CSSMediaRule)) return
      const text = rule.conditionText.replaceAll(" ", "")
      if (!text.includes(condition.replaceAll(" ", ""))) return
      for (const inner of rule.cssRules) {
        if (!(inner instanceof CSSStyleRule)) continue
        if (!inner.selectorText.includes(selector)) continue
        found = inner
      }
    })
  }
  return found
}

function expandSelector(parent: string, key: string): string {
  const parents = parent.split(",").map((part) => part.trim())
  return key
    .split(",")
    .flatMap((part) => parents.map((item) => part.trim().replaceAll("&", item)))
    .join(",")
}

function emitCss(selector: string, styles: object): string {
  const declarations: string[] = []
  let nested = ""
  for (const [key, value] of Object.entries(styles)) {
    if (value && typeof value === "object") {
      nested += emitCss(expandSelector(selector, key), value)
    } else {
      const property = key.replaceAll(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`
      )
      declarations.push(`${property}:${String(value)}`)
    }
  }
  return `${selector}{${declarations.join(";")}}${nested}`
}

function rgb(hex: string) {
  const value = parseInt(hex.slice(1), 16)
  return `rgb(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255})`
}

describe("palette", () => {
  it.each(Object.entries(palette))(
    "matches --fc-%s in globals.css",
    (name, hex) => {
      const css = getComputedStyle(document.documentElement).getPropertyValue(
        `--fc-${name}`
      )
      expect(css.trim().toLowerCase()).toBe(hex)
    }
  )

  it("keeps the Figma primitives when dark is on, so the scrim stays a dark veil", () => {
    const root = document.documentElement
    root.classList.add("dark")
    try {
      for (const [name, hex] of Object.entries(palette)) {
        const css = getComputedStyle(root).getPropertyValue(`--fc-${name}`)
        expect(css.trim().toLowerCase()).toBe(hex)
      }
      expect(probe("--overlay", true)).toBe("rgba(8,4,2,0.75)")
      expect(probe("--destructive", true)).toBe(
        rgb(themeColors.dark.destructive)
      )
      expect(probe("--background", true)).toBe(rgb(themeColors.dark.background))
    } finally {
      root.classList.remove("dark")
    }
  })
})

describe("theme contrast", () => {
  it.each([
    [
      "light destructive on the page",
      themeColors.light.destructive,
      themeColors.light.background,
    ],
    [
      "light destructive on a card",
      themeColors.light.destructive,
      themeColors.light.card,
    ],
    ["light link on a card", themeColors.light.link, themeColors.light.card],
    [
      "light link on the page",
      themeColors.light.link,
      themeColors.light.background,
    ],
    [
      "light muted text on a card",
      themeColors.light.mutedForeground,
      themeColors.light.card,
    ],
    [
      "dark text on the page",
      themeColors.dark.foreground,
      themeColors.dark.background,
    ],
    ["dark text on a card", themeColors.dark.foreground, themeColors.dark.card],
    [
      "dark muted text on a card",
      themeColors.dark.mutedForeground,
      themeColors.dark.card,
    ],
    [
      "dark destructive on a card",
      themeColors.dark.destructive,
      themeColors.dark.card,
    ],
    ["dark link on a card", themeColors.dark.link, themeColors.dark.card],
    [
      "ink on the yellow primary",
      themeColors.light.primaryForeground,
      themeColors.light.primary,
    ],
  ])("%s clears WCAG AA", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5)
  })

  it("gives Clerk field borders at least 3:1 against the card", () => {
    expect(
      contrastRatio(themeColors.dark.border, themeColors.dark.card)
    ).toBeGreaterThanOrEqual(3)
    expect(
      contrastRatio(themeColors.light.border, themeColors.light.card)
    ).toBeGreaterThanOrEqual(3)
    expect(
      contrastRatio(themeColors.dark.ring, themeColors.dark.card)
    ).toBeGreaterThanOrEqual(3)
    expect(
      contrastRatio(themeColors.light.ring, themeColors.light.card)
    ).toBeGreaterThanOrEqual(3)

    const input = clerkAppearance.elements.formFieldInput
    const variant =
      input[
        '&[data-variant="default"], &[data-variant="outline"], &[data-variant="unstyled"]'
      ]
    expect(input.borderWidth).toBe("1px")
    expect(input.borderStyle).toBe("solid")
    expect(input.borderColor).toBe("var(--border)")
    expect(input.boxShadow).toBe("none")
    expect(input["&:hover"].boxShadow).toBe("none")
    expect(variant.borderWidth).toBe("1px")
    expect(variant.borderStyle).toBe("solid")
    expect(variant.borderColor).toBe("var(--border)")
    expect(variant.boxShadow).toBe("none")
    expect(variant["&:hover"].boxShadow).toBe("none")
    expect(variant["&:hover"].borderWidth).toBe("1px")
    expect(clerkAppearance.elements.otpCodeFieldInput).toBe(input)
    expect(clerkAppearance.elements.phoneInputBox).toBe(input)
    expect(clerkAppearance.elements.selectButton).toBe(input)
    expect(clerkAppearance.elements.selectSearchInput).toBe(input)
  })

  it("paints that border over Clerk's variant shadow", async () => {
    const style = document.createElement("style")
    const field = clerkAppearance.elements.formFieldInput
    style.textContent = [
      '.probe[data-variant="default"]{border-width:0;box-shadow:0px 0px 0px 1px rgba(246,239,232,0.24)}',
      '.probe[data-variant="default"]:hover{box-shadow:0px 0px 0px 1px rgba(246,239,232,0.45)}',
      ".phone{border-width:0;box-shadow:0px 0px 0px 1px rgba(46,20,1,0.2)}",
      emitCss(".probe", field),
      emitCss(".phone", field),
    ].join("")
    document.head.appendChild(style)

    const mount = async (dark: boolean) => {
      const root = document.createElement("div")
      if (dark) root.classList.add("dark")
      const input = document.createElement("input")
      input.className = "probe"
      input.dataset.variant = "default"
      const phone = document.createElement("div")
      phone.className = "phone"
      root.append(input, phone)
      document.body.append(root)

      const colors = dark ? themeColors.dark : themeColors.light
      const edge = (element: Element) => {
        const computed = getComputedStyle(element)
        return {
          width: computed.borderTopWidth,
          style: computed.borderTopStyle,
          color: computed.borderTopColor.replaceAll(" ", ""),
          shadow: computed.boxShadow,
        }
      }
      expect(edge(input)).toEqual({
        width: "1px",
        style: "solid",
        color: rgb(colors.border),
        shadow: "none",
      })
      expect(edge(phone)).toMatchObject({
        width: "1px",
        style: "solid",
        color: rgb(colors.border),
        shadow: "none",
      })
      await userEvent.hover(input)
      expect(edge(input).shadow).toBe("none")
      expect(edge(input).width).toBe("1px")
      input.focus()
      expect(edge(input)).toMatchObject({
        width: "1px",
        color: rgb(colors.ring),
        shadow: "none",
      })
      root.remove()
    }

    await mount(true)
    await mount(false)
    style.remove()
  })

  it("follows a dark OS for System and keeps that palette equal to .dark", () => {
    const darkRule = findStyleRule(".dark")
    const systemRule = findMediaStyleRule(
      "(prefers-color-scheme: dark)",
      '[data-theme="system"]'
    )
    if (!darkRule || !systemRule) {
      throw new Error("missing dark or system color rule")
    }
    for (let index = 0; index < darkRule.style.length; index += 1) {
      const name = darkRule.style.item(index)
      if (!name.startsWith("--") && name !== "color-scheme") continue
      expect(systemRule.style.getPropertyValue(name)).toBe(
        darkRule.style.getPropertyValue(name)
      )
    }
    expect(systemRule.style.getPropertyValue("--background").trim()).toBe(
      themeColors.dark.background
    )
    expect(systemRule.style.getPropertyValue("color-scheme").trim()).toBe(
      "dark"
    )
  })

  it("keeps semantic colors in sync with the stylesheet", () => {
    expect(probe("--destructive", false)).toBe(
      rgb(themeColors.light.destructive)
    )
    expect(probe("--link", false)).toBe(rgb(themeColors.light.link))
    expect(probe("--background", false)).toBe(rgb(themeColors.light.background))
    expect(probe("--ink", true)).toBe(rgb(themeColors.light.primaryForeground))
    expect(probe("--overlay", false)).toBe("rgba(46,20,1,0.7)")
  })
})
