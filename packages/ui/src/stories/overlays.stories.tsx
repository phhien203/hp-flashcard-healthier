import React from "react"

import { toast } from "sonner"
import { expect, screen, waitFor } from "storybook/test"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Toaster } from "@workspace/ui/components/sonner"
import { Icon } from "@workspace/ui/icons"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = { title: "Components/Overlays" } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const EditDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="raised">Edit card</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit your card</DialogTitle>
          <DialogDescription>
            Change the question, answer or category.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="lg">Update Card</Button>
        </div>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit card" }))
    const dialog = await screen.findByRole("dialog", { name: "Edit your card" })
    await waitFor(() => expect(dialog).toBeVisible())
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  },
}

export const DeleteConfirmation: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="raised">Delete card</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this card?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-semibold">
            Cancel
          </AlertDialogCancel>
          <Button className="font-semibold">Delete Card</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete card" }))
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete this card?",
    })
    await expect(dialog).toHaveAccessibleDescription(
      "This action can’t be undone."
    )
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  },
}

const CATEGORIES = [
  ["Art", 1],
  ["CSS", 6],
  ["Geography", 4],
  ["JavaScript", 14],
] as const

function CategoryMenu() {
  const [selected, setSelected] = React.useState<string[]>(["CSS"])
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          All Categories
          <Icon name="angle-down" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-65">
        <DropdownMenuGroup>
          {CATEGORIES.map(([name, count]) => (
            <DropdownMenuCheckboxItem
              key={name}
              checked={selected.includes(name)}
              onCheckedChange={(on) =>
                setSelected((s) =>
                  on ? [...s, name] : s.filter((x) => x !== name)
                )
              }
            >
              {name}
              <span className="text-muted-foreground">({count})</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const CategoryFilter: Story = {
  render: () => <CategoryMenu />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "All Categories" })
    )
    const art = await screen.findByRole("menuitemcheckbox", { name: /Art/ })
    await expect(art).toHaveAttribute("aria-checked", "false")
    await userEvent.click(art)
    // The menu stays open so several categories can be picked in a row.
    await expect(
      screen.getByRole("menuitemcheckbox", { name: /Art/ })
    ).toHaveAttribute("aria-checked", "true")
  },
}

export const CardActionsMenu: Story = {
  render: () => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Card actions">
          <Icon name="dots" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-35">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icon name="edit" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon name="trash" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const Toasts: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex min-h-80 items-start justify-center gap-3 p-6">
      <Button
        variant="raised"
        onClick={() => toast("Card created successfully.")}
      >
        Created
      </Button>
      <Button
        variant="raised"
        onClick={() => toast("Card updated successfully.")}
      >
        Updated
      </Button>
      <Button variant="raised" onClick={() => toast("Card deleted.")}>
        Deleted
      </Button>
      <Toaster />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Created" }))
    const toastText = await screen.findByText("Card created successfully.")
    await waitFor(() => expect(toastText).toBeVisible())
  },
}
