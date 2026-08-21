import type { LeaveRequestQuery } from "@/types/leave";

export const leaveKeys = {
  all: ["leave"] as const,
  lists: () => [...leaveKeys.all, "list"] as const,
  list: (query: LeaveRequestQuery) => [...leaveKeys.lists(), query] as const,
  mine: (query: LeaveRequestQuery) => [...leaveKeys.all, "mine", query] as const
};
