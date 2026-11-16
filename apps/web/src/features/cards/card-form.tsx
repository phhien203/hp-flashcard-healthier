import { CARD_LIMITS, cardInputSchema, type CardInput } from "@workspace/core"
import { revalidateLogic, useForm } from "@tanstack/react-form"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { Textarea } from "@workspace/ui/components/textarea"
import { Icon, type IconName } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import React from "react"

const EMPTY: CardInput = { question: "", answer: "", category: "" }

const FIELDS = [
  {
    name: "question",
    label: "Question",
    placeholder: "e.g., What is the capital of France?",
  },
  {
    name: "answer",
    label: "Answer",
    placeholder: "e.g., Paris",
    multiline: true,
  },
  { name: "category", label: "Category", placeholder: "e.g., Geography" },
] as const

export type CardFormProps = {
  defaultValues?: CardInput
  submitLabel: string
  submitIcon?: IconName
  /** Resolve to clear the form (create) or close a dialog (edit); reject to keep the input. */
  onSubmit: (input: CardInput) => Promise<unknown>
  /** Clear the fields after a successful submit. */
  resetOnSuccess?: boolean
  actionsClassName?: string
}

/**
 * Question / Answer / Category form shared by "Create Card" and "Edit your
 * card". Fields are validated on submit, then live as the learner fixes them,
 * using the same schema the server enforces.
 */
export function CardForm({
  defaultValues = EMPTY,
  submitLabel,
  submitIcon,
  onSubmit,
  resetOnSuccess = false,
  actionsClassName,
}: CardFormProps) {
  const idPrefix = React.useId()
  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: cardInputSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onSubmit(cardInputSchema.parse(value))
        if (resetOnSuccess) formApi.reset()
      } catch {
        // The mutation reports the failure with a toast; keep what was typed.
      }
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      className="flex flex-col gap-6"
    >
      <FieldGroup className="gap-4">
        {FIELDS.map((spec) => (
          <form.Field key={spec.name} name={spec.name}>
            {(field) => {
              const id = `${idPrefix}-${spec.name}`
              const errorId = `${id}-error`
              const invalid = field.state.meta.errors.length > 0
              const control = {
                id,
                name: field.name,
                value: field.state.value,
                placeholder: spec.placeholder,
                maxLength: CARD_LIMITS[spec.name],
                "aria-invalid": invalid || undefined,
                "aria-describedby": invalid ? errorId : undefined,
                onBlur: field.handleBlur,
              }
              return (
                <Field data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor={id}>{spec.label}</FieldLabel>
                  {"multiline" in spec ? (
                    <Textarea
                      {...control}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  ) : (
                    <Input
                      {...control}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                  {invalid && (
                    <FieldError id={errorId}>
                      <Icon name="error" className="size-3.5" />
                      {firstMessage(field.state.meta.errors)}
                    </FieldError>
                  )}
                </Field>
              )
            }}
          </form.Field>
        ))}
      </FieldGroup>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <div className={cn("flex", actionsClassName)}>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="font-semibold"
            >
              {isSubmitting ? (
                <Spinner />
              ) : (
                submitIcon && <Icon name={submitIcon} />
              )}
              {submitLabel}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}

function firstMessage(errors: ReadonlyArray<unknown>): string | undefined {
  const [error] = errors
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error)
    return String(error.message)
  return undefined
}
