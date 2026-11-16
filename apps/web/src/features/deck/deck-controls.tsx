import type { CategoryCount } from "@workspace/core"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Label } from "@workspace/ui/components/label"
import { Icon } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { useId } from "react"

export type DeckControlsProps = {
  categories: ReadonlyArray<CategoryCount>
  selectedCategories: ReadonlyArray<string>
  onSelectedCategoriesChange: (categories: string[]) => void
  hideMastered: boolean
  onHideMasteredChange: (hide: boolean) => void
  onShuffle: () => void
  className?: string
}

/** Category filter, "Hide Mastered" and "Shuffle", shared by both modes. */
export function DeckControls({
  categories,
  selectedCategories,
  onSelectedCategoriesChange,
  hideMastered,
  onHideMasteredChange,
  onShuffle,
  className,
}: DeckControlsProps) {
  const hideId = useId()
  const selected = new Set(selectedCategories)

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 sm:gap-x-5",
        className
      )}
    >
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {categoryLabel(selectedCategories)}
            <Icon name="angle-down" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-65" aria-label="Filter by category">
          <DropdownMenuGroup>
            {categories.map(({ name, count }) => (
              <DropdownMenuCheckboxItem
                key={name}
                checked={selected.has(name)}
                onCheckedChange={(checked) =>
                  onSelectedCategoriesChange(
                    checked
                      ? [...selectedCategories, name]
                      : selectedCategories.filter((c) => c !== name)
                  )
                }
              >
                <span className="flex min-w-0 gap-1">
                  <span className="truncate">{name}</span>
                  <span className="text-muted-foreground">({count})</span>
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2 max-sm:col-span-3 max-sm:row-start-2">
        <Checkbox
          id={hideId}
          checked={hideMastered}
          onCheckedChange={(checked) => onHideMasteredChange(checked === true)}
        />
        <Label htmlFor={hideId} className="cursor-pointer">
          Hide Mastered
        </Label>
      </div>

      <Button
        variant="outline"
        onClick={onShuffle}
        className="justify-self-end"
      >
        <Icon name="shuffle" />
        Shuffle
      </Button>
    </div>
  )
}

function categoryLabel(selected: ReadonlyArray<string>) {
  if (selected.length === 0) return "All Categories"
  if (selected.length === 1) return selected[0]
  return `${selected.length} Categories`
}
