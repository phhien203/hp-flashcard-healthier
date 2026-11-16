import { toast } from "sonner";
import { closeToast } from "./ui/icons";

/** Pill toast from the Figma "Toast" component, rendered through Sonner for stacking + timing. */
export function showToast(message: string) {
  toast.custom((id) => (
    <div
      role="status"
      className="flex w-[300px] items-center justify-between gap-4 rounded-full border border-neutral-900 bg-neutral-0 px-[15px] py-[9px] font-sans text-neutral-900 shadow-toast"
    >
      <p className="text-preset-4">{message}</p>
      <button
        type="button"
        onClick={() => toast.dismiss(id)}
        aria-label="Dismiss notification"
        className="focus-ring flex size-4 shrink-0 items-center justify-center rounded-xs"
      >
        <img src={closeToast} alt="" width={16} height={16} className="size-4" />
      </button>
    </div>
  ));
}
