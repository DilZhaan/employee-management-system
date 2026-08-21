import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/api/endpoints/auth.api";
import { normalizeApiError } from "@/api/errors/normalizeApiError";
import { useAuth } from "@/auth/useAuth";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";

export function useLogin() {
  const { onLoginSuccess } = useAuth();

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
    onSuccess: async (response) => {
      await onLoginSuccess(response);
    }
  });

  const errorMessage = mutation.error ? mapLoginError(mutation.error) : null;

  return {
    login: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    errorMessage
  };
}

function mapLoginError(error: unknown): string {
  const normalized = normalizeApiError(error);

  if (normalized.status === 401) {
    return "Invalid email or password.";
  }

  if (normalized.kind === "network") {
    return "Unable to connect to the server.\nCheck your connection and try again.";
  }

  if (normalized.kind === "timeout") {
    return "The server is taking too long to respond.\nPlease try again.";
  }

  return normalized.message || "Something went wrong. Please try again.";
}
