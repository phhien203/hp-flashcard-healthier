import type { ReactNode } from "react";

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 text-center">
      <h2 className="text-preset-2">{title}</h2>
      <p className="max-w-[440px] text-preset-5-regular text-neutral-600 sm:text-preset-4-regular">{children}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
