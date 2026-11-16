import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { DeckControls } from "@/features/deck/deck-controls"
import { useDeck } from "@/features/deck/use-deck"
import { StatsPanel } from "@/features/study/stats-panel"
import { StudySession } from "@/features/study/study-session"
import { useRecordProgress } from "@/lib/cards-query"

export const Route = createFileRoute("/_app/study")({
  head: () => ({ meta: [{ title: "Study Mode · Flashcard" }] }),
  component: StudyMode,
})

function StudyMode() {
  const { visible, emptyReason, stats, controls, search } = useDeck()
  const progress = useRecordProgress()

  return (
    <>
      <h1 className="sr-only">Study Mode</h1>
      <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_392px]">
        <section
          aria-label="Flashcards"
          className="flex flex-col overflow-hidden rounded-xl panel-edge-3 bg-card"
        >
          <DeckControls {...controls} className="p-4 sm:p-5" />
          <Separator />
          <StudySession
            // A new filter or shuffle starts the session again from card 1.
            key={JSON.stringify(search)}
            cards={visible}
            emptyReason={emptyReason ?? "no-cards"}
            onProgress={(id, action) => progress.mutate({ id, action })}
            emptyAction={
              <Button variant="raised" asChild>
                <Link to="/cards" search={true}>
                  Go to All Cards
                </Link>
              </Button>
            }
          />
        </section>
        <StatsPanel stats={stats} className="lg:min-h-[634px]" />
      </div>
    </>
  )
}
