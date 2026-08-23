import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateEmployee, createEmployee, deactivateEmployee, updateEmployee } from "@/api/endpoints/employees";
import { departmentKeys } from "@/features/departments/api/query-keys";
import { employeeKeys } from "@/features/employees/api/query-keys";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/types/employee";

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateEmployeeRequest) => createEmployee(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    }
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateEmployeeRequest) => updateEmployee(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    }
  });
}

export function useDeactivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateEmployee(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    }
  });
}

export function useActivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateEmployee(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    }
  });
}
