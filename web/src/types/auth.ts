import type { EmployeeResponse } from "@/types/employee";

export type EmployeeRole = "Employee" | "Manager" | "Admin";

export const EMPLOYEE_ROLES = ["Employee", "Manager", "Admin"] as const satisfies readonly EmployeeRole[];

export interface AuthUser {
  employeeId: string;
  email: string;
  role: EmployeeRole;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  employee: EmployeeResponse;
}
