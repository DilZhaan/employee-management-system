import axios from "axios";
import { notifyUnauthorized } from "@/auth/auth-events";
import { tokenStorage } from "@/auth/token-storage";
import { API_ROUTES } from "@/api/routes";
import { API_BASE_URL } from "@/lib/constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isLoginRequest(error.config?.url)
    ) {
      tokenStorage.remove();
      notifyUnauthorized();
    }

    return Promise.reject(error);
  },
);

function isLoginRequest(url: string | undefined): boolean {
  return url?.includes(API_ROUTES.auth.login) === true;
}
