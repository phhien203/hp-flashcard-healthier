/**
 * SVG assets exported from the Figma file.
 *
 * Monochrome icons are inlined with `fill="currentColor"` so they follow the
 * surrounding text color (cream on night paper, ink on yellow and candy
 * faces). Decorative multi-color artwork stays an `<img>` so its gradients
 * and filters stay byte-for-byte identical to the export.
 */
import React from "react"

import angleDown from "@workspace/ui/assets/icons/angle-down.svg?raw"
import angleLeft from "@workspace/ui/assets/icons/angle-left.svg?raw"
import angleRight from "@workspace/ui/assets/icons/angle-right.svg?raw"
import brainSolid from "@workspace/ui/assets/icons/brain-solid.svg?raw"
import checkCircle from "@workspace/ui/assets/icons/check-circle.svg?raw"
import checkboxChecked from "@workspace/ui/assets/icons/checkbox-checked.svg?raw"
import circlePlus from "@workspace/ui/assets/icons/circle-plus.svg?raw"
import closeToast from "@workspace/ui/assets/icons/close-toast.svg?raw"
import close from "@workspace/ui/assets/icons/close.svg?raw"
import dots from "@workspace/ui/assets/icons/dots.svg?raw"
import edit from "@workspace/ui/assets/icons/edit.svg?raw"
import error from "@workspace/ui/assets/icons/error.svg?raw"
import logoCards from "@workspace/ui/assets/icons/logo-cards.svg?raw"
import logoTitle from "@workspace/ui/assets/icons/logo-title.svg?raw"
import patternUrl from "@workspace/ui/assets/icons/pattern.svg"
import shuffle from "@workspace/ui/assets/icons/shuffle.svg?raw"
import sparkleBlueUrl from "@workspace/ui/assets/icons/sparkle-blue.svg"
import sparklePinkUrl from "@workspace/ui/assets/icons/sparkle-pink.svg"
import sparkleYellowUrl from "@workspace/ui/assets/icons/sparkle-yellow.svg"
import statInProgress from "@workspace/ui/assets/icons/stat-in-progress.svg?raw"
import statMastered from "@workspace/ui/assets/icons/stat-mastered.svg?raw"
import statNotStarted from "@workspace/ui/assets/icons/stat-not-started.svg?raw"
import statTotal from "@workspace/ui/assets/icons/stat-total.svg?raw"
import trash from "@workspace/ui/assets/icons/trash.svg?raw"
import undo from "@workspace/ui/assets/icons/undo.svg?raw"
import { cn } from "@workspace/ui/lib/utils"

const INK_FILL = /fill="(?:#2[Ee]1401|#6[Dd]5[Bb]4[Dd]|#E11966|#e11966|black)"/g

function toInk(svg: string) {
  return svg.replace(INK_FILL, 'fill="currentColor"')
}

/** Drop the Figma export's `display:block` and non-uniform scaling. */
function prepareSvg(svg: string) {
  return svg
    .replace(/\sstyle="[^"]*"/g, "")
    .replace(/\spreserveAspectRatio="none"/g, "")
}

/**
 * Pin the export's own width and height so a parent rule like
 * `[&_svg:not([class*='size-'])]:size-4` cannot stretch a non-square icon
 * (the card-actions dots are 3.375×14). A caller that passes `size-*` keeps
 * control, and the aspect ratio is preserved because `none` was removed.
 */
function lockIntrinsicSize(svg: string, className: string | undefined) {
  if (className?.includes("size-")) return ""
  const width = /\swidth="([\d.]+)"/.exec(svg)?.[1]
  const height = /\sheight="([\d.]+)"/.exec(svg)?.[1]
  if (!width || !height) return ""
  return ` style="width:${width}px;height:${height}px"`
}

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
}

/** Give each inline copy its own ids so two logos on one page don't share a clip. */
function uniquify(svg: string, prefix: string) {
  return svg
    .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${prefix}${id})`)
    .replace(/href="#([^"]+)"/g, (_, id: string) => `href="#${prefix}${id}"`)
}

const ink = {
  "angle-down": toInk(angleDown),
  "angle-left": toInk(angleLeft),
  "angle-right": toInk(angleRight),
  "brain-solid": toInk(brainSolid),
  "check-circle": toInk(checkCircle),
  "checkbox-checked": toInk(checkboxChecked),
  "circle-plus": toInk(circlePlus),
  close: toInk(close),
  "close-toast": toInk(closeToast),
  dots: toInk(dots),
  edit: toInk(edit),
  error: toInk(error),
  "logo-cards": toInk(logoCards),
  "logo-title": toInk(logoTitle),
  shuffle: toInk(shuffle),
  "stat-in-progress": toInk(statInProgress),
  "stat-mastered": toInk(statMastered),
  "stat-not-started": toInk(statNotStarted),
  "stat-total": toInk(statTotal),
  trash: toInk(trash),
  undo: toInk(undo),
} as const

const images = {
  pattern: { src: patternUrl, width: 776.539, height: 527.572 },
  "sparkle-blue": { src: sparkleBlueUrl, width: 24.3, height: 25.125 },
  "sparkle-pink": { src: sparklePinkUrl, width: 24.3, height: 25.125 },
  "sparkle-yellow": { src: sparkleYellowUrl, width: 32.4, height: 33.5 },
} as const

export type IconName = keyof typeof ink | keyof typeof images
export const iconNames = [
  ...Object.keys(ink),
  ...Object.keys(images),
] as IconName[]

type IconProps = {
  name: IconName
  /** Set only when the icon is the sole content of its control. */
  label?: string
  className?: string
}

/**
 * Decorative Figma icon. Pass `label` only when the icon is the sole content
 * of its control; otherwise it is hidden from assistive technology.
 */
export function Icon({ name, label, className }: IconProps) {
  const clipId = React.useId().replaceAll(":", "")
  const image = name in images ? images[name as keyof typeof images] : null
  if (image) {
    return (
      <img
        data-slot="icon"
        src={image.src}
        width={image.width}
        height={image.height}
        alt={label ?? ""}
        aria-hidden={label ? undefined : true}
        draggable={false}
        className={cn("pointer-events-none shrink-0 select-none", className)}
      />
    )
  }

  const aria = label
    ? `role="img" aria-label="${escapeAttr(label)}"`
    : `aria-hidden="true"`
  const prepared = uniquify(prepareSvg(ink[name as keyof typeof ink]), clipId)
  const svg = prepared.replace(
    "<svg ",
    `<svg data-slot="icon" focusable="false" class="${escapeAttr(
      cn("pointer-events-none shrink-0 select-none", className)
    )}" ${aria}${lockIntrinsicSize(prepared, className)} `
  )

  return <span className="contents" dangerouslySetInnerHTML={{ __html: svg }} />
}
