import { Logo } from "./logo"
import { Page } from "./page"

/** Centered layout for the Clerk sign-in and sign-up screens. */
export function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <Page className="min-h-svh items-center justify-center gap-8">
      <Logo />
      <main>{children}</main>
    </Page>
  )
}
