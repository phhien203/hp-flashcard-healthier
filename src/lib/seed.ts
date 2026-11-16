import type { Card } from "./cards";

type SeedRow = [question: string, answer: string, category: string, knownCount: number];

/**
 * Starter deck shown on first launch. Category counts and progress
 * mirror the Figma mock (40 cards: 11 mastered, 21 in progress, 8 not started).
 */
const rows: SeedRow[] = [
  // Web Development (5)
  ["What does HTML stand for?", "HyperText Markup Language", "Web Development", 0],
  ["What does CSS stand for?", "Cascading Style Sheets", "Web Development", 0],
  ["What does DOM stand for?", "Document Object Model", "Web Development", 3],
  ["What does HTTP stand for?", "HyperText Transfer Protocol", "Web Development", 2],
  ["What is a REST API?", "An architectural style for web services that uses standard HTTP methods to work with resources identified by URLs.", "Web Development", 5],

  // JavaScript (14)
  ["What is the difference between 'let' and 'const' in JavaScript?", "'let' allows you to reassign the variable, while 'const' creates a constant reference that cannot be reassigned. Both are block-scoped.", "JavaScript", 2],
  ["What is a closure in JavaScript?", "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.", "JavaScript", 1],
  ["What is the difference between '==' and '===' in JavaScript?", "'==' checks for value equality with type coercion, while '===' checks for both value and type equality (strict equality).", "JavaScript", 4],
  ["What is the purpose of the 'async' keyword in JavaScript?", "The 'async' keyword declares an asynchronous function that returns a Promise and allows the use of 'await' inside it.", "JavaScript", 2],
  ["What is a Promise?", "An object representing the eventual completion or failure of an asynchronous operation and its resulting value.", "JavaScript", 3],
  ["What does 'typeof null' return?", "\"object\" — a long-standing quirk of the language.", "JavaScript", 5],
  ["What is event bubbling?", "When an event fires on an element, it then runs handlers on its parent, then its grandparent, and so on up the DOM tree.", "JavaScript", 1],
  ["What does Array.prototype.map return?", "A new array containing the results of calling the callback on every element.", "JavaScript", 5],
  ["What is hoisting?", "JavaScript's behaviour of moving declarations to the top of their scope before code runs.", "JavaScript", 2],
  ["What is the difference between null and undefined?", "undefined means a variable has been declared but not assigned; null is an explicit \"no value\".", "JavaScript", 4],
  ["What does the spread operator (...) do?", "It expands an iterable (like an array or object) into individual elements or properties.", "JavaScript", 3],
  ["What is the event loop?", "The mechanism that lets JavaScript run asynchronous callbacks by processing the task and microtask queues when the call stack is empty.", "JavaScript", 1],
  ["What is 'this' inside an arrow function?", "Arrow functions don't have their own 'this'; they use the 'this' of the enclosing scope.", "JavaScript", 2],
  ["What does JSON stand for?", "JavaScript Object Notation", "JavaScript", 5],

  // CSS (6)
  ["What is Flexbox used for in CSS?", "Flexbox is a CSS layout model that helps distribute space and align items in a container, making it easier to create responsive layouts.", "CSS", 0],
  ["What is the CSS box model?", "Every element is a box made of content, padding, border and margin.", "CSS", 3],
  ["What does 'position: sticky' do?", "The element behaves as relative until it crosses a scroll threshold, then sticks like fixed within its container.", "CSS", 1],
  ["What is specificity in CSS?", "The weight the browser uses to decide which rule wins when several rules target the same element.", "CSS", 2],
  ["What is CSS Grid?", "A two-dimensional layout system for arranging content in rows and columns.", "CSS", 5],
  ["What does 'rem' stand for?", "Root em — a unit relative to the root element's font size.", "CSS", 5],

  // HTML (3)
  ["What is the purpose of the alt attribute on images?", "It provides a text alternative for screen readers and when the image fails to load.", "HTML", 2],
  ["Which element is used for the largest heading?", "<h1>", "HTML", 5],
  ["What is semantic HTML?", "Using elements that describe their meaning (like <nav>, <article>, <main>) instead of generic <div>s.", "HTML", 1],

  // Geography (4)
  ["What is the capital of France?", "Paris", "Geography", 5],
  ["What is the longest river in the world?", "The Nile (with the Amazon a close contender).", "Geography", 0],
  ["What is the largest ocean on Earth?", "The Pacific Ocean", "Geography", 3],
  ["What is the capital of Japan?", "Tokyo", "Geography", 0],

  // Science (3)
  ["What is the chemical symbol for gold?", "Au", "Science", 5],
  ["What planet is known as the Red Planet?", "Mars", "Science", 2],
  ["What is the powerhouse of the cell?", "The mitochondria", "Science", 0],

  // One each
  ["Who painted the Mona Lisa?", "Leonardo da Vinci", "Art", 0],
  ["In what year did World War II end?", "1945", "History", 1],
  ["Who wrote 'Romeo and Juliet'?", "William Shakespeare", "Literature", 5],
  ["What is the Pythagorean theorem?", "In a right triangle, a² + b² = c², where c is the hypotenuse", "Mathematics", 5],
  ["What is recursion?", "A technique where a function calls itself to solve smaller instances of the same problem.", "Programming Concepts", 0],
];

export const seedCards: Card[] = rows.map(([question, answer, category, knownCount], i) => ({
  id: `seed-${i + 1}`,
  question,
  answer,
  category,
  knownCount,
}));
