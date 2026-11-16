import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";
import { App } from "./App";

beforeAll(() => {
  // jsdom doesn't implement <dialog> modal APIs.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
});

const stat = (label: string) => screen.getByText(label, { selector: "dt" }).nextElementSibling?.textContent;

describe("Study Mode", () => {
  it("shows the first card, flips it, and navigates", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("What does HTML stand for?")).toBeInTheDocument();
    expect(screen.getByText("Card 1 of 40")).toBeInTheDocument();

    await user.click(screen.getByText("Click to reveal answer"));
    expect(screen.getByText("HyperText Markup Language")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next card" }));
    expect(screen.getByText("Card 2 of 40")).toBeInTheDocument();
    expect(screen.getByText("Click to reveal answer")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous card" }));
    await user.click(screen.getByRole("button", { name: "Previous card" }));
    expect(screen.getByText("Card 40 of 40")).toBeInTheDocument();
  });

  it("tracks progress to mastery and updates statistics", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(stat("Mastered")).toBe("11");
    expect(stat("Not Started")).toBe("8");

    const know = screen.getByRole("button", { name: /I Know This/ });
    await user.click(know);
    expect(stat("Not Started")).toBe("7");
    expect(stat("In Progress")).toBe("22");

    for (let i = 0; i < 4; i++) await user.click(screen.getByRole("button", { name: /I Know This/ }));
    expect(screen.getByRole("button", { name: /Already Mastered/ })).toBeDisabled();
    expect(stat("Mastered")).toBe("12");

    await user.click(screen.getByRole("button", { name: /Reset Progress/ }));
    expect(stat("Mastered")).toBe("11");
    expect(stat("Not Started")).toBe("8");
  });

  it("filters by category and hides mastered cards", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /All Categories/ }));
    await user.click(screen.getByRole("checkbox", { name: /Geography/ }));
    expect(screen.getByText("Card 1 of 4")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Hide Mastered" }));
    expect(screen.getByText("Card 1 of 3")).toBeInTheDocument();
  });
});

describe("All Cards", () => {
  it("validates, creates, edits and deletes a card", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "All Cards" }));

    // Validation
    await user.click(screen.getByRole("button", { name: /Create Card/ }));
    expect(screen.getByText("Please enter a question.")).toBeInTheDocument();
    expect(screen.getByText("Please enter an answer.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a category.")).toBeInTheDocument();

    // Create
    await user.type(screen.getByLabelText("Question"), "What is 2 + 2?");
    await user.type(screen.getByLabelText("Answer"), "4");
    await user.type(screen.getByLabelText("Category"), "Mathematics");
    await user.click(screen.getByRole("button", { name: /Create Card/ }));
    expect(screen.queryByText("Please enter a question.")).not.toBeInTheDocument();
    expect(await screen.findByText("Card created successfully.")).toBeInTheDocument();
    const newCard = screen.getByRole("heading", { name: "What is 2 + 2?" }).closest("article")!;
    expect(screen.getByLabelText("Question")).toHaveValue("");

    // Edit
    await user.click(within(newCard).getByRole("button", { name: /Actions for/ }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    const editDialog = screen.getByRole("dialog", { name: "Edit your card" });
    const answer = within(editDialog).getByLabelText("Answer");
    await user.clear(answer);
    await user.type(answer, "Four");
    await user.click(within(editDialog).getByRole("button", { name: "Update Card" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(within(newCard).getByText("Four")).toBeInTheDocument();
    expect(await screen.findByText("Card updated successfully.")).toBeInTheDocument();

    // Delete
    await user.click(within(newCard).getByRole("button", { name: /Actions for/ }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete Card" }));
    expect(screen.queryByRole("heading", { name: "What is 2 + 2?" })).not.toBeInTheDocument();
    expect(await screen.findByText("Card deleted.")).toBeInTheDocument();
  });

  it("paginates 12 cards at a time", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "All Cards" }));
    const list = screen.getByRole("list", { name: "Flashcards" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(12);
    await user.click(screen.getByRole("button", { name: "Load More" }));
    expect(within(list).getAllByRole("listitem")).toHaveLength(24);
  });

  it("persists progress across reloads", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole("button", { name: /I Know This/ }));
    unmount();
    render(<App />);
    expect(stat("Not Started")).toBe("7");
  });
});
