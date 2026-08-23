import { apiClient } from "@/api/client";
import { API_ROUTES } from "@/api/routes";
import type { PagedResult } from "@/types/api";
import type {
  CreateEmployeeRequest,
  EmployeeQuery,
  EmployeeResponse,
  UpdateEmployeeRequest,
} from "@/types/employee";

export async function getEmployees(
  query?: EmployeeQuery,
): Promise<PagedResult<EmployeeResponse>> {
  const response = await apiClient.get<PagedResult<EmployeeResponse>>(
    API_ROUTES.employees.list,
    {
      params: query,
    },
  );
  return response.data;
}

export async function getEmployee(id: string): Promise<EmployeeResponse> {
  const response = await apiClient.get<EmployeeResponse>(
    API_ROUTES.employees.byId(id),
  );
  return response.data;
}

export async function createEmployee(
  request: CreateEmployeeRequest,
): Promise<EmployeeResponse> {
  const response = await apiClient.post<EmployeeResponse>(
    API_ROUTES.employees.list,
    request,
  );
  return response.data;
}

export async function updateEmployee(
  id: string,
  request: UpdateEmployeeRequest,
): Promise<EmployeeResponse> {
  const response = await apiClient.put<EmployeeResponse>(
    API_ROUTES.employees.byId(id),
    request,
  );
  return response.data;
}

export async function deactivateEmployee(id: string): Promise<void> {
  await apiClient.delete(API_ROUTES.employees.byId(id));
}

export async function activateEmployee(id: string): Promise<void> {
  await apiClient.patch(`${API_ROUTES.employees.byId(id)}/activate`);
}
