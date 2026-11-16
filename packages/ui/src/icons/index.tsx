/**
 * SVG assets exported from the Figma file. Rendered as <img> so the
 * artwork stays byte-for-byte identical to the design; every icon keeps its
 * intrinsic Figma size via the `width`/`height` below.
 */
import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

import angleDownUrl from "../assets/icons/angle-down.svg"
import angleLeftUrl from "../assets/icons/angle-left.svg"
import angleRightUrl from "../assets/icons/angle-right.svg"
import brainSolidUrl from "../assets/icons/brain-solid.svg"
import checkCircleUrl from "../assets/icons/check-circle.svg"
import checkboxCheckedUrl from "../assets/icons/checkbox-checked.svg"
import circlePlusUrl from "../assets/icons/circle-plus.svg"
import closeUrl from "../assets/icons/close.svg"
import closeToastUrl from "../assets/icons/close-toast.svg"
import dotsUrl from "../assets/icons/dots.svg"
import editUrl from "../assets/icons/edit.svg"
import errorUrl from "../assets/icons/error.svg"
import logoCardsUrl from "../assets/icons/logo-cards.svg"
import logoTitleUrl from "../assets/icons/logo-title.svg"
import patternUrl from "../assets/icons/pattern.svg"
import shuffleUrl from "../assets/icons/shuffle.svg"
import sparkleBlueUrl from "../assets/icons/sparkle-blue.svg"
import sparklePinkUrl from "../assets/icons/sparkle-pink.svg"
import sparkleYellowUrl from "../assets/icons/sparkle-yellow.svg"
import statInProgressUrl from "../assets/icons/stat-in-progress.svg"
import statMasteredUrl from "../assets/icons/stat-mastered.svg"
import statNotStartedUrl from "../assets/icons/stat-not-started.svg"
import statTotalUrl from "../assets/icons/stat-total.svg"
import trashUrl from "../assets/icons/trash.svg"
import undoUrl from "../assets/icons/undo.svg"

const icons = {
  "angle-down": { src: angleDownUrl, width: 16, height: 16 },
  "angle-left": { src: angleLeftUrl, width: 16, height: 16 },
  "angle-right": { src: angleRightUrl, width: 16, height: 16 },
  "brain-solid": { src: brainSolidUrl, width: 16, height: 16 },
  "check-circle": { src: checkCircleUrl, width: 16, height: 16 },
  "checkbox-checked": { src: checkboxCheckedUrl, width: 16, height: 16 },
  "circle-plus": { src: circlePlusUrl, width: 16, height: 16 },
  close: { src: closeUrl, width: 16, height: 16 },
  "close-toast": { src: closeToastUrl, width: 16, height: 16 },
  dots: { src: dotsUrl, width: 3.375, height: 14.0625 },
  edit: { src: editUrl, width: 16, height: 16 },
  error: { src: errorUrl, width: 14, height: 15 },
  "logo-cards": { src: logoCardsUrl, width: 20.7692, height: 20 },
  "logo-title": { src: logoTitleUrl, width: 106.92, height: 17.76 },
  pattern: { src: patternUrl, width: 776.539, height: 527.572 },
  shuffle: { src: shuffleUrl, width: 16, height: 16 },
  "sparkle-blue": { src: sparkleBlueUrl, width: 24.3, height: 25.125 },
  "sparkle-pink": { src: sparklePinkUrl, width: 24.3, height: 25.125 },
  "sparkle-yellow": { src: sparkleYellowUrl, width: 32.4, height: 33.5 },
  "stat-in-progress": { src: statInProgressUrl, width: 30, height: 24 },
  "stat-mastered": { src: statMasteredUrl, width: 25.4558, height: 24 },
  "stat-not-started": { src: statNotStartedUrl, width: 27, height: 18 },
  "stat-total": { src: statTotalUrl, width: 24, height: 23.9883 },
  trash: { src: trashUrl, width: 16, height: 16 },
  undo: { src: undoUrl, width: 16, height: 16 },
} as const

export type IconName = keyof typeof icons
export const iconNames = Object.keys(icons) as IconName[]

/**
 * Decorative Figma icon. Pass `label` only when the icon is the sole content
 * of its control; otherwise it is hidden from assistive technology.
 */
export function Icon({
  name,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"img">, "src" | "alt" | "width" | "height"> & {
  name: IconName
  label?: string
}) {
  const { src, width, height } = icons[name]
  return (
    <img
      data-slot="icon"
      src={src}
      width={width}
      height={height}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      className={cn("pointer-events-none shrink-0 select-none", className)}
      {...props}
    />
  )
}
