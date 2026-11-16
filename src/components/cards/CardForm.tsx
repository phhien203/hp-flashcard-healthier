import { type FormEvent, type ReactNode, useState } from "react";
import { type CardErrors, type CardInput, validateCard } from "../../lib/cards";
import { TextField } from "../ui/TextField";

type CardFormProps = {
  initial?: CardInput;
  /** Return true to reset the form after a successful submit. */
  onSubmit: (input: CardInput) => boolean | void;
  /** Renders the submit area; receives nothing because the button just needs type="submit". */
  footer: ReactNode;
  placeholders?: boolean;
  autoFocus?: boolean;
  className?: string;
};

const empty: CardInput = { question: "", answer: "", category: "" };

/** Question / Answer / Category fields with inline validation. Used by "Create" and "Edit". */
export function CardForm({ initial = empty, onSubmit, footer, placeholders, autoFocus, className = "" }: CardFormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<CardErrors>({});

  const set = (field: keyof CardInput) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear a field's error as soon as the user fixes it.
    if (errors[field] && value.trim()) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateCard(values);
    setErrors(nextErrors);
    const firstInvalid = (Object.keys(nextErrors) as (keyof CardInput)[])[0];
    if (firstInvalid) {
      (e.currentTarget as HTMLFormElement).querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    if (onSubmit(values)) setValues(empty);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className={className}>
      <div className="flex w-full flex-col gap-4">
        <TextField
          name="question"
          label="Question"
          value={values.question}
          onChange={set("question")}
          placeholder={placeholders ? "e.g., What is the capital of France?" : undefined}
          error={errors.question}
          autoFocus={autoFocus}
        />
        <TextField
          name="answer"
          label="Answer"
          multiline
          value={values.answer}
          onChange={set("answer")}
          placeholder={placeholders ? "e.g., Paris" : undefined}
          error={errors.answer}
        />
        <TextField
          name="category"
          label="Category"
          value={values.category}
          onChange={set("category")}
          placeholder={placeholders ? "e.g., Geography" : undefined}
          error={errors.category}
        />
      </div>
      {footer}
    </form>
  );
}
