import { UserButton } from "@clerk/tanstack-react-start"
import { Link } from "@tanstack/react-router"

import { ThemeSwitcher } from "@workspace/ui/components/theme-switcher"

import { Logo } from "./logo"
import { ModeNav } from "./mode-nav"

export function AppHeader() {
  return (
    <header className="flex flex-nowrap items-center justify-between gap-2">
      <Link
        to="/study"
        search={true}
        className="shrink-0 rounded-full focus-ring"
        aria-label="Flashcard home"
      >
        <Logo />
      </Link>
      <div className="flex min-w-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-3">
        <ThemeSwitcher className="shrink-0" />
        <ModeNav />
        {/* Not in the Figma file: account menu for sign-out and profile. */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8 border border-border shadow-hard-1 sm:size-10",
            },
          }}
        />
      </div>
    </header>
  )
}
