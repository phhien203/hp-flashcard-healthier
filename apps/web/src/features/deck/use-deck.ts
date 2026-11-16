import React from "react"

import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"

import {
  deckEmptyReason,
  getCategoryCounts,
  getStats,
  newShuffleSeed,
  selectCards,
} from "@workspace/core"

import { cardsQueryOptions } from "@/lib/cards-query"
import { type DeckSearch, toDeckView } from "@/lib/deck-search.schema"

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

  const view = React.useMemo(() => toDeckView(search), [search])
  const visible = React.useMemo(() => selectCards(cards, view), [cards, view])
  const emptyReason = React.useMemo(
    () => deckEmptyReason(cards, view),
    [cards, view]
  )
  const stats = React.useMemo(() => getStats(cards), [cards])
  const categories = React.useMemo(() => {
    const counts = getCategoryCounts(cards)
    // A selected category whose last card was edited or deleted stays listed
    // (with 0) so it can still be unticked.
    const stale = (search.categories ?? [])
      .filter((name) => !counts.some((c) => c.name === name))
      .map((name) => ({ name, count: 0 }))
    return [...counts, ...stale]
  }, [cards, search.categories])

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

  return { cards, visible, emptyReason, stats, controls, search }
}

/** Drop default values so the URL stays clean. */
function compact(search: DeckSearch): DeckSearch {
  return {
    categories: search.categories?.length ? search.categories : undefined,
    hideMastered: search.hideMastered || undefined,
    shuffle: search.shuffle,
  }
}
