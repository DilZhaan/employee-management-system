import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeaveStatusBadge } from "@/features/leave/components/LeaveStatusBadge";
import { formatDate, formatDateTime } from "@/lib/format";
import type { LeaveRequestResponse } from "@/types/leave";

interface LeaveTableProps {
  requests: LeaveRequestResponse[];
  showEmployee?: boolean;
  canReview?: boolean;
  currentEmployeeId?: string;
  onApprove?: (request: LeaveRequestResponse) => void;
  onReject?: (request: LeaveRequestResponse) => void;
}

export function LeaveTable({ requests, showEmployee = false, canReview = false, currentEmployeeId, onApprove, onReject }: LeaveTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
          <tr>
            {showEmployee ? <th className="px-4 py-3 font-semibold">Employee</th> : null}
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Dates</th>
            <th className="px-4 py-3 font-semibold">Reason</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Applied</th>
            {canReview ? <th className="px-4 py-3 text-right font-semibold">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {requests.map((request) => {
            const isOwnRequest = Boolean(currentEmployeeId && request.employeeId === currentEmployeeId);

            return (
              <tr key={request.id} className="bg-white">
                {showEmployee ? (
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">{request.employeeName}</div>
                    <div className="font-mono text-xs text-slate-500">{request.employeeCode}</div>
                  </td>
                ) : null}
                <td className="px-4 py-3 text-slate-950">{request.leaveType}</td>
                <td className="px-4 py-3 text-slate-700">
                  {formatDate(request.startDate)} to {formatDate(request.endDate)}
                </td>
                <td className="max-w-xs px-4 py-3 text-slate-700">{request.reason}</td>
                <td className="px-4 py-3">
                  <LeaveStatusBadge status={request.status} />
                </td>
                <td className="px-4 py-3 text-slate-700">{formatDateTime(request.appliedOn)}</td>
                {canReview ? (
                  <td className="px-4 py-3">
                    {request.status === "Pending" && isOwnRequest ? (
                      <div className="flex justify-end">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">Own request</span>
                      </div>
                    ) : null}
                    {request.status === "Pending" && !isOwnRequest ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onApprove?.(request)} aria-label="Approve leave request">
                          <Check className="size-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onReject?.(request)} aria-label="Reject leave request">
                          <X className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
