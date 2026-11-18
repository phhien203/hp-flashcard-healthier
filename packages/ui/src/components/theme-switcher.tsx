import React from "react"

import { useTheme } from "@workspace/ui/components/theme-provider"
import type { ThemePreference } from "@workspace/ui/lib/theme"
import { cn } from "@workspace/ui/lib/utils"

const OPTIONS = [
  { value: "light", label: "Light", short: "L" },
  { value: "dark", label: "Dark", short: "D" },
  { value: "system", label: "System", short: "S" },
] as const satisfies ReadonlyArray<{
  value: ThemePreference
  label: string
  short: string
}>

/**
 * Light / Dark / System choice. A radiogroup so arrow keys move the selection,
 * with a visible label on each option and the focus ring from the design system.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme()
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])

  const select = (value: ThemePreference) => {
    setPreference(value)
    const index = OPTIONS.findIndex((option) => option.value === value)
    refs.current[index]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = OPTIONS.findIndex((option) => option.value === preference)
    const from = current === -1 ? 0 : current
    let next = from
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (from + 1) % OPTIONS.length
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (from - 1 + OPTIONS.length) % OPTIONS.length
    } else if (event.key === "Home") {
      next = 0
    } else if (event.key === "End") {
      next = OPTIONS.length - 1
    } else {
      return
    }
    event.preventDefault()
    select(next === 0 ? "light" : next === 1 ? "dark" : "system")
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      onKeyDown={onKeyDown}
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-tab",
        className
      )}
    >
      {OPTIONS.map((option, index) => {
        const checked = preference === option.value
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            aria-label={option.label}
            onClick={() => setPreference(option.value)}
            className={cn(
              "cursor-pointer rounded-full px-1.5 py-1 text-preset-6 font-semibold focus-ring transition-[background-color,color] duration-150 sm:px-3 sm:py-1.5 sm:text-preset-5",
              checked
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <span className="sm:hidden">{option.short}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
