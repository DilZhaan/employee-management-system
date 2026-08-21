import { LogIn, LogOut, RotateCcw } from "lucide-react";
import { normalizeApiError } from "@/api/errors";
import { useAuth } from "@/auth/use-auth";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-context";
import { AttendanceTable } from "@/features/attendance/components/AttendanceTable";
import { useAttendance, useCheckIn, useCheckOut, useMyAttendance } from "@/features/attendance/hooks/useAttendance";
import { getPositiveInt, useListSearchParams } from "@/features/common/list-params";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { clampToToday, todayDateOnly } from "@/lib/date-rules";
import type { AttendanceQuery } from "@/types/attendance";

const defaultPageSize = 20;
const validPageSizes = new Set([10, 20, 50]);

export function AttendancePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { searchParams, updateSearchParams, setSearchParams } = useListSearchParams();
  const canViewTeam = user?.role === "Admin" || user?.role === "Manager";
  const pageSizeParam = getPositiveInt(searchParams.get("pageSize"), defaultPageSize);
  const pageSize = validPageSizes.has(pageSizeParam) ? pageSizeParam : defaultPageSize;
  const query: AttendanceQuery = {
    page: getPositiveInt(searchParams.get("page"), 1),
    pageSize,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    departmentId: searchParams.get("departmentId") || undefined,
    employeeId: searchParams.get("employeeId") || undefined
  };
  const myAttendanceQuery = useMyAttendance({ page: 1, pageSize: 10 });
  const attendanceQuery = useAttendance(query, canViewTeam);
  const departmentsQuery = useDepartments({ page: 1, pageSize: 100, isActive: true });
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const hasFilters = Boolean(query.from || query.to || query.departmentId || query.employeeId);
  const tableQuery = canViewTeam ? attendanceQuery : myAttendanceQuery;
  const pageData = canViewTeam ? attendanceQuery.data : myAttendanceQuery.data;
  const today = todayDateOnly();

  function handleCheckIn() {
    checkInMutation.mutate(
      { deviceType: "Web" },
      {
        onSuccess: () => showToast({ title: "Checked in", tone: "success" })
      }
    );
  }

  function handleCheckOut() {
    checkOutMutation.mutate(undefined, {
      onSuccess: () => showToast({ title: "Checked out", tone: "success" })
    });
  }

  function resetFilters() {
    setSearchParams({ page: "1", pageSize: String(pageSize) });
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Attendance" description="Check in, check out, and review attendance history." />

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
          <CardDescription>Actions use the authenticated employee from your current session.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleCheckIn} disabled={checkInMutation.isPending}>
            <LogIn className="size-4" aria-hidden="true" />
            {checkInMutation.isPending ? "Checking in..." : "Check in"}
          </Button>
          <Button variant="outline" onClick={handleCheckOut} disabled={checkOutMutation.isPending}>
            <LogOut className="size-4" aria-hidden="true" />
            {checkOutMutation.isPending ? "Checking out..." : "Check out"}
          </Button>
        </CardContent>
        {checkInMutation.error || checkOutMutation.error ? (
          <CardContent>
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {normalizeApiError(checkInMutation.error ?? checkOutMutation.error).detail ?? normalizeApiError(checkInMutation.error ?? checkOutMutation.error).title}
            </div>
          </CardContent>
        ) : null}
      </Card>

      <Card className="overflow-hidden">
        {canViewTeam ? (
          <div className="grid gap-4 border-b border-slate-200 p-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
            <div className="space-y-2">
              <Label htmlFor="attendance-from">From</Label>
              <Input
                id="attendance-from"
                type="date"
                max={today}
                value={query.from ?? ""}
                onChange={(event) => updateSearchParams({ from: event.target.value ? clampToToday(event.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-to">To</Label>
              <Input
                id="attendance-to"
                type="date"
                max={today}
                value={query.to ?? ""}
                onChange={(event) => updateSearchParams({ to: event.target.value ? clampToToday(event.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-department">Department</Label>
              <Select id="attendance-department" value={query.departmentId ?? ""} onChange={(event) => updateSearchParams({ departmentId: event.target.value || undefined })}>
                <option value="">All</option>
                {(departmentsQuery.data?.items ?? []).map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-employee">Employee ID</Label>
              <Input id="attendance-employee" value={query.employeeId ?? ""} onChange={(event) => updateSearchParams({ employeeId: event.target.value || undefined })} />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={resetFilters} disabled={!hasFilters}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>
        ) : null}

        {tableQuery.isLoading ? <TableSkeleton columns={canViewTeam ? 6 : 5} /> : null}
        {tableQuery.isError ? (
          <ErrorState title="Unable to load attendance." error={normalizeApiError(tableQuery.error)} onRetry={() => void tableQuery.refetch()} />
        ) : null}
        {tableQuery.isSuccess && (pageData?.items.length ?? 0) === 0 ? (
          <EmptyState title="No attendance records found." description={hasFilters ? "Try adjusting your filters." : "Attendance records will appear here."} />
        ) : null}
        {tableQuery.isSuccess && (pageData?.items.length ?? 0) > 0 ? <AttendanceTable records={pageData?.items ?? []} showEmployee={canViewTeam} /> : null}

        {pageData && (pageData.items.length > 0 || canViewTeam) ? (
          <Pagination
            page={pageData.page}
            pageSize={pageData.pageSize}
            totalCount={pageData.totalCount}
            totalPages={pageData.totalPages}
            onPageChange={(page) => updateSearchParams({ page: String(page) }, false)}
            onPageSizeChange={(nextPageSize) => updateSearchParams({ pageSize: String(nextPageSize) })}
          />
        ) : null}
      </Card>
    </section>
  );
}
