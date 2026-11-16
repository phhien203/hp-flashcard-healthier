import type { Stats } from "../../lib/cards";
import { statInProgress, statMastered, statNotStarted, statTotal } from "../ui/icons";

const items: {
  key: keyof Stats;
  label: string;
  bg: string;
  icon: string;
  w: number;
  h: number;
}[] = [
  { key: "total", label: "Total Cards", bg: "bg-blue-400", icon: statTotal, w: 24, h: 23.988 },
  { key: "mastered", label: "Mastered", bg: "bg-teal-400", icon: statMastered, w: 25.456, h: 24 },
  { key: "inProgress", label: "In Progress", bg: "bg-pink-500", icon: statInProgress, w: 30, h: 24 },
  { key: "notStarted", label: "Not Started", bg: "bg-pink-400", icon: statNotStarted, w: 27, h: 18 },
];

/** "Study Statistics" panel: 1 column on mobile + desktop sidebar, 2×2 on tablet. */
export function StatsPanel({ stats }: { stats: Stats }) {
  return (
    <section
      aria-labelledby="stats-title"
      className="flex w-full flex-col gap-4 rounded-16 border border-r-3 border-b-3 border-neutral-900 bg-neutral-0 px-4 py-5 sm:px-5 sm:py-4 lg:w-[392px] lg:shrink-0 lg:self-stretch lg:p-6"
    >
      <h2 id="stats-title" className="text-preset-2">
        Study Statistics
      </h2>
      <dl className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-1 lg:grid-rows-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex min-h-[120px] overflow-hidden rounded-12 border border-r-2 border-b-2 border-neutral-900 bg-neutral-0"
          >
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 px-5 py-4">
              <dt className="text-preset-4">{item.label}</dt>
              <dd className="text-[24px] leading-[1.2] font-bold tabular-nums sm:text-[32px] lg:text-[40px]">
                {stats[item.key]}
              </dd>
            </div>
            <div
              className={`flex w-[100px] shrink-0 items-center justify-center border-l border-neutral-900 ${item.bg}`}
            >
              <img src={item.icon} alt="" width={item.w} height={item.h} style={{ width: item.w, height: item.h }} />
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
