import { Link } from "@tanstack/react-router"

const tabClass =
  "focus-ring flex h-9 items-center justify-center rounded-full border border-transparent px-3 text-preset-5 font-semibold whitespace-nowrap transition-[background-color,border-color,box-shadow] duration-150 hover:border-border hover:shadow-hard-1 sm:h-11 sm:px-4 sm:text-preset-4-semibold data-[status=active]:border-border data-[status=active]:bg-primary data-[status=active]:hover:shadow-none"

/**
 * The "Study Mode / All Cards" switch from the Figma "Tab" component.
 * Each tab is a real link, so the deck filters in the URL travel with it.
 */
export function ModeNav() {
  return (
    <nav
      aria-label="Mode"
      className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-tab"
    >
      <Link to="/study" search={true} className={tabClass}>
        Study Mode
      </Link>
      <Link to="/cards" search={true} className={tabClass}>
        All Cards
      </Link>
    </nav>
  )
}
