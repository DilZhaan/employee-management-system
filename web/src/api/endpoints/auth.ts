import { apiClient } from "@/api/client";
import { API_ROUTES } from "@/api/routes";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    API_ROUTES.auth.login,
    request,
  );
  return response.data;
}
