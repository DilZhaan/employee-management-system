import type { PaginationQuery } from "@/types/api";
import type { EmployeeRole } from "@/types/auth";

export interface EmployeeResponse {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  departmentId: string;
  role: EmployeeRole;
  managerId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeeQuery extends PaginationQuery {
  departmentId?: string;
  managerId?: string;
  role?: EmployeeRole;
  isActive?: boolean;
  search?: string;
}

export interface CreateEmployeeRequest {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  departmentId: string;
  role: EmployeeRole;
  managerId?: string | null;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  departmentId: string;
  role: EmployeeRole;
  managerId?: string | null;
}
