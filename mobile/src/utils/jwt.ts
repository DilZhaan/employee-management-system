import type { AuthUser, JwtClaims } from "@/types/auth";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/types/employee";

const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function decodeJwtClaims(token: string): JwtClaims | null {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const json = decodeBase64(padded);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function parseAuthUserFromToken(token: string): AuthUser | null {
  const claims = decodeJwtClaims(token);
  if (!claims) {
    return null;
  }

  const employeeId = readStringClaim(claims.employee_id) ?? readStringClaim(claims.sub);
  const email = readStringClaim(claims.email);
  const role = parseRole(readStringClaim(claims[roleClaim]) ?? readStringClaim(claims.role));
  const expiresAt = claims.exp;

  if (!employeeId || !email || !role || !isValidExpiration(expiresAt)) {
    return null;
  }

  if (isTokenExpired(expiresAt)) {
    return null;
  }

  return {
    employeeId,
    email,
    role,
    expiresAt
  };
}

export function isTokenExpired(expiresAt: number): boolean {
  return expiresAt * 1000 <= Date.now();
}

function decodeBase64(value: string): string {
  if (typeof globalThis.atob === "function") {
    return globalThis.atob(value);
  }

  throw new Error("Base64 decoding is not available in this runtime.");
}

function parseRole(value: string | null): EmployeeRole | null {
  if (!value || !EMPLOYEE_ROLES.includes(value as EmployeeRole)) {
    return null;
  }

  return value as EmployeeRole;
}

function readStringClaim(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function isValidExpiration(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
