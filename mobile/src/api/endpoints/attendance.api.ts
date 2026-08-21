import { apiClient } from "@/api/client/apiClient";
import type { PagedResult } from "@/types/api";
import type { AttendanceHistoryQueryParams, AttendanceLog, CheckInRequest } from "@/types/attendance";

export const attendanceApi = {
  async checkIn(request: CheckInRequest): Promise<AttendanceLog> {
    const response = await apiClient.post<AttendanceLog>("/api/v1/attendance/check-in", request);
    return response.data;
  },

  async checkOut(): Promise<AttendanceLog> {
    const response = await apiClient.post<AttendanceLog>("/api/v1/attendance/check-out");
    return response.data;
  },

  async getMine(params?: AttendanceHistoryQueryParams): Promise<PagedResult<AttendanceLog>> {
    const response = await apiClient.get<PagedResult<AttendanceLog>>("/api/v1/attendance/me", { params });
    return response.data;
  }
};
