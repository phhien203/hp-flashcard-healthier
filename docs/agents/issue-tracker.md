# Issue tracker: GitHub

Issues and specs live in phhien203/hp-flashcard-healthier.
Use the gh CLI from this repository.

## Conventions

- Before creating issues, verify the target with
  `gh repo view --json nameWithOwner`.
- Create: `gh issue create --title "..." --body-file <file>`.
- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list --state open --json number,title,body,labels`.
- Comment: `gh issue comment <number> --body "..."`.
- Labels: `gh issue edit <number> --add-label "..."` or
  `--remove-label "..."`.
- Close: post an explanation, then run `gh issue close <number>`.

Use native GitHub sub-issues and issue dependencies when available.
Otherwise, put `Part of #<parent>` and `Blocked by: #<number>` at the
top of child issue bodies, and list children in the parent's task list.
An issue is startable when every blocker is closed.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Skill operations

- "Publish to the issue tracker": create a GitHub issue.
- "Fetch the relevant ticket": read the GitHub issue.

## Wayfinding operations

- Map: one issue labelled `wayfinder:map`, with Notes,
  Decisions-so-far, and Fog sections.
- Tickets: child issues labelled `wayfinder:<type>`, where type is
  research, prototype, grilling, or task.
- Frontier: the first open child in map order with no open blocker
  and no assignee.
- Claim: `gh issue edit <number> --add-assignee @me`.
- Resolve: comment with the answer, close the ticket, then append
  a summary and link to the map's Decisions-so-far.
