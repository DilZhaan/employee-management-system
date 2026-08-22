import { apiClient } from "@/api/client";
import { API_ROUTES } from "@/api/routes";
import type {
  AttendanceQuery,
  AttendanceResponse,
  CheckInRequest,
} from "@/types/attendance";
import type { PagedResult } from "@/types/api";

export async function checkIn(
  request: CheckInRequest,
): Promise<AttendanceResponse> {
  const response = await apiClient.post<AttendanceResponse>(
    API_ROUTES.attendance.checkIn,
    request,
  );
  return response.data;
}

export async function checkOut(): Promise<AttendanceResponse> {
  const response = await apiClient.post<AttendanceResponse>(
    API_ROUTES.attendance.checkOut,
  );
  return response.data;
}

export async function getMyAttendance(
  query?: AttendanceQuery,
): Promise<PagedResult<AttendanceResponse>> {
  const response = await apiClient.get<PagedResult<AttendanceResponse>>(
    API_ROUTES.attendance.mine,
    {
      params: query,
    },
  );
  return response.data;
}

export async function getAttendance(
  query?: AttendanceQuery,
): Promise<PagedResult<AttendanceResponse>> {
  const response = await apiClient.get<PagedResult<AttendanceResponse>>(
    API_ROUTES.attendance.list,
    {
      params: query,
    },
  );
  return response.data;
}
