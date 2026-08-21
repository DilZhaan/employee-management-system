import type { PaginationQuery } from "@/types/api";

export type LeaveType = "Annual" | "Sick" | "Casual" | "Unpaid";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequestResponse {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedById?: string | null;
  appliedOn: string;
  reviewedAt?: string | null;
}

export interface LeaveRequestQuery extends PaginationQuery {
  employeeId?: string;
  departmentId?: string;
  status?: LeaveStatus;
  from?: string;
  to?: string;
}

export interface CreateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}
