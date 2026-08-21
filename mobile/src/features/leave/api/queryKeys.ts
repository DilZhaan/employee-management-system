import type { LeaveRequestQueryParams } from "@/types/leave";

export const leaveKeys = {
  all: ["leave"] as const,
  mine: (params: LeaveRequestQueryParams) => [...leaveKeys.all, "mine", params] as const,
  reviewable: (params: LeaveRequestQueryParams) => [...leaveKeys.all, "reviewable", params] as const,
  detail: (id: string) => [...leaveKeys.all, "detail", id] as const
};
