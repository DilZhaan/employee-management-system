import { apiClient } from "@/api/client";
import { API_ROUTES } from "@/api/routes";
import type { PagedResult } from "@/types/api";
import type {
  CreateDepartmentRequest,
  DepartmentQuery,
  DepartmentResponse,
  UpdateDepartmentRequest,
} from "@/types/department";

export async function getDepartments(
  query?: DepartmentQuery,
): Promise<PagedResult<DepartmentResponse>> {
  const response = await apiClient.get<PagedResult<DepartmentResponse>>(
    API_ROUTES.departments.list,
    {
      params: query,
    },
  );
  return response.data;
}

export async function getDepartment(id: string): Promise<DepartmentResponse> {
  const response = await apiClient.get<DepartmentResponse>(
    API_ROUTES.departments.byId(id),
  );
  return response.data;
}

export async function createDepartment(
  request: CreateDepartmentRequest,
): Promise<DepartmentResponse> {
  const response = await apiClient.post<DepartmentResponse>(
    API_ROUTES.departments.list,
    request,
  );
  return response.data;
}

export async function updateDepartment(
  id: string,
  request: UpdateDepartmentRequest,
): Promise<DepartmentResponse> {
  const response = await apiClient.put<DepartmentResponse>(
    API_ROUTES.departments.byId(id),
    request,
  );
  return response.data;
}

export async function deactivateDepartment(id: string): Promise<void> {
  await apiClient.delete(API_ROUTES.departments.byId(id));
}

export async function activateDepartment(id: string): Promise<void> {
  await apiClient.patch(`${API_ROUTES.departments.byId(id)}/activate`);
}
