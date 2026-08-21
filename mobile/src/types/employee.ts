export type EmployeeRole = "Employee" | "Manager" | "Admin";
export const EMPLOYEE_ROLES = ["Employee", "Manager", "Admin"] as const satisfies readonly EmployeeRole[];

export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  departmentId: string;
  role: EmployeeRole;
  managerId: string | null;
  isActive: boolean;
  createdAt: string;
}
