import { apiClient } from "@/api/client";
import type { AttendanceQuery, AttendanceResponse, CheckInRequest } from "@/types/attendance";
import type { PagedResult } from "@/types/api";

export async function checkIn(request: CheckInRequest): Promise<AttendanceResponse> {
  const response = await apiClient.post<AttendanceResponse>("/api/v1/attendance/check-in", request);
  return response.data;
}

export async function checkOut(): Promise<AttendanceResponse> {
  const response = await apiClient.post<AttendanceResponse>("/api/v1/attendance/check-out");
  return response.data;
}

export async function getMyAttendance(query?: AttendanceQuery): Promise<PagedResult<AttendanceResponse>> {
  const response = await apiClient.get<PagedResult<AttendanceResponse>>("/api/v1/attendance/me", {
    params: query
  });
  return response.data;
}

export async function getAttendance(query?: AttendanceQuery): Promise<PagedResult<AttendanceResponse>> {
  const response = await apiClient.get<PagedResult<AttendanceResponse>>("/api/v1/attendance", {
    params: query
  });
  return response.data;
}
