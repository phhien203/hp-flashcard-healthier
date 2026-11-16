import React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { Icon } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"

/** 16px checkbox; checked state fills with the primary yellow (Figma "Checkbox"). */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs border border-input bg-card focus-ring transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="absolute -inset-px"
      >
        <Icon name="checkbox-checked" className="size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
