import { EMPLOYEE_ROLES, type AuthUser, type EmployeeRole } from "@/types/auth";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

interface JwtPayload {
  employee_id?: string;
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  [ROLE_CLAIM]?: string;
}

export function parseAuthUserFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const employeeId = payload.employee_id ?? payload.sub;
  const email = payload.email;
  const role = parseRole(payload[ROLE_CLAIM] ?? payload.role);
  const expiresAt = payload.exp;

  if (!employeeId || !email || !role || !expiresAt || isExpired(expiresAt)) {
    return null;
  }

  return {
    employeeId,
    email,
    role,
    expiresAt
  };
}

export function isExpired(expiresAt: number): boolean {
  return expiresAt * 1000 <= Date.now();
}

function parseRole(role: string | undefined): EmployeeRole | null {
  return EMPLOYEE_ROLES.includes(role as EmployeeRole) ? (role as EmployeeRole) : null;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = window.atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "="));
    return JSON.parse(decodedPayload) as JwtPayload;
  } catch {
    return null;
  }
}
