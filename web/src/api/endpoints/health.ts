import { apiClient } from "@/api/client";

export async function getApiHealth(): Promise<string> {
  const response = await apiClient.get<string>("/health", {
    responseType: "text"
  });
  return response.data;
}
