import { Toaster as Sonner, type ToasterProps } from "sonner"

import { Icon } from "@workspace/ui/icons"

/**
 * Toast host styled after the Figma "Toast" component: a white pill with a
 * hard shadow and a close button. Trigger toasts with `toast()` from `sonner`.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      closeButton
      gap={12}
      icons={{ close: <Icon name="close-toast" /> }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "relative flex w-[300px] max-w-[calc(100vw-2rem)] items-center justify-between gap-3 rounded-full border border-border bg-card px-4 py-2.5 font-sans text-preset-4 text-foreground shadow-toast",
          title: "flex-1",
          closeButton:
            "focus-ring order-last flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs text-foreground [&>svg]:size-3.5",
        },
      }}
      style={{ fontFamily: "inherit" }}
      {...props}
    />
  )
}

export { Toaster }
