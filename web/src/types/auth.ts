import type { EmployeeResponse } from "@/types/employee";

export type EmployeeRole = "Employee" | "Manager" | "Admin";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  employee: EmployeeResponse;
}
