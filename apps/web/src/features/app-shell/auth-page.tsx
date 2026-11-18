import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher"

import { Logo } from "./logo"
import { Page } from "./page"

/** Centered layout for the Clerk sign-in and sign-up screens. */
export function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <Page className="relative min-h-svh items-center justify-center">
      <header className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </header>
      <main className="flex flex-col items-center gap-8">
        <Logo />
        {children}
      </main>
    </Page>
  )
}
