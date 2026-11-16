import { MASTERY_THRESHOLD, isMastered } from "@workspace/core"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Icon } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"

/** "0/5" progress bar, or the teal "Mastered 5/5" chip once mastered. */
export function CardProgress({
  knownCount,
  className,
}: {
  knownCount: number
  className?: string
}) {
  if (isMastered({ knownCount })) {
    return (
      <Badge variant="success" className={className}>
        <Icon name="brain-solid" className="size-3" />
        <span>Mastered</span>
        <span>
          {knownCount}/{MASTERY_THRESHOLD}
        </span>
      </Badge>
    )
  }
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Progress
        value={knownCount}
        max={MASTERY_THRESHOLD}
        aria-label={`Progress: ${knownCount} of ${MASTERY_THRESHOLD}`}
      />
      <span className="text-preset-6 opacity-80">
        {knownCount}/{MASTERY_THRESHOLD}
      </span>
    </span>
  )
}
