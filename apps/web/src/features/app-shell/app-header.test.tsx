import type { ComponentProps } from "react"

import { afterEach, describe, expect, it, vi } from "vitest"
import { page } from "vitest/browser"
import { render } from "vitest-browser-react"

import { ThemeProvider } from "@workspace/ui/components/theme-provider"

import { AppHeader } from "./app-header"
import { AuthPage } from "./auth-page"
import { NotFound } from "./not-found"

vi.mock("@clerk/tanstack-react-start", () => ({
  UserButton: ({
    appearance,
  }: {
    appearance?: { elements?: { avatarBox?: string } }
  }) => (
    <button
      type="button"
      aria-label="Account"
      className={`overflow-hidden rounded-full ${appearance?.elements?.avatarBox ?? ""}`}
    >
      <span className="block size-full bg-primary" />
    </button>
  ),
}))

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    search: _search,
    children,
    ...props
  }: ComponentProps<"a"> & { to: string; search?: boolean }) => (
    <a
      href={to}
      data-status={to === "/study" ? "active" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
}))

describe("AppHeader", () => {
  afterEach(async () => {
    document.documentElement.classList.remove("dark")
    await page.viewport(1280, 800)
  })

  it("fits the logo, switcher, mode nav and avatar on one row at 375px", async () => {
    await page.viewport(375, 800)
    await render(
      <ThemeProvider preference="light" resolved="light">
        <div className="bg-background px-4 pt-4">
          <AppHeader />
        </div>
      </ThemeProvider>
    )

    const header = document.querySelector("header")
    if (!header) throw new Error("header missing")
    const box = header.getBoundingClientRect()
    expect(box.height).toBeLessThanOrEqual(48)
    expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth + 1)

    const wordmark = document.querySelector("[aria-label='Flashcard']")
    if (!(wordmark instanceof Element)) throw new Error("wordmark missing")
    expect(getComputedStyle(wordmark).display).toBe("none")

    const switcher = header.querySelector("[role='radiogroup']")
    const nav = header.querySelector("nav")
    const avatar = header.querySelector("[aria-label='Account']")
    if (!switcher || !nav || !avatar) throw new Error("header controls missing")
    const headerMid = box.top + box.height / 2
    for (const element of [switcher, nav, avatar]) {
      const control = element.getBoundingClientRect()
      expect(control.top).toBeGreaterThanOrEqual(box.top - 1)
      expect(control.bottom).toBeLessThanOrEqual(box.bottom + 1)
      expect(
        Math.abs(control.top + control.height / 2 - headerMid)
      ).toBeLessThan(2)
    }
    const shorts = switcher.querySelectorAll(".sm\\:hidden")
    const fulls = switcher.querySelectorAll(".sm\\:inline")
    expect(shorts.length).toBe(3)
    expect(fulls.length).toBe(3)
    for (const label of shorts) {
      expect(getComputedStyle(label).display).not.toBe("none")
    }
    for (const label of fulls) {
      expect(getComputedStyle(label).display).toBe("none")
    }
  })

  it("keeps the auth and 404 switchers inside a header landmark", async () => {
    const auth = await render(
      <ThemeProvider preference="system" resolved="light">
        <AuthPage>
          <p>Sign in</p>
        </AuthPage>
      </ThemeProvider>
    )
    const authSwitcher = auth.getByRole("radiogroup", { name: "Theme" })
    expect(authSwitcher.element().closest("header")).not.toBeNull()
    expect(authSwitcher.element().closest("main")).toBeNull()
    expect(document.querySelector("main")).not.toBeNull()

    auth.unmount()

    const missing = await render(
      <ThemeProvider preference="system" resolved="light">
        <NotFound />
      </ThemeProvider>
    )
    const missingSwitcher = missing.getByRole("radiogroup", { name: "Theme" })
    expect(missingSwitcher.element().closest("header")).not.toBeNull()
    expect(document.querySelector("main")?.textContent).toContain(
      "Page not found"
    )
  })
})
