import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { normalizeApiError } from "@/api/errors/normalizeApiError";
import { attendanceApi } from "@/api/endpoints/attendance.api";
import { attendanceKeys } from "@/features/attendance/api/queryKeys";
import { deriveTodayAttendanceSummary } from "@/features/attendance/utils/todayAttendance";
import { todayDateOnly } from "@/utils/date";

const defaultHistoryPageSize = 20;

export function useTodayAttendance() {
  const workDate = todayDateOnly();

  const query = useQuery({
    queryKey: attendanceKeys.today(workDate),
    queryFn: async () =>
      attendanceApi.getMine({
        page: 1,
        pageSize: 20,
        from: workDate,
        to: workDate
      }),
    select: (result) => deriveTodayAttendanceSummary(result.items)
  });

  return {
    ...query,
    workDate
  };
}

export function useAttendanceHistory(pageSize = defaultHistoryPageSize) {
  const query = useInfiniteQuery({
    queryKey: attendanceKeys.history({ pageSize }),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      attendanceApi.getMine({
        page: pageParam,
        pageSize
      }),
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined)
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    ...query,
    items
  };
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attendanceApi.checkIn({ deviceType: "Mobile" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    }
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attendanceApi.checkOut(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    }
  });
}

export function getAttendanceMutationError(error: unknown): string {
  const normalized = normalizeApiError(error);

  if (normalized.kind === "network") {
    return "Unable to connect to the server. Check your connection and try again.";
  }

  if (normalized.kind === "timeout") {
    return "The server did not respond in time. Please try again.";
  }

  return normalized.message || "Something went wrong. Please try again.";
}
