import { useId } from "react";
import { error as errorIcon } from "./icons";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  name: string;
  autoFocus?: boolean;
};

/** Labelled input / textarea with the Figma error state (pink border, pink hard shadow, message). */
export function TextField({ label, value, onChange, placeholder, error, multiline, name, autoFocus }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const fieldClasses = [
    "text-preset-4-regular w-full rounded-6 border bg-neutral-0 p-[15px] text-neutral-900 placeholder:text-neutral-600",
    "outline-none transition-shadow duration-150 focus-visible:shadow-focus",
    error ? "border-pink-700 shadow-error" : "border-neutral-900",
    multiline ? "h-[100px] resize-none" : "",
  ].join(" ");
  const common = {
    id,
    name,
    value,
    placeholder,
    autoFocus,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: fieldClasses,
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-preset-4">
        {label}
      </label>
      {multiline ? (
        <textarea {...common} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" {...common} onChange={(e) => onChange(e.target.value)} />
      )}
      {error && (
        <p id={errorId} className="text-preset-5-regular flex items-center gap-1.5 text-pink-700">
          <img src={errorIcon} alt="" width={14} height={15} className="h-[15px] w-[14px] shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
