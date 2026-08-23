import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateDepartment, createDepartment, deactivateDepartment, updateDepartment } from "@/api/endpoints/departments";
import { departmentKeys } from "@/features/departments/api/query-keys";
import { employeeKeys } from "@/features/employees/api/query-keys";
import type { CreateDepartmentRequest, UpdateDepartmentRequest } from "@/types/department";

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateDepartmentRequest) => createDepartment(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    }
  });
}

export function useUpdateDepartment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateDepartmentRequest) => updateDepartment(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    }
  });
}

export function useDeactivateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateDepartment(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    }
  });
}

export function useActivateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateDepartment(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    }
  });
}
