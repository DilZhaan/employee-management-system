import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkIn, checkOut, getAttendance, getMyAttendance } from "@/api/endpoints/attendance";
import { attendanceKeys } from "@/features/attendance/api/query-keys";
import type { AttendanceQuery, CheckInRequest } from "@/types/attendance";

export function useMyAttendance(query: AttendanceQuery) {
  return useQuery({
    queryKey: attendanceKeys.mine(query),
    queryFn: () => getMyAttendance(query),
    placeholderData: keepPreviousData
  });
}

export function useAttendance(query: AttendanceQuery, enabled: boolean) {
  return useQuery({
    queryKey: attendanceKeys.list(query),
    queryFn: () => getAttendance(query),
    enabled
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CheckInRequest) => checkIn(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    }
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => checkOut(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    }
  });
}
