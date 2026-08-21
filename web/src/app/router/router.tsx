import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { PublicOnlyRoute } from "@/app/router/PublicOnlyRoute";
import { RoleGuard } from "@/app/router/RoleGuard";
import { ForbiddenPage } from "@/components/common/ForbiddenPage";
import { NotFoundPage } from "@/components/common/NotFoundPage";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
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
            element: <DashboardPage />
          },
          {
            path: "dashboard",
            element: <DashboardPage />
          },
          {
            element: <RoleGuard allowedRoles={["Admin"]} />,
            children: [
              {
                path: "employees",
                element: (
                  <PlaceholderPage
                    title="Employees"
                    description="Employee profile management for authorized administrators."
                  />
                )
              }
            ]
          },
          {
            path: "departments",
            element: <PlaceholderPage title="Departments" description="Department records and organizational structure." />
          },
          {
            path: "attendance",
            element: <PlaceholderPage title="Attendance" description="Check-in, check-out, and attendance history workspace." />
          },
          {
            path: "leave",
            element: <PlaceholderPage title="Leave" description="Leave requests, reviews, and approval workflow." />
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
