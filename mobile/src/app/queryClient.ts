import { QueryClient } from "@tanstack/react-query";

import { normalizeApiError } from "@/api/errors/normalizeApiError";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const normalized = normalizeApiError(error);

        if (["validation", "unauthenticated", "forbidden", "not-found"].includes(normalized.kind)) {
          return false;
        }

        return failureCount < 2;
      }
    },
    mutations: {
      retry: false
    }
  }
});
