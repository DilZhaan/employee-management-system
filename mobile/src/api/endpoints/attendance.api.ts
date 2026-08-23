import { apiClient } from "@/api/client/apiClient";
import { API_ROUTES } from "@/api/routes";
import type { PagedResult } from "@/types/api";
import type {
  AttendanceHistoryQueryParams,
  AttendanceLog,
  CheckInRequest,
} from "@/types/attendance";

export const attendanceApi = {
  async checkIn(request: CheckInRequest): Promise<AttendanceLog> {
    const response = await apiClient.post<AttendanceLog>(
      API_ROUTES.attendance.checkIn,
      request,
    );
    return response.data;
  },

  async checkOut(): Promise<AttendanceLog> {
    const response = await apiClient.post<AttendanceLog>(
      API_ROUTES.attendance.checkOut,
    );
    return response.data;
  },

  async getMine(
    params?: AttendanceHistoryQueryParams,
  ): Promise<PagedResult<AttendanceLog>> {
    const response = await apiClient.get<PagedResult<AttendanceLog>>(
      API_ROUTES.attendance.mine,
      { params },
    );
    return response.data;
  },
};
