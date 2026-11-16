import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge only knows Tailwind's built-in scale, so it would read the
 * Figma `text-preset-*` utilities as text colors and drop them whenever a
 * `text-foreground`-style class is also present. Register them as font sizes.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "preset-1",
            "preset-2",
            "preset-3",
            "preset-4",
            "preset-4-semibold",
            "preset-4-regular",
            "preset-5",
            "preset-6",
          ],
        },
      ],
      shadow: [
        { shadow: ["hard-1", "hard-2", "tab", "error", "pop", "toast"] },
      ],
    },
  },
})

/** Merge Tailwind class lists, letting later classes win over conflicting earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
