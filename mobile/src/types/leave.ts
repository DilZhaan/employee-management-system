import type { PaginationParams } from "@/types/api";

export type LeaveType = "Annual" | "Sick" | "Casual" | "Unpaid";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export const LEAVE_TYPES = ["Annual", "Sick", "Casual", "Unpaid"] as const satisfies readonly LeaveType[];
export const LEAVE_STATUSES = ["Pending", "Approved", "Rejected"] as const satisfies readonly LeaveStatus[];

export interface CreateLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeCode: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedById: string | null;
  appliedOn: string;
  reviewedAt: string | null;
}

export interface LeaveRequestQueryParams extends PaginationParams {
  status?: LeaveStatus;
  from?: string;
  to?: string;
}
