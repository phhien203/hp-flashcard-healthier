import { UserButton } from "@clerk/tanstack-react-start"
import { Link } from "@tanstack/react-router"

import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher"

import { Logo } from "./logo"
import { ModeNav } from "./mode-nav"

export function AppHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link
        to="/study"
        search={true}
        className="rounded-full focus-ring"
        aria-label="Flashcard home"
      >
        <Logo />
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <ThemeSwitcher />
        <ModeNav />
        {/* Not in the Figma file: account menu for sign-out and profile. */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-10 border border-border shadow-hard-1",
            },
          }}
        />
      </div>
    </header>
  )
}
