import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { normalizeApiError } from "@/api/errors/normalizeApiError";
import { leaveApi } from "@/api/endpoints/leave.api";
import { leaveKeys } from "@/features/leave/api/queryKeys";
import type { CreateLeaveRequest, LeaveRequestQueryParams } from "@/types/leave";

const defaultPageSize = 20;

export function useMyLeaveRequests(pageSize = defaultPageSize) {
  const params: LeaveRequestQueryParams = { pageSize };

  const query = useInfiniteQuery({
    queryKey: leaveKeys.mine(params),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      leaveApi.getMine({
        page: pageParam,
        pageSize
      }),
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined)
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? []
  };
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateLeaveRequest) => leaveApi.create(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    }
  });
}

export function useReviewableLeaveRequests(pageSize = defaultPageSize, enabled = true) {
  const params: LeaveRequestQueryParams = {
    pageSize,
    status: "Pending"
  };

  const query = useInfiniteQuery({
    queryKey: leaveKeys.reviewable(params),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      leaveApi.getReviewable({
        page: pageParam,
        pageSize,
        status: "Pending"
      }),
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? []
  };
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveApi.approve(id),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: [...leaveKeys.all, "reviewable"] });
      await queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.setQueryData(leaveKeys.detail(updated.id), updated);
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: [...leaveKeys.all, "reviewable"] });
    }
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveApi.reject(id),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: [...leaveKeys.all, "reviewable"] });
      await queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.setQueryData(leaveKeys.detail(updated.id), updated);
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: [...leaveKeys.all, "reviewable"] });
    }
  });
}

export function getLeaveErrorMessage(error: unknown): string {
  const normalized = normalizeApiError(error);

  if (normalized.kind === "network") {
    return "Unable to connect to the server. Check your connection and try again.";
  }

  if (normalized.kind === "timeout") {
    return "The server did not respond in time. Please try again.";
  }

  return normalized.message || "Something went wrong. Please try again.";
}
