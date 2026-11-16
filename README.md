# Flashcard

A flashcard study app built from the [Figma design](https://www.figma.com/design/pZCCWWCPe0epz7wH9f14ee/flashcard-app?node-id=299-771).

- **Study Mode** – flip cards, mark them known ("I Know This", 5× = mastered), reset progress, navigate with buttons or ← / →, and see live study statistics.
- **All Cards** – create cards (with validation), edit or delete them from the ⋮ menu, and load 12 more at a time.
- Shared filters: multi-select category dropdown, "Hide Mastered" and Shuffle.
- Progress is saved to `localStorage`. Responsive at mobile (375), tablet (768) and desktop (1440) breakpoints.

## Stack

Vite + React 19 + TypeScript, Tailwind CSS v4 (design tokens in `src/index.css`), Sonner for toasts, Vitest + Testing Library.

## Scripts

```bash
npm install
npm run dev        # start dev server
npm test           # run unit + integration tests
npm run build      # typecheck + production build
```

## Structure

```
src/
  lib/cards.ts          domain logic: stats, filters, progress, validation
  lib/store.ts          reducer + localStorage persistence
  lib/seed.ts           40-card starter deck (matches the Figma mock data)
  components/ui/        design-system primitives (Button, Checkbox, TextField, Dialog, badges)
  components/study/     Study Mode (StudyCard, StatsPanel, StudyView)
  components/cards/     All Cards (CardForm, CardTile, dialogs, AllCardsView)
  assets/icons/         SVGs exported from Figma
```
