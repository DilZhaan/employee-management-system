import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getEmployee, getEmployees } from "@/api/endpoints/employees";
import { employeeKeys } from "@/features/employees/api/query-keys";
import type { EmployeeQuery } from "@/types/employee";

export function useEmployees(query: EmployeeQuery) {
  return useQuery({
    queryKey: employeeKeys.list(query),
    queryFn: () => getEmployees(query),
    placeholderData: keepPreviousData
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => getEmployee(id)
  });
}
