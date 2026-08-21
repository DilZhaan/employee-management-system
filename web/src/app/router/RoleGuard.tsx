import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/use-auth";
import type { EmployeeRole } from "@/types/auth";

interface RoleGuardProps {
  allowedRoles: readonly EmployeeRole[];
  children?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuth();
  const isAllowed = user ? allowedRoles.includes(user.role) : false;

  if (!isAllowed) {
    return <Navigate to="/forbidden" replace />;
  }

  return children ?? <Outlet />;
}
