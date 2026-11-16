import "../styles/globals.css"

// Load every Poppins weight before the first test so text has real metrics
// and nothing reflows when the web font swaps in mid-test.
await Promise.all(
  [400, 500, 600, 700].map((weight) =>
    document.fonts.load(`${weight} 16px Poppins`, "Flashcard 0123456789")
  )
)
