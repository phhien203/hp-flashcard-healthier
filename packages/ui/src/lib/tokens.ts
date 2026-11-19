/**
 * Figma palette for consumers that cannot read CSS variables (Clerk's
 * `appearance.variables`, the `theme-color` meta tag). Mirrors the `--fc-*`
 * variables in `styles/globals.css`; `tokens.test.ts` keeps the two in sync.
 *
 * `themeColors` is the semantic layer (page, card, text, danger, links).
 * The same hex values are written into `globals.css`. Primitives stay the
 * light Figma colors in both themes so candy card faces and the dialog
 * scrim are not inverted.
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

/** Ink that stays dark on yellow, pink, blue and teal sticker faces. */
export const ink = palette["neutral-900"]

export const themeColors = {
  light: {
    background: palette["neutral-100"],
    foreground: palette["neutral-900"],
    card: palette["neutral-0"],
    muted: palette["neutral-100"],
    mutedForeground: palette["neutral-600"],
    /** Darkened from pink/700 so 12px error text clears 4.5:1 on the page. */
    destructive: "#c41256",
    border: palette["neutral-900"],
    primary: palette["yellow-500"],
    primaryForeground: ink,
    ring: palette["blue-600"],
    /** Sign-in / sign-up links. Yellow on white is about 1.54:1. */
    link: "#2450b2",
    themeColor: palette["neutral-100"],
  },
  dark: {
    background: "#1a100b",
    foreground: "#f7f3f0",
    card: "#2c1c14",
    muted: "#3a281c",
    mutedForeground: "#d4c4b4",
    destructive: "#ff8ab5",
    border: "#f6efe8",
    primary: palette["yellow-500"],
    primaryForeground: ink,
    ring: palette["blue-400"],
    link: palette["blue-400"],
    themeColor: "#1a100b",
  },
} as const

const fontFamily = "Poppins, ui-sans-serif, system-ui, sans-serif"

const linkStyle = {
  color: "var(--link)",
  "&:hover": { color: "var(--link)" },
  "&:focus": { color: "var(--link)" },
  "&:focus-visible": { color: "var(--link)" },
} as const

/**
 * Clerk's base theme draws the field edge as a translucent box-shadow and
 * sets `border-width: 0` on `&[data-variant="default"]` (buttons use
 * `outline`, the select search uses `unstyled`). That attribute selector
 * beats a `box-shadow: none` on the element, so the shadow stays and a
 * `border-color` never paints. Repeat the solid border at the same
 * specificity, including hover and focus, and give it a real width.
 * `--border` on the card clears 3:1 in both themes; focus uses `--ring`.
 */
const restBorder = {
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "var(--border)",
  boxShadow: "none",
} as const

const focusBorder = {
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "var(--ring)",
  boxShadow: "none",
} as const

const fieldFocus =
  '&:focus, &:focus-visible, &:focus-within, &[data-focus-within="true"]'

const fieldVariant =
  '&[data-variant="default"], &[data-variant="outline"], &[data-variant="unstyled"]'

const fieldBorder = {
  ...restBorder,
  "&:hover": restBorder,
  [fieldFocus]: focusBorder,
  [fieldVariant]: {
    ...restBorder,
    "&:hover": restBorder,
    [fieldFocus]: focusBorder,
  },
} as const

/**
 * Clerk sign-in / sign-up / user menu. Colors point at the semantic CSS
 * variables, so the pre-paint theme class restyles Clerk without waiting for
 * hydration. Text links use `--link` rather than the yellow primary, which
 * fails WCAG AA as text on white.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorForeground: "var(--foreground)",
    colorMutedForeground: "var(--muted-foreground)",
    colorMuted: "var(--muted)",
    colorNeutral: "var(--border)",
    colorBackground: "var(--card)",
    colorInput: "var(--card)",
    colorInputForeground: "var(--foreground)",
    colorBorder: "var(--border)",
    colorDanger: "var(--destructive)",
    colorRing: "var(--ring)",
    fontFamily,
    borderRadius: "12px",
  },
  elements: {
    footerActionLink: linkStyle,
    formFieldAction: linkStyle,
    formResendCodeLink: linkStyle,
    identityPreviewEditButton: linkStyle,
    formFieldInput: fieldBorder,
    otpCodeFieldInput: fieldBorder,
    phoneInputBox: fieldBorder,
    selectButton: fieldBorder,
    selectSearchInput: fieldBorder,
    formButtonPrimary: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      "&:hover": {
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
      },
      "&:focus": {
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
      },
    },
  },
} as const
