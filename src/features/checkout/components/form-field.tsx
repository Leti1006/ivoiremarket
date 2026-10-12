import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

type DescribableProps = { "aria-invalid"?: boolean; "aria-describedby"?: string };

/**
 * Libellé visible, aide et message d'erreur placés à côté du champ.
 * Le champ enfant reçoit automatiquement aria-invalid et aria-describedby.
 */
export function FormField({ id, label, hint, error, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const child = Children.only(children);
  const field = isValidElement(child)
    ? cloneElement(child as ReactElement<DescribableProps>, {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })
    : child;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {field}
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
