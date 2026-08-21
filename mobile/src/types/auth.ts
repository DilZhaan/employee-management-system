import type { EmployeeProfile, EmployeeRole } from "@/types/employee";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  employee: EmployeeProfile;
}

export interface JwtClaims {
  sub?: string | null;
  email?: string | null;
  role?: string | null;
  exp?: number;
  employee_id?: string | null;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | null;
  [claim: string]: unknown;
}

export interface AuthUser {
  employeeId: string;
  email: string;
  role: EmployeeRole;
  expiresAt: number;
}
