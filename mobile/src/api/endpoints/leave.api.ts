import { apiClient } from "@/api/client/apiClient";
import { API_ROUTES } from "@/api/routes";
import type { PagedResult } from "@/types/api";
import type {
  CreateLeaveRequest,
  LeaveRequest,
  LeaveRequestQueryParams,
} from "@/types/leave";

export const leaveApi = {
  async create(request: CreateLeaveRequest): Promise<LeaveRequest> {
    const response = await apiClient.post<LeaveRequest>(
      API_ROUTES.leaveRequests.list,
      request,
    );
    return response.data;
  },

  async getMine(
    params?: LeaveRequestQueryParams,
  ): Promise<PagedResult<LeaveRequest>> {
    const response = await apiClient.get<PagedResult<LeaveRequest>>(
      API_ROUTES.leaveRequests.mine,
      { params },
    );
    return response.data;
  },

  async getReviewable(
    params?: LeaveRequestQueryParams,
  ): Promise<PagedResult<LeaveRequest>> {
    const response = await apiClient.get<PagedResult<LeaveRequest>>(
      API_ROUTES.leaveRequests.list,
      { params },
    );
    return response.data;
  },

  async approve(id: string): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(
      API_ROUTES.leaveRequests.approve(id),
    );
    return response.data;
  },

  async reject(id: string): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(
      API_ROUTES.leaveRequests.reject(id),
    );
    return response.data;
  },
};
