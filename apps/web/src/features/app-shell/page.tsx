import { cn } from "@workspace/ui/lib/utils"

/** Page frame: 1240px content column with the Figma 16/32/100px gutters. */
export function Page({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1304px] flex-col gap-8 px-4 pt-4 pb-16 sm:px-8 sm:pt-6",
        className
      )}
      {...props}
    />
  )
}
