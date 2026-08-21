import { apiClient } from "@/api/client";
import type { PagedResult } from "@/types/api";
import type { CreateLeaveRequest, LeaveRequestQuery, LeaveRequestResponse } from "@/types/leave";

export async function createLeaveRequest(request: CreateLeaveRequest): Promise<LeaveRequestResponse> {
  const response = await apiClient.post<LeaveRequestResponse>("/api/v1/leave-requests", request);
  return response.data;
}

export async function getMyLeaveRequests(query?: LeaveRequestQuery): Promise<PagedResult<LeaveRequestResponse>> {
  const response = await apiClient.get<PagedResult<LeaveRequestResponse>>("/api/v1/leave-requests/me", {
    params: query
  });
  return response.data;
}

export async function getLeaveRequests(query?: LeaveRequestQuery): Promise<PagedResult<LeaveRequestResponse>> {
  const response = await apiClient.get<PagedResult<LeaveRequestResponse>>("/api/v1/leave-requests", {
    params: query
  });
  return response.data;
}

export async function approveLeaveRequest(id: string): Promise<LeaveRequestResponse> {
  const response = await apiClient.patch<LeaveRequestResponse>(`/api/v1/leave-requests/${id}/approve`);
  return response.data;
}

export async function rejectLeaveRequest(id: string): Promise<LeaveRequestResponse> {
  const response = await apiClient.patch<LeaveRequestResponse>(`/api/v1/leave-requests/${id}/reject`);
  return response.data;
}
