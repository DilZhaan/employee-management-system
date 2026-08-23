import { apiClient } from "@/api/client/apiClient";
import { API_ROUTES } from "@/api/routes";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export const authApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ROUTES.auth.login,
      request,
      {
        skipAuthInvalidation: true,
      },
    );
    return response.data;
  },
};
