import type { DepartmentQuery } from "@/types/department";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: (query: DepartmentQuery) => [...departmentKeys.lists(), query] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const
};
