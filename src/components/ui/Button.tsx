import type { ButtonHTMLAttributes, ReactNode } from "react";

// Padding is 1px less than Figma because Figma strokes sit inside the box; CSS borders add to it.
type Variant = "primary" | "secondary" | "outline";

const variantClasses: Record<Variant, string> = {
  // Yellow, raised: "I Know This", "Create Card", "Update Card", "Delete Card"
  primary: "bg-yellow-500 px-[19px] shadow-hard-2 hover:bg-[#f5c12a]",
  // White, raised: "Reset Progress", "Load More", "Go to All Cards"
  secondary: "bg-neutral-0 px-[19px] shadow-hard-2 hover:bg-neutral-100",
  // White, flat: filters, Shuffle, Previous / Next, Cancel
  outline: "bg-neutral-0 px-[15px] hover:bg-neutral-100",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** Figma uses SemiBold for form/dialog submit buttons and Medium elsewhere. */
  weight?: "medium" | "semibold";
  icon?: string;
  /** Renders the icon after the label (e.g. "Next >"). */
  iconEnd?: string;
  children?: ReactNode;
};

/** Pill button from the design system. Raised variants get the hard 2px "sticker" shadow. */
export function Button({
  variant = "outline",
  weight = "medium",
  icon,
  iconEnd,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-neutral-900 py-[11px] text-neutral-900 whitespace-nowrap",
        "transition-[background-color,box-shadow,translate] duration-150 ease-out",
        "active:enabled:translate-x-px active:enabled:translate-y-px",
        "disabled:opacity-50",
        weight === "semibold" ? "text-preset-4-semibold" : "text-preset-4",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {icon && <img src={icon} alt="" width={16} height={16} className="size-4 shrink-0" />}
      {children}
      {iconEnd && <img src={iconEnd} alt="" width={16} height={16} className="size-4 shrink-0" />}
    </button>
  );
}
