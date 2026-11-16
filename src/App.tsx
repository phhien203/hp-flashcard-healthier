import { useMemo, useState } from "react";
import { Toaster } from "sonner";
import { AllCardsView } from "./components/cards/AllCardsView";
import { FilterBar } from "./components/FilterBar";
import { Header, type View } from "./components/Header";
import { StudyView } from "./components/study/StudyView";
import { showToast } from "./components/Toast";
import { applyOrder, filterCards, getCategoryCounts } from "./lib/cards";
import { newCardId, useFlashcardStore } from "./lib/store";

export function App() {
  const [state, dispatch] = useFlashcardStore();
  const [view, setView] = useState<View>("study");

  const categories = useMemo(() => getCategoryCounts(state.cards), [state.cards]);
  const visibleCards = useMemo(
    () => applyOrder(filterCards(state.cards, state.filters), state.order),
    [state.cards, state.filters, state.order],
  );

  const filterBar = (
    <FilterBar
      categories={categories}
      selected={state.filters.categories}
      onSelectedChange={(selected) => dispatch({ type: "setCategories", categories: selected })}
      hideMastered={state.filters.hideMastered}
      onHideMasteredChange={(hideMastered) => dispatch({ type: "setHideMastered", hideMastered })}
      onShuffle={() => dispatch({ type: "shuffle" })}
      wideGap={view === "all"}
    />
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col gap-6 px-4 pt-4 pb-10 sm:gap-6 sm:px-8 sm:pt-5 lg:gap-8 lg:px-[100px] lg:pt-6">
      <Header view={view} onViewChange={setView} />

      <main className="w-full">
        <h1 className="sr-only">{view === "study" ? "Study Mode" : "All Cards"}</h1>
        {view === "study" ? (
          <StudyView
            allCards={state.cards}
            cards={visibleCards}
            filterBar={filterBar}
            hasCategoryFilter={state.filters.categories.length > 0}
            onMarkKnown={(id) => dispatch({ type: "markKnown", id })}
            onResetProgress={(id) => dispatch({ type: "resetProgress", id })}
            onGoToAllCards={() => setView("all")}
          />
        ) : (
          <AllCardsView
            allCards={state.cards}
            cards={visibleCards}
            filterBar={filterBar}
            onCreate={(input) => {
              dispatch({ type: "create", input, id: newCardId() });
              showToast("Card created successfully.");
            }}
            onUpdate={(id, input) => {
              dispatch({ type: "update", id, input });
              showToast("Card updated successfully.");
            }}
            onDelete={(id) => {
              dispatch({ type: "delete", id });
              showToast("Card deleted.");
            }}
          />
        )}
      </main>

      <Toaster
        position="top-right"
        offset={{ top: 116, right: 60 }}
        mobileOffset={{ top: 80, left: 16, right: 16 }}
        toastOptions={{ unstyled: true }}
        duration={4000}
      />
    </div>
  );
}
