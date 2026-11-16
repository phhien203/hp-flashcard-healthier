import type { Stats } from "@workspace/core"
import { Icon, type IconName } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"

const TILES: ReadonlyArray<{
  key: keyof Stats
  label: string
  icon: IconName
  tone: string
}> = [
  {
    key: "total",
    label: "Total Cards",
    icon: "stat-total",
    tone: "bg-blue-400",
  },
  {
    key: "mastered",
    label: "Mastered",
    icon: "stat-mastered",
    tone: "bg-teal-400",
  },
  {
    key: "inProgress",
    label: "In Progress",
    icon: "stat-in-progress",
    tone: "bg-pink-500",
  },
  {
    key: "notStarted",
    label: "Not Started",
    icon: "stat-not-started",
    tone: "bg-pink-400",
  },
]

/** "Study Statistics" panel: four tiles, stacked on desktop and phones, 2×2 on tablets. */
export function StatsPanel({
  stats,
  className,
}: {
  stats: Stats
  className?: string
}) {
  return (
    <section
      aria-labelledby="stats-heading"
      className={cn(
        "flex flex-col gap-4 rounded-xl panel-edge-3 bg-card p-4 sm:p-5 lg:p-6",
        className
      )}
    >
      <h2 id="stats-heading" className="text-preset-2">
        Study Statistics
      </h2>
      <dl className="grid flex-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-1">
        {TILES.map(({ key, label, icon, tone }) => (
          <div
            key={key}
            className="flex min-h-[118px] overflow-hidden rounded-lg border border-r-2 border-b-2 border-border bg-card"
          >
            <div className="flex flex-1 flex-col justify-between gap-3 px-5 py-4">
              <dt className="text-preset-4">{label}</dt>
              <dd className="text-preset-1 tabular-nums">{stats[key]}</dd>
            </div>
            <div
              className={cn(
                "-my-px -mr-px flex w-25 shrink-0 items-center justify-center border border-border",
                tone
              )}
            >
              <Icon name={icon} />
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}
