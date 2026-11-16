import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

/** Text field from the Figma "Input" component (default, focus and error states). */
const controlClassName =
  "focus-ring w-full min-w-0 rounded-sm border border-input bg-card p-4 text-preset-4-regular text-foreground transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground hover:shadow-hard-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-error"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(controlClassName, className)}
      {...props}
    />
  )
}

export { Input, controlClassName }
