import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { normalizeApiError } from "@/api/errors";
import { useAuth } from "@/auth/use-auth";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-context";
import { getPositiveInt, useListSearchParams } from "@/features/common/list-params";
import { useApiErrorToast } from "@/features/common/useApiErrorToast";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { LeaveRequestForm } from "@/features/leave/components/LeaveRequestForm";
import { LeaveTable } from "@/features/leave/components/LeaveTable";
import { useApproveLeaveRequest, useCreateLeaveRequest, useLeaveRequests, useMyLeaveRequests, useRejectLeaveRequest } from "@/features/leave/hooks/useLeave";
import type { LeaveRequestFormValues } from "@/features/leave/schemas/leave.schema";
import { LEAVE_STATUSES, type LeaveRequestQuery, type LeaveRequestResponse, type LeaveStatus } from "@/types/leave";

const defaultPageSize = 20;
const validPageSizes = new Set([10, 20, 50]);

export function LeavePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { searchParams, updateSearchParams, setSearchParams } = useListSearchParams();
  const [reviewTarget, setReviewTarget] = useState<{ request: LeaveRequestResponse; action: "approve" | "reject" } | null>(null);
  const canReview = user?.role === "Admin" || user?.role === "Manager";
  const pageSizeParam = getPositiveInt(searchParams.get("pageSize"), defaultPageSize);
  const pageSize = validPageSizes.has(pageSizeParam) ? pageSizeParam : defaultPageSize;
  const query: LeaveRequestQuery = {
    page: getPositiveInt(searchParams.get("page"), 1),
    pageSize,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    departmentId: searchParams.get("departmentId") || undefined,
    employeeId: searchParams.get("employeeId") || undefined,
    status: getStatusParam(searchParams.get("status"))
  };
  const myLeaveQuery = useMyLeaveRequests({ page: 1, pageSize: 10 });
  const leaveRequestsQuery = useLeaveRequests(query, canReview);
  const departmentsQuery = useDepartments({ page: 1, pageSize: 100, isActive: true });
  const createMutation = useCreateLeaveRequest();
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();
  const hasFilters = Boolean(query.from || query.to || query.departmentId || query.employeeId || query.status);
  const reviewData = leaveRequestsQuery.data;
  useApiErrorToast(myLeaveQuery.error, "Unable to load leave history");
  useApiErrorToast(leaveRequestsQuery.error, "Unable to load review requests");
  useApiErrorToast(departmentsQuery.error, "Unable to load departments");
  useApiErrorToast(createMutation.error, "Unable to submit leave request");
  useApiErrorToast(approveMutation.error, "Unable to approve leave request");
  useApiErrorToast(rejectMutation.error, "Unable to reject leave request");

  function submitLeave(values: LeaveRequestFormValues) {
    createMutation.mutate(values, {
      onSuccess: () => showToast({ title: "Leave request submitted", tone: "success" })
    });
  }

  function confirmReview() {
    if (!reviewTarget) {
      return;
    }

    const mutation = reviewTarget.action === "approve" ? approveMutation : rejectMutation;
    mutation.mutate(reviewTarget.request.id, {
      onSuccess: () => {
        showToast({ title: reviewTarget.action === "approve" ? "Leave approved" : "Leave rejected", tone: "success" });
        setReviewTarget(null);
      }
    });
  }

  function resetFilters() {
    setSearchParams({ page: "1", pageSize: String(pageSize) });
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Leave" description="Submit leave requests and review pending requests." />

      <Card>
        <CardHeader>
          <CardTitle>New request</CardTitle>
          <CardDescription>Submit a leave request for your authenticated employee profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaveRequestForm isSubmitting={createMutation.isPending} onSubmit={submitLeave} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>My leave history</CardTitle>
          <CardDescription>Your most recent leave requests.</CardDescription>
        </CardHeader>
        {myLeaveQuery.isLoading ? <TableSkeleton columns={5} /> : null}
        {myLeaveQuery.isError ? <ErrorState title="Unable to load leave history." error={normalizeApiError(myLeaveQuery.error)} onRetry={() => void myLeaveQuery.refetch()} /> : null}
        {myLeaveQuery.isSuccess && myLeaveQuery.data.items.length === 0 ? <EmptyState title="No leave requests found." description="Submitted requests will appear here." /> : null}
        {myLeaveQuery.isSuccess && myLeaveQuery.data.items.length > 0 ? <LeaveTable requests={myLeaveQuery.data.items} /> : null}
      </Card>

      {canReview ? (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Review requests</CardTitle>
            <CardDescription>Managers can review direct subordinate requests. Admins can review all requests.</CardDescription>
          </CardHeader>
          <div className="grid gap-4 border-y border-slate-200 p-4 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
            <div className="space-y-2">
              <Label htmlFor="leave-from">From</Label>
              <Input id="leave-from" type="date" value={query.from ?? ""} onChange={(event) => updateSearchParams({ from: event.target.value || undefined })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-to">To</Label>
              <Input id="leave-to" type="date" value={query.to ?? ""} onChange={(event) => updateSearchParams({ to: event.target.value || undefined })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-status">Status</Label>
              <Select id="leave-status" value={query.status ?? ""} onChange={(event) => updateSearchParams({ status: event.target.value || undefined })}>
                <option value="">All</option>
                {LEAVE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-department">Department</Label>
              <Select id="leave-department" value={query.departmentId ?? ""} onChange={(event) => updateSearchParams({ departmentId: event.target.value || undefined })}>
                <option value="">All</option>
                {(departmentsQuery.data?.items ?? []).map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-employee">Employee ID</Label>
              <Input id="leave-employee" value={query.employeeId ?? ""} onChange={(event) => updateSearchParams({ employeeId: event.target.value || undefined })} />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={resetFilters} disabled={!hasFilters}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>
          {leaveRequestsQuery.isLoading ? <TableSkeleton columns={7} /> : null}
          {leaveRequestsQuery.isError ? (
            <ErrorState title="Unable to load requests." error={normalizeApiError(leaveRequestsQuery.error)} onRetry={() => void leaveRequestsQuery.refetch()} />
          ) : null}
          {leaveRequestsQuery.isSuccess && (reviewData?.items.length ?? 0) === 0 ? (
            <EmptyState title="No leave requests found." description={hasFilters ? "Try adjusting your filters." : "Requests awaiting review will appear here."} />
          ) : null}
          {leaveRequestsQuery.isSuccess && (reviewData?.items.length ?? 0) > 0 ? (
            <LeaveTable
              requests={reviewData?.items ?? []}
              showEmployee
              canReview
              currentEmployeeId={user?.employeeId}
              onApprove={(request) => setReviewTarget({ request, action: "approve" })}
              onReject={(request) => setReviewTarget({ request, action: "reject" })}
            />
          ) : null}
          {reviewData ? (
            <Pagination
              page={reviewData.page}
              pageSize={reviewData.pageSize}
              totalCount={reviewData.totalCount}
              totalPages={reviewData.totalPages}
              onPageChange={(page) => updateSearchParams({ page: String(page) }, false)}
              onPageSizeChange={(nextPageSize) => updateSearchParams({ pageSize: String(nextPageSize) })}
            />
          ) : null}
        </Card>
      ) : null}

      <Dialog open={Boolean(reviewTarget)} onOpenChange={(open) => !open && setReviewTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{reviewTarget?.action === "approve" ? "Approve leave request?" : "Reject leave request?"}</DialogTitle>
            <DialogDescription>This action updates the request status immediately.</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setReviewTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmReview} disabled={approveMutation.isPending || rejectMutation.isPending}>
              {approveMutation.isPending || rejectMutation.isPending ? "Saving..." : reviewTarget?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function getStatusParam(value: string | null): LeaveStatus | undefined {
  return LEAVE_STATUSES.includes(value as LeaveStatus) ? (value as LeaveStatus) : undefined;
}
