import { apiClient } from "@/api/client";
import { API_ROUTES } from "@/api/routes";

export async function getApiHealth(): Promise<string> {
  const response = await apiClient.get<string>(API_ROUTES.health, {
    responseType: "text",
  });
  return response.data;
}
