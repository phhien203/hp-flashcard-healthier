import React from "react"

import { Toaster as Sonner, type ToasterProps } from "sonner"

import { Icon } from "@workspace/ui/icons"
import type { ResolvedTheme } from "@workspace/ui/lib/theme"

function useDocumentTheme(): ResolvedTheme {
  const [theme, setTheme] = React.useState<ResolvedTheme>(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
  )

  React.useLayoutEffect(() => {
    const root = document.documentElement
    const sync = () => {
      setTheme(root.classList.contains("dark") ? "dark" : "light")
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return theme
}

/**
 * Toast host styled after the Figma "Toast" component: a sticker pill with a
 * hard shadow and a close button. Trigger toasts with `toast()` from `sonner`.
 * Pass `theme` from the app. Stories omit it and follow the document class.
 */
function Toaster({ theme, ...props }: ToasterProps) {
  const documentTheme = useDocumentTheme()
  const resolved = theme === "light" || theme === "dark" ? theme : documentTheme

  return (
    <Sonner
      theme={resolved}
      position="bottom-center"
      closeButton
      gap={12}
      icons={{
        close: (
          <Icon name="close-toast" className="size-3.5 text-muted-foreground" />
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "relative flex w-[300px] max-w-[calc(100vw-2rem)] items-center justify-between gap-3 rounded-full border border-border bg-card px-4 py-2.5 font-sans text-preset-4 text-foreground shadow-toast",
          title: "flex-1",
          closeButton:
            "focus-ring order-last flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs text-muted-foreground",
        },
      }}
      style={{ fontFamily: "inherit" }}
      {...props}
    />
  )
}

export { Toaster }
