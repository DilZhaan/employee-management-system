import type { PaginationQuery } from "@/types/api";

export type AttendanceStatus = "Present" | "Late";
export type DeviceType = "Web" | "Mobile";

export interface AttendanceResponse {
  id: string;
  employeeId: string;
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
}

export interface CheckInRequest {
  deviceType: DeviceType;
}
