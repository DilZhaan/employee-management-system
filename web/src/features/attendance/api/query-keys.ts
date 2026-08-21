import type { AttendanceQuery } from "@/types/attendance";

export const attendanceKeys = {
  all: ["attendance"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: (query: AttendanceQuery) => [...attendanceKeys.lists(), query] as const,
  mine: (query: AttendanceQuery) => [...attendanceKeys.all, "mine", query] as const
};
