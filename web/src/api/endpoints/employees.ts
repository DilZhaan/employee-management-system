import { apiClient } from "@/api/client";
import type { PagedResult } from "@/types/api";
import type {
  CreateEmployeeRequest,
  EmployeeQuery,
  EmployeeResponse,
  UpdateEmployeeRequest
} from "@/types/employee";

export async function getEmployees(query?: EmployeeQuery): Promise<PagedResult<EmployeeResponse>> {
  const response = await apiClient.get<PagedResult<EmployeeResponse>>("/api/v1/employees", {
    params: query
  });
  return response.data;
}

export async function getEmployee(id: string): Promise<EmployeeResponse> {
  const response = await apiClient.get<EmployeeResponse>(`/api/v1/employees/${id}`);
  return response.data;
}

export async function createEmployee(request: CreateEmployeeRequest): Promise<EmployeeResponse> {
  const response = await apiClient.post<EmployeeResponse>("/api/v1/employees", request);
  return response.data;
}

export async function updateEmployee(id: string, request: UpdateEmployeeRequest): Promise<EmployeeResponse> {
  const response = await apiClient.put<EmployeeResponse>(`/api/v1/employees/${id}`, request);
  return response.data;
}

export async function deactivateEmployee(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/employees/${id}`);
}
