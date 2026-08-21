import { apiClient } from "@/api/client/apiClient";
import type { PagedResult } from "@/types/api";
import type { CreateLeaveRequest, LeaveRequest, LeaveRequestQueryParams } from "@/types/leave";

export const leaveApi = {
  async create(request: CreateLeaveRequest): Promise<LeaveRequest> {
    const response = await apiClient.post<LeaveRequest>("/api/v1/leave-requests", request);
    return response.data;
  },

  async getMine(params?: LeaveRequestQueryParams): Promise<PagedResult<LeaveRequest>> {
    const response = await apiClient.get<PagedResult<LeaveRequest>>("/api/v1/leave-requests/me", { params });
    return response.data;
  },

  async getReviewable(params?: LeaveRequestQueryParams): Promise<PagedResult<LeaveRequest>> {
    const response = await apiClient.get<PagedResult<LeaveRequest>>("/api/v1/leave-requests", { params });
    return response.data;
  },

  async approve(id: string): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(`/api/v1/leave-requests/${id}/approve`);
    return response.data;
  },

  async reject(id: string): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(`/api/v1/leave-requests/${id}/reject`);
    return response.data;
  }
};
