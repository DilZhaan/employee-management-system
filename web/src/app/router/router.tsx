import { createBrowserRouter } from "react-router-dom";
import {
  AttendanceRoute,
  DashboardRoute,
  DepartmentsRoute,
  EmployeeDetailRoute,
  EmployeesRoute,
  LeaveRoute
} from "@/app/router/LazyPages";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicOnlyRoute } from "@/app/router/PublicOnlyRoute";
import { RoleGuard } from "@/app/router/RoleGuard";
import { ForbiddenPage } from "@/components/common/ForbiddenPage";
import { NotFoundPage } from "@/components/common/NotFoundPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardRoute />
          },
          {
            path: "dashboard",
            element: <DashboardRoute />
          },
          {
            element: <RoleGuard allowedRoles={["Admin"]} />,
            children: [
              {
                path: "employees",
                element: <EmployeesRoute />
              },
              {
                path: "employees/:id",
                element: <EmployeeDetailRoute />
              }
            ]
          },
          {
            path: "departments",
            element: <DepartmentsRoute />
          },
          {
            path: "attendance",
            element: <AttendanceRoute />
          },
          {
            path: "leave",
            element: <LeaveRoute />
          },
          {
            path: "forbidden",
            element: <ForbiddenPage />
          },
          {
            path: "*",
            element: <NotFoundPage />
          }
        ]
      }
    ]
  }
]);
