import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDepartment, getDepartments } from "@/api/endpoints/departments";
import { departmentKeys } from "@/features/departments/api/query-keys";
import type { DepartmentQuery } from "@/types/department";

export function useDepartments(query: DepartmentQuery) {
  return useQuery({
    queryKey: departmentKeys.list(query),
    queryFn: () => getDepartments(query),
    placeholderData: keepPreviousData
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => getDepartment(id)
  });
}
