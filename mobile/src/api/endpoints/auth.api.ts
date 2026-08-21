import { apiClient } from "@/api/client/apiClient";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export const authApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/api/v1/auth/login", request, {
      skipAuthInvalidation: true
    });
    return response.data;
  }
};
