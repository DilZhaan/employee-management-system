import type { PaginationQuery } from "@/types/api";

export type AttendanceStatus = "Present" | "Late";
export type DeviceType = "Web" | "Mobile";

export const ATTENDANCE_STATUSES = ["Present", "Late"] as const satisfies readonly AttendanceStatus[];
export const DEVICE_TYPES = ["Web", "Mobile"] as const satisfies readonly DeviceType[];

export interface AttendanceResponse {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  checkInTime: string;
  checkOutTime?: string | null;
  workDate: string;
  status: AttendanceStatus;
  deviceType: DeviceType;
}

export interface AttendanceQuery extends PaginationQuery {
  from?: string;
  to?: string;
  departmentId?: string;
  employeeId?: string;
  employeeSearch?: string;
}

export interface CheckInRequest {
  deviceType: DeviceType;
}
