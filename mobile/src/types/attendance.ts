import type { PaginationParams } from "@/types/api";

export type AttendanceStatus = "Present" | "Late";
export type DeviceType = "Web" | "Mobile";

export interface AttendanceLog {
  id: string;
  employeeId: string;
  checkInTime: string;
  checkOutTime: string | null;
  workDate: string;
  status: AttendanceStatus;
  deviceType: DeviceType;
}

export interface CheckInRequest {
  deviceType: DeviceType;
}

export interface AttendanceHistoryQueryParams extends PaginationParams {
  from?: string;
  to?: string;
}

export type TodayAttendanceState = "not_checked_in" | "checked_in" | "completed";
