import React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { controlClassName } from "@workspace/ui/components/input"

/** Multi-line text field from the Figma "Textarea" component. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(controlClassName, "min-h-25 resize-y", className)}
      {...props}
    />
  )
}

export { Textarea }
