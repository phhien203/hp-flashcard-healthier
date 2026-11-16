import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@workspace/ui/lib/utils"

/**
 * Pill button from the Figma "Button" component set.
 *
 * - `default`   yellow primary with a hard sticker shadow ("I Know This", "Create Card")
 * - `raised`    white with a hard sticker shadow ("Reset Progress", "Load More")
 * - `outline`   flat white pill ("Shuffle", "Previous", category filter)
 * - `ghost`     borderless, used for icon-only menu triggers
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-border text-preset-4 whitespace-nowrap text-foreground focus-ring transition-[background-color,box-shadow,translate,opacity] duration-150 ease-out-strong select-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-hard-2 hover:shadow-[3px_3px_0_0_var(--border)] active:translate-x-px active:translate-y-px active:shadow-hard-1",
        raised:
          "bg-card shadow-hard-2 hover:shadow-[3px_3px_0_0_var(--border)] active:translate-x-px active:translate-y-px active:shadow-hard-1",
        outline:
          "bg-card hover:bg-muted hover:shadow-hard-1 active:translate-y-px aria-expanded:bg-muted",
        ghost:
          "border-transparent bg-transparent hover:bg-muted aria-expanded:border-border aria-expanded:bg-card aria-expanded:shadow-hard-1",
      },
      size: {
        default: "px-4 py-3",
        lg: "px-5 py-3",
        sm: "px-3 py-2 text-preset-5",
        icon: "size-10 p-0",
        "icon-sm": "size-8 rounded-sm p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
