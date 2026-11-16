import React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from "@workspace/ui/lib/utils"

/** 60px outlined progress bar from the Figma "Progress Bar" component. */
function Progress({
  className,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const percent = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn(
        "relative h-2.5 w-15 shrink-0 overflow-hidden rounded-full border border-border bg-card",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full rounded-full bg-foreground transition-[width] duration-300 ease-out-strong"
        style={{ width: `${percent}%` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
