import { canAccessApprovalsRole } from "@/auth/authorization";
import type { MainTabParamList } from "@/app/navigation/types";
import type { EmployeeRole } from "@/types/employee";

export function getMainTabsForRole(role: EmployeeRole | null | undefined): (keyof MainTabParamList)[] {
  if (canAccessApprovalsRole(role)) {
    return ["Home", "Attendance", "Leave", "Approvals", "Profile"];
  }

  return ["Home", "Attendance", "Leave", "Profile"];
}
