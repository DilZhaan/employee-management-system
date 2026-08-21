import type { AuthUser } from "@/types/auth";
import type { EmployeeRole } from "@/types/employee";

export function canAccessApprovals(user: AuthUser | null): boolean {
  return canAccessApprovalsRole(user?.role);
}

export function canAccessApprovalsRole(role: EmployeeRole | null | undefined): boolean {
  return hasAnyRole(role, ["Manager", "Admin"]);
}

export function hasAnyRole(role: EmployeeRole | null | undefined, roles: readonly EmployeeRole[]): boolean {
  return Boolean(role && roles.includes(role));
}
