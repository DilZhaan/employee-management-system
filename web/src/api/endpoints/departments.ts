import { apiClient } from "@/api/client";
import type { PagedResult } from "@/types/api";
import type {
  CreateDepartmentRequest,
  DepartmentQuery,
  DepartmentResponse,
  UpdateDepartmentRequest
} from "@/types/department";

export async function getDepartments(query?: DepartmentQuery): Promise<PagedResult<DepartmentResponse>> {
  const response = await apiClient.get<PagedResult<DepartmentResponse>>("/api/v1/departments", {
    params: query
  });
  return response.data;
}

export async function getDepartment(id: string): Promise<DepartmentResponse> {
  const response = await apiClient.get<DepartmentResponse>(`/api/v1/departments/${id}`);
  return response.data;
}

export async function createDepartment(request: CreateDepartmentRequest): Promise<DepartmentResponse> {
  const response = await apiClient.post<DepartmentResponse>("/api/v1/departments", request);
  return response.data;
}

export async function updateDepartment(id: string, request: UpdateDepartmentRequest): Promise<DepartmentResponse> {
  const response = await apiClient.put<DepartmentResponse>(`/api/v1/departments/${id}`, request);
  return response.data;
}

export async function deactivateDepartment(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/departments/${id}`);
}
