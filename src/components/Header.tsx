import { logoCards, logoTitle } from "./ui/icons";

export type View = "study" | "all";

const tabs: { id: View; label: string }[] = [
  { id: "study", label: "Study Mode" },
  { id: "all", label: "All Cards" },
];

export function Header({ view, onViewChange }: { view: View; onViewChange: (view: View) => void }) {
  return (
    <header className="flex w-full items-center justify-between gap-4">
      <div role="img" aria-label="Flashcard" className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-full border border-r-2 border-b-2 border-neutral-900 bg-yellow-500">
          <img src={logoCards} alt="" width={20.77} height={20} className="h-5 w-[20.77px]" />
        </span>
        {/* Wordmark is hidden on mobile, matching the 375px frame */}
        <img src={logoTitle} alt="" width={106.92} height={17.76} className="hidden h-[17.76px] w-[106.92px] sm:block" />
      </div>

      <nav
        aria-label="Views"
        className="flex h-[47px] items-center gap-1 rounded-full border border-neutral-900 bg-neutral-0 p-1 shadow-tab sm:h-[52px]"
      >
        {tabs.map((tab) => {
          const current = tab.id === view;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={current ? "page" : undefined}
              onClick={() => onViewChange(tab.id)}
              className={[
                "focus-ring flex h-[39px] items-center justify-center rounded-full border px-[15px] text-preset-4-semibold whitespace-nowrap sm:h-11",
                "transition-colors duration-150 ease-out",
                current
                  ? "border-neutral-900 bg-yellow-500"
                  : "border-transparent bg-neutral-0 hover:border-neutral-900",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
