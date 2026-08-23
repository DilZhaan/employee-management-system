import { useEffect, useRef } from "react";
import { normalizeApiError, type NormalizedApiError } from "@/api/errors";
import { useToast } from "@/components/ui/toast-context";

export function useApiErrorToast(
  error: unknown,
  title = "Request failed",
  getDescription: (error: NormalizedApiError) => string = getApiErrorDescription
) {
  const { showToast } = useToast();
  const lastError = useRef<unknown>(null);

  useEffect(() => {
    if (!error || lastError.current === error) {
      return;
    }

    lastError.current = error;
    const normalized = normalizeApiError(error);
    showToast({
      title,
      description: getDescription(normalized),
      tone: "error"
    });
  }, [error, getDescription, showToast, title]);
}

export function getApiErrorDescription(error: NormalizedApiError): string {
  return error.detail ?? error.title;
}
