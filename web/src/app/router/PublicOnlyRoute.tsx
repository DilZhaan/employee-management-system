import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/use-auth";

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
