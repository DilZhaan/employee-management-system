import type { EmployeeRole } from "@/types/auth";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

interface AuthTokenOptions {
  employeeId?: string;
  email?: string;
  role?: EmployeeRole;
  expiresAt?: number;
}

export function createAuthToken(options: AuthTokenOptions = {}): string {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  const payload = {
    sub: options.employeeId ?? "11111111-1111-1111-1111-111111111111",
    employee_id: options.employeeId ?? "11111111-1111-1111-1111-111111111111",
    email: options.email ?? "admin@ems.local",
    [ROLE_CLAIM]: options.role ?? "Admin",
    exp: options.expiresAt ?? Math.floor(Date.now() / 1000) + 3600
  };

  return `${encodeBase64Url(header)}.${encodeBase64Url(payload)}.signature`;
}

function encodeBase64Url(value: object): string {
  return window
    .btoa(JSON.stringify(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
