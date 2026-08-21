import type { PaginationQuery } from "@/types/api";

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface DepartmentQuery extends PaginationQuery {
  isActive?: boolean;
  search?: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  code: string;
}
