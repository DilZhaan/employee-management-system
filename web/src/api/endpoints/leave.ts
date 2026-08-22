import { apiClient } from "@/api/client";
import { API_ROUTES } from "@/api/routes";
import type { PagedResult } from "@/types/api";
import type {
  CreateLeaveRequest,
  LeaveRequestQuery,
  LeaveRequestResponse,
} from "@/types/leave";

export async function createLeaveRequest(
  request: CreateLeaveRequest,
): Promise<LeaveRequestResponse> {
  const response = await apiClient.post<LeaveRequestResponse>(
    API_ROUTES.leaveRequests.list,
    request,
  );
  return response.data;
}

export async function getMyLeaveRequests(
  query?: LeaveRequestQuery,
): Promise<PagedResult<LeaveRequestResponse>> {
  const response = await apiClient.get<PagedResult<LeaveRequestResponse>>(
    API_ROUTES.leaveRequests.mine,
    {
      params: query,
    },
  );
  return response.data;
}

export async function getLeaveRequests(
  query?: LeaveRequestQuery,
): Promise<PagedResult<LeaveRequestResponse>> {
  const response = await apiClient.get<PagedResult<LeaveRequestResponse>>(
    API_ROUTES.leaveRequests.list,
    {
      params: query,
    },
  );
  return response.data;
}

export async function approveLeaveRequest(
  id: string,
): Promise<LeaveRequestResponse> {
  const response = await apiClient.patch<LeaveRequestResponse>(
    API_ROUTES.leaveRequests.approve(id),
  );
  return response.data;
}

export async function rejectLeaveRequest(
  id: string,
): Promise<LeaveRequestResponse> {
  const response = await apiClient.patch<LeaveRequestResponse>(
    API_ROUTES.leaveRequests.reject(id),
  );
  return response.data;
}
