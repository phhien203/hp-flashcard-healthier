import { Icon } from "@workspace/ui/icons"

/** Figma "Logo": yellow sticker badge plus the "Flashcard" wordmark (hidden on mobile). */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-10 items-center justify-center rounded-full panel-edge-2 bg-primary">
        <Icon name="logo-cards" />
      </span>
      <Icon name="logo-title" label="Flashcard" className="max-sm:hidden" />
    </span>
  )
}
