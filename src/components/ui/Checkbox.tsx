import type { ReactNode } from "react";
import { checkboxChecked } from "./icons";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
};

/** Native checkbox (keeps keyboard + screen reader behaviour) with the Figma visual on top. */
export function Checkbox({ checked, onChange, children, className = "" }: CheckboxProps) {
  return (
    <label className={`group flex cursor-pointer items-center gap-2 select-none ${className}`}>
      <span className="relative inline-flex size-4 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-xs border border-neutral-900 bg-neutral-0 outline-none focus-visible:shadow-focus"
        />
        {checked && (
          <img
            src={checkboxChecked}
            alt=""
            width={16}
            height={16}
            className="pointer-events-none absolute inset-0 size-4"
          />
        )}
      </span>
      {children}
    </label>
  );
}
