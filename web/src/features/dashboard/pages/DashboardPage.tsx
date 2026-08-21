import { Building2, CalendarDays, Clock3, UserCheck, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/use-auth";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeApiError } from "@/api/errors";
import { useMyAttendance, useAttendance } from "@/features/attendance/hooks/useAttendance";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useLeaveRequests, useMyLeaveRequests } from "@/features/leave/hooks/useLeave";

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const canReview = user?.role === "Admin" || user?.role === "Manager";
  const departmentsQuery = useDepartments({ page: 1, pageSize: 1 });
  const myAttendanceQuery = useMyAttendance({ page: 1, pageSize: 1 });
  const myLeaveQuery = useMyLeaveRequests({ page: 1, pageSize: 1 });

  return (
    <section className="space-y-6">
      <PageHeader title="Dashboard" description="Operational summary from the employee management API." />

      <div className="grid gap-4 md:grid-cols-3">
        {isAdmin ? <AdminSummaryCards /> : null}
        <SummaryCard
          title="Departments"
          value={departmentsQuery.data?.totalCount}
          icon={<Building2 className="size-5" aria-hidden="true" />}
          isLoading={departmentsQuery.isLoading}
          error={departmentsQuery.error}
        />
        <SummaryCard
          title="My attendance records"
          value={myAttendanceQuery.data?.totalCount}
          icon={<Clock3 className="size-5" aria-hidden="true" />}
          isLoading={myAttendanceQuery.isLoading}
          error={myAttendanceQuery.error}
        />
        <SummaryCard
          title="My leave requests"
          value={myLeaveQuery.data?.totalCount}
          icon={<CalendarDays className="size-5" aria-hidden="true" />}
          isLoading={myLeaveQuery.isLoading}
          error={myLeaveQuery.error}
        />
        {canReview ? <ReviewSummaryCards /> : null}
      </div>

      {departmentsQuery.isError || myAttendanceQuery.isError || myLeaveQuery.isError ? (
        <ErrorState
          title="Unable to load dashboard data."
          error={normalizeApiError(departmentsQuery.error ?? myAttendanceQuery.error ?? myLeaveQuery.error)}
          onRetry={() => {
            void departmentsQuery.refetch();
            void myAttendanceQuery.refetch();
            void myLeaveQuery.refetch();
          }}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Signed in as {user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {isAdmin ? (
            <>
              <Button asChild>
                <Link to="/employees">View employees</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/departments">View departments</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/attendance">View attendance</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/leave">View leave</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link to="/attendance">View attendance</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/leave">View leave</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/departments">View departments</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function ReviewSummaryCards() {
  const attendanceQuery = useAttendance({ page: 1, pageSize: 1 }, true);
  const pendingLeaveQuery = useLeaveRequests({ page: 1, pageSize: 1, status: "Pending" }, true);

  return (
    <>
      <SummaryCard
        title="Team attendance records"
        value={attendanceQuery.data?.totalCount}
        icon={<Clock3 className="size-5" aria-hidden="true" />}
        isLoading={attendanceQuery.isLoading}
        error={attendanceQuery.error}
      />
      <SummaryCard
        title="Pending leave reviews"
        value={pendingLeaveQuery.data?.totalCount}
        icon={<CalendarDays className="size-5" aria-hidden="true" />}
        isLoading={pendingLeaveQuery.isLoading}
        error={pendingLeaveQuery.error}
      />
    </>
  );
}

function AdminSummaryCards() {
  const employeesQuery = useEmployees({ page: 1, pageSize: 1 });
  const activeEmployeesQuery = useEmployees({ page: 1, pageSize: 1, isActive: true });

  return (
    <>
      <SummaryCard
        title="Total employees"
        value={employeesQuery.data?.totalCount}
        icon={<Users className="size-5" aria-hidden="true" />}
        isLoading={employeesQuery.isLoading}
        error={employeesQuery.error}
      />
      <SummaryCard
        title="Active employees"
        value={activeEmployeesQuery.data?.totalCount}
        icon={<UserCheck className="size-5" aria-hidden="true" />}
        isLoading={activeEmployeesQuery.isLoading}
        error={activeEmployeesQuery.error}
      />
    </>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  isLoading,
  error
}: {
  title: string;
  value?: number;
  icon: ReactNode;
  isLoading: boolean;
  error: unknown;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {isLoading ? <Skeleton className="h-9 w-20" /> : <p className="text-3xl font-semibold tracking-normal text-slate-950">{error ? "-" : value ?? 0}</p>}
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">{icon}</div>
      </CardContent>
    </Card>
  );
}
