import { Building2, CalendarDays, Clock3, LayoutDashboard, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EmployeeRole } from "@/types/auth";

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: readonly EmployeeRole[];
}

const allRoles = ["Admin", "Manager", "Employee"] as const satisfies readonly EmployeeRole[];
const adminRoles = ["Admin"] as const satisfies readonly EmployeeRole[];

export const navigationItems: readonly NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: allRoles
  },
  {
    label: "Employees",
    path: "/employees",
    icon: Users,
    roles: adminRoles
  },
  {
    label: "Departments",
    path: "/departments",
    icon: Building2,
    roles: allRoles
  },
  {
    label: "Attendance",
    path: "/attendance",
    icon: Clock3,
    roles: allRoles
  },
  {
    label: "Leave",
    path: "/leave",
    icon: CalendarDays,
    roles: allRoles
  }
];
