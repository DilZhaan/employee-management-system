import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { normalizeApiError, type NormalizedApiError } from "@/api/errors";

export function getMutationError(error: unknown): NormalizedApiError | null {
  return error ? normalizeApiError(error) : null;
}

export function applyServerFieldErrors<TValues extends FieldValues>(
  error: NormalizedApiError,
  setError: UseFormSetError<TValues>
) {
  if (!error.errors) {
    return;
  }

  for (const [field, messages] of Object.entries(error.errors)) {
    const fieldName = lowerFirst(field) as Path<TValues>;
    const message = messages.at(0);
    if (message) {
      setError(fieldName, { type: "server", message });
    }
  }
}

function lowerFirst(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toLowerCase() + value.slice(1);
}
