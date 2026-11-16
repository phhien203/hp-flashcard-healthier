import { type ReactNode, useEffect, useRef } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
};

/**
 * Modal built on the native <dialog> element: focus trapping, Escape to close and
 * the inert background come for free. Clicking the backdrop also closes it.
 */
export function Dialog({ open, onClose, labelledBy, children, className = "" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={[
        "m-auto w-[calc(100%-32px)] max-w-[343px] overflow-visible bg-transparent p-0 text-neutral-900",
        "animate-[dialog-in_200ms_var(--ease-out)]",
        className,
      ].join(" ")}
    >
      <div className="relative rounded-16 border border-r-4 border-b-4 border-neutral-900 bg-neutral-0">
        {children}
      </div>
    </dialog>
  );
}
