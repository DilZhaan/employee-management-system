import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveLeaveRequest, createLeaveRequest, getLeaveRequests, getMyLeaveRequests, rejectLeaveRequest } from "@/api/endpoints/leave";
import { leaveKeys } from "@/features/leave/api/query-keys";
import type { CreateLeaveRequest, LeaveRequestQuery } from "@/types/leave";

export function useMyLeaveRequests(query: LeaveRequestQuery) {
  return useQuery({
    queryKey: leaveKeys.mine(query),
    queryFn: () => getMyLeaveRequests(query),
    placeholderData: keepPreviousData
  });
}

export function useLeaveRequests(query: LeaveRequestQuery, enabled: boolean) {
  return useQuery({
    queryKey: leaveKeys.list(query),
    queryFn: () => getLeaveRequests(query),
    placeholderData: keepPreviousData,
    enabled
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateLeaveRequest) => createLeaveRequest(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    }
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveLeaveRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    }
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rejectLeaveRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    }
  });
}
