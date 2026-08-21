import type { AttendanceHistoryQueryParams } from "@/types/attendance";

export const attendanceKeys = {
  all: ["attendance"] as const,
  today: (workDate: string) => [...attendanceKeys.all, "today", workDate] as const,
  history: (params: AttendanceHistoryQueryParams) => [...attendanceKeys.all, "history", params] as const
};
