import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher"

import { Logo } from "./logo"
import { Page } from "./page"

/** Centered layout for the Clerk sign-in and sign-up screens. */
export function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <Page className="relative min-h-svh items-center justify-center gap-8">
      <ThemeSwitcher className="absolute top-4 right-4 z-10" />
      <Logo />
      <main>{children}</main>
    </Page>
  )
}
