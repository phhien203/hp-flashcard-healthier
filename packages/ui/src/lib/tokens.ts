/**
 * Figma palette for consumers that cannot read CSS variables (Clerk's
 * `appearance.variables`, the `theme-color` meta tag). Mirrors the `--fc-*`
 * variables in `styles/globals.css`; `tokens.test.ts` keeps the two in sync.
 */
export const palette = {
  "neutral-0": "#ffffff",
  "neutral-100": "#f7f3f0",
  "neutral-600": "#6d5b4d",
  "neutral-900": "#2e1401",
  "yellow-500": "#f8cb46",
  "blue-400": "#92adeb",
  "blue-600": "#5072c7",
  "teal-400": "#47d9c9",
  "pink-400": "#fc8ae5",
  "pink-500": "#f073a3",
  "pink-700": "#e11966",
} as const

/** Clerk sign-in / sign-up / user menu themed with the design tokens. */
export const clerkAppearance = {
  variables: {
    colorPrimary: palette["yellow-500"],
    colorPrimaryForeground: palette["neutral-900"],
    colorForeground: palette["neutral-900"],
    colorMutedForeground: palette["neutral-600"],
    colorBackground: palette["neutral-0"],
    colorInput: palette["neutral-0"],
    colorBorder: palette["neutral-900"],
    colorDanger: palette["pink-700"],
    colorRing: palette["blue-600"],
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "12px",
  },
} as const
