import type { EmployeeRole } from "@/types/employee";

interface FakeJwtOptions {
  employeeId?: string;
  email?: string;
  role?: EmployeeRole;
  exp?: number;
}

export function createFakeJwt(options: FakeJwtOptions = {}): string {
  const header = encodeSegment({ alg: "HS256", typ: "JWT" });
  const payload = encodeSegment({
    sub: options.employeeId ?? "00000000-0000-0000-0000-000000000001",
    employee_id: options.employeeId ?? "00000000-0000-0000-0000-000000000001",
    email: options.email ?? "employee@example.com",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": options.role ?? "Employee",
    exp: options.exp ?? Math.floor(Date.now() / 1000) + 60 * 30
  });

  return `${header}.${payload}.signature`;
}

function encodeSegment(value: Record<string, unknown>): string {
  const json = JSON.stringify(value);
  const encoded = globalThis.btoa(json);
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
