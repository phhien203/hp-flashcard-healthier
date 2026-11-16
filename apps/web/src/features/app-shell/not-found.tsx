import { Link } from "@tanstack/react-router"

import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"

export function NotFound() {
  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>
          That page doesn’t exist. Let’s get you back to your cards.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="raised" asChild>
          <Link to="/study">Go to Study Mode</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
