import { AxiosError, create } from "axios";

import { config } from "@/constants/config";
import { sessionToken } from "@/auth/sessionToken";

export const apiClient = create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeoutMs,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

let onUnauthorized: (() => Promise<void> | void) | null = null;
let hasNotifiedUnauthorized = false;

apiClient.interceptors.request.use((request) => {
  const token = sessionToken.get();

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const skipAuthInvalidation = Boolean(error.config?.skipAuthInvalidation);

    if (status === 401 && !skipAuthInvalidation && onUnauthorized && !hasNotifiedUnauthorized) {
      hasNotifiedUnauthorized = true;
      await onUnauthorized();
    }

    return Promise.reject(error);
  }
);

export function registerUnauthorizedHandler(handler: (() => Promise<void> | void) | null): void {
  onUnauthorized = handler;
}

export function resetUnauthorizedGuard(): void {
  hasNotifiedUnauthorized = false;
}
