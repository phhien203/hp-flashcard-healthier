import {
  getCategoryCounts,
  getStats,
  newShuffleSeed,
  selectCards,
} from "@workspace/core"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useMemo } from "react"
import { cardsQueryOptions } from "../../lib/cards-query"
import { toDeckView, type DeckSearch } from "../../lib/deck-search"
import type { DeckControlsProps } from "./deck-controls"

const appRoute = getRouteApi("/_app")

/**
 * The deck as seen through the URL filters: the visible cards in display
 * order, whole-deck statistics, category options and the control handlers.
 */
export function useDeck() {
  const { data: cards } = useSuspenseQuery(cardsQueryOptions)
  const search = appRoute.useSearch()
  const navigate = appRoute.useNavigate()

  const visible = useMemo(
    () => selectCards(cards, toDeckView(search)),
    [cards, search]
  )
  const stats = useMemo(() => getStats(cards), [cards])
  const categories = useMemo(() => getCategoryCounts(cards), [cards])

  const setSearch = (patch: Partial<DeckSearch>) =>
    void navigate({
      to: ".",
      search: (prev) => compact({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    })

  const controls: Omit<DeckControlsProps, "className"> = {
    categories,
    selectedCategories: search.categories ?? [],
    onSelectedCategoriesChange: (selected) =>
      setSearch({ categories: selected }),
    hideMastered: search.hideMastered ?? false,
    onHideMasteredChange: (hideMastered) => setSearch({ hideMastered }),
    onShuffle: () => setSearch({ shuffle: newShuffleSeed() }),
  }

  return { cards, visible, stats, controls, search }
}

/** Drop default values so the URL stays clean. */
function compact(search: DeckSearch): DeckSearch {
  return {
    categories: search.categories?.length ? search.categories : undefined,
    hideMastered: search.hideMastered || undefined,
    shuffle: search.shuffle,
  }
}
