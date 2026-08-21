import { lazy, Suspense, type ReactNode } from "react";
import { TableSkeleton } from "@/components/common/TableSkeleton";

const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const EmployeesPage = lazy(() => import("@/features/employees/pages/EmployeesPage").then((module) => ({ default: module.EmployeesPage })));
const EmployeeDetailPage = lazy(() => import("@/features/employees/pages/EmployeeDetailPage").then((module) => ({ default: module.EmployeeDetailPage })));
const DepartmentsPage = lazy(() => import("@/features/departments/pages/DepartmentsPage").then((module) => ({ default: module.DepartmentsPage })));
const AttendancePage = lazy(() => import("@/features/attendance/pages/AttendancePage").then((module) => ({ default: module.AttendancePage })));
const LeavePage = lazy(() => import("@/features/leave/pages/LeavePage").then((module) => ({ default: module.LeavePage })));

function PageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<TableSkeleton columns={3} rows={4} />}>{children}</Suspense>;
}

export function DashboardRoute() {
  return (
    <PageSuspense>
      <DashboardPage />
    </PageSuspense>
  );
}

export function EmployeesRoute() {
  return (
    <PageSuspense>
      <EmployeesPage />
    </PageSuspense>
  );
}

export function EmployeeDetailRoute() {
  return (
    <PageSuspense>
      <EmployeeDetailPage />
    </PageSuspense>
  );
}

export function DepartmentsRoute() {
  return (
    <PageSuspense>
      <DepartmentsPage />
    </PageSuspense>
  );
}

export function AttendanceRoute() {
  return (
    <PageSuspense>
      <AttendancePage />
    </PageSuspense>
  );
}

export function LeaveRoute() {
  return (
    <PageSuspense>
      <LeavePage />
    </PageSuspense>
  );
}
