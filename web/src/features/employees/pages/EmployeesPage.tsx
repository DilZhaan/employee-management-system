import { Plus, RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { normalizeApiError } from "@/api/errors";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-context";
import { useAuth } from "@/auth/use-auth";
import { useListSearchParams, getOptionalBoolean, getPositiveInt } from "@/features/common/list-params";
import { useDebouncedValue } from "@/features/common/useDebouncedValue";
import { useApiErrorToast } from "@/features/common/useApiErrorToast";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { EmployeeForm } from "@/features/employees/components/EmployeeForm";
import { EmployeeTable } from "@/features/employees/components/EmployeeTable";
import { useActivateEmployee, useCreateEmployee, useDeactivateEmployee, useUpdateEmployee } from "@/features/employees/hooks/useEmployeeMutations";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { formatFullName } from "@/lib/format";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/types/auth";
import type { CreateEmployeeRequest, EmployeeQuery, EmployeeResponse, UpdateEmployeeRequest } from "@/types/employee";

const defaultPageSize = 20;
const validPageSizes = new Set([10, 20, 50]);

export function EmployeesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { searchParams, updateSearchParams, setSearchParams } = useListSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<EmployeeResponse | null>(null);
  const [activatingEmployee, setActivatingEmployee] = useState<EmployeeResponse | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput);
  const pageSizeParam = getPositiveInt(searchParams.get("pageSize"), defaultPageSize);
  const pageSize = validPageSizes.has(pageSizeParam) ? pageSizeParam : defaultPageSize;
  const role = getRoleParam(searchParams.get("role"));
  const query: EmployeeQuery = {
    page: getPositiveInt(searchParams.get("page"), 1),
    pageSize,
    search: searchParams.get("search") || undefined,
    departmentId: searchParams.get("departmentId") || undefined,
    role,
    isActive: getOptionalBoolean(searchParams.get("isActive"))
  };
  const canManage = user?.role === "Admin";
  const employeesQuery = useEmployees(query);
  const departmentsQuery = useDepartments({ page: 1, pageSize: 100, isActive: true });
  const managersQuery = useEmployees({ page: 1, pageSize: 100, isActive: true });
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee(editingEmployee?.id ?? "");
  const deactivateMutation = useDeactivateEmployee();
  const activateMutation = useActivateEmployee();
  const departments = useMemo(() => departmentsQuery.data?.items ?? [], [departmentsQuery.data?.items]);
  const managers = useMemo(() => managersQuery.data?.items ?? [], [managersQuery.data?.items]);
  const hasFilters = Boolean(query.search || query.departmentId || query.role || query.isActive !== undefined);
  useApiErrorToast(employeesQuery.error, "Unable to load employees");
  useApiErrorToast(departmentsQuery.error ?? managersQuery.error, "Unable to load employee references");
  useApiErrorToast(createMutation.error, "Unable to create employee");
  useApiErrorToast(updateMutation.error, "Unable to update employee");
  useApiErrorToast(deactivateMutation.error, "Unable to deactivate employee");
  useApiErrorToast(activateMutation.error, "Unable to activate employee");

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debouncedSearch !== current) {
      updateSearchParams({ search: debouncedSearch.trim() || undefined });
    }
  }, [debouncedSearch, searchParams, updateSearchParams]);

  const pageData = employeesQuery.data;
  const employeeCount = pageData?.items.length ?? 0;

  function changePage(page: number) {
    updateSearchParams({ page: String(page) }, false);
  }

  function changePageSize(nextPageSize: number) {
    updateSearchParams({ pageSize: String(nextPageSize) });
  }

  function resetFilters() {
    setSearchInput("");
    setSearchParams({ page: "1", pageSize: String(pageSize) });
  }

  function handleCreate(values: CreateEmployeeRequest | UpdateEmployeeRequest) {
    createMutation.mutate(values as CreateEmployeeRequest, {
      onSuccess: () => {
        setCreateOpen(false);
        showToast({ title: "Employee created", tone: "success" });
      }
    });
  }

  function handleUpdate(values: CreateEmployeeRequest | UpdateEmployeeRequest) {
    if (!editingEmployee) {
      return;
    }

    updateMutation.mutate(values as UpdateEmployeeRequest, {
      onSuccess: () => {
        setEditingEmployee(null);
        showToast({ title: "Employee updated", tone: "success" });
      }
    });
  }

  function confirmDeactivate() {
    if (!deactivatingEmployee) {
      return;
    }

    deactivateMutation.mutate(deactivatingEmployee.id, {
      onSuccess: () => {
        showToast({ title: "Employee deactivated", tone: "success" });
        setDeactivatingEmployee(null);
      }
    });
  }

  function confirmActivate() {
    if (!activatingEmployee) {
      return;
    }

    activateMutation.mutate(activatingEmployee.id, {
      onSuccess: () => {
        showToast({ title: "Employee activated", tone: "success" });
        setActivatingEmployee(null);
      }
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage employees and organizational assignments."
        actions={
          canManage ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Add employee
            </Button>
          ) : undefined
        }
      />

      <Card className="overflow-hidden">
        <div className="grid gap-4 border-b border-slate-200 p-4 lg:grid-cols-[minmax(18rem,1fr)_12rem_10rem_10rem_auto]">
          <div className="space-y-2">
            <Label htmlFor="employee-search">Search employees</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                key={searchParams.get("search") ?? "empty"}
                id="employee-search"
                className="pl-9"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, email, or code"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department-filter">Department</Label>
            <Select id="department-filter" value={query.departmentId ?? ""} onChange={(event) => updateSearchParams({ departmentId: event.target.value || undefined })}>
              <option value="">All</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-filter">Role</Label>
            <Select id="role-filter" value={query.role ?? ""} onChange={(event) => updateSearchParams({ role: event.target.value || undefined })}>
              <option value="">All</option>
              {EMPLOYEE_ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select id="status-filter" value={query.isActive === undefined ? "" : String(query.isActive)} onChange={(event) => updateSearchParams({ isActive: event.target.value || undefined })}>
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={resetFilters} disabled={!hasFilters}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </Button>
          </div>
        </div>

        {employeesQuery.isLoading || departmentsQuery.isLoading || managersQuery.isLoading ? <TableSkeleton columns={7} /> : null}
        {employeesQuery.isError ? (
          <ErrorState title="Unable to load employees." error={normalizeApiError(employeesQuery.error)} onRetry={() => void employeesQuery.refetch()} />
        ) : null}
        {departmentsQuery.isError || managersQuery.isError ? (
          <ErrorState
            title="Unable to load employee references."
            error={normalizeApiError(departmentsQuery.error ?? managersQuery.error)}
            onRetry={() => void Promise.all([departmentsQuery.refetch(), managersQuery.refetch()])}
          />
        ) : null}
        {employeesQuery.isSuccess && departmentsQuery.isSuccess && managersQuery.isSuccess && employeeCount === 0 ? (
          <EmptyState
            title={hasFilters ? "No employees found." : "No employees exist."}
            description={hasFilters ? "Try adjusting your search or filters." : "Create the first employee profile to get started."}
            action={canManage && !hasFilters ? <Button onClick={() => setCreateOpen(true)}>Add employee</Button> : undefined}
          />
        ) : null}
        {employeesQuery.isSuccess && departmentsQuery.isSuccess && managersQuery.isSuccess && employeeCount > 0 ? (
          <EmployeeTable
            employees={pageData?.items ?? []}
            departments={departments}
            managers={managers}
            canManage={canManage}
            onEdit={setEditingEmployee}
            onDeactivate={setDeactivatingEmployee}
            onActivate={setActivatingEmployee}
          />
        ) : null}

        {pageData && employeeCount > 0 ? (
          <Pagination
            page={pageData.page}
            pageSize={pageData.pageSize}
            totalCount={pageData.totalCount}
            totalPages={pageData.totalPages}
            onPageChange={changePage}
            onPageSizeChange={changePageSize}
          />
        ) : null}
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add employee</DialogTitle>
            <DialogDescription>Create a profile and sign-in credentials for a new employee.</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            mode="create"
            departments={departments}
            managers={managers}
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingEmployee)} onOpenChange={(open) => !open && setEditingEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit employee</DialogTitle>
            <DialogDescription>Update profile details, role, department, and manager assignment.</DialogDescription>
          </DialogHeader>
          {editingEmployee ? (
            <EmployeeForm
              mode="edit"
              employee={editingEmployee}
              departments={departments}
              managers={managers}
              isSubmitting={updateMutation.isPending}
              onSubmit={handleUpdate}
              onCancel={() => setEditingEmployee(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deactivatingEmployee)} onOpenChange={(open) => !open && setDeactivatingEmployee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate employee?</DialogTitle>
            <DialogDescription>
              {deactivatingEmployee ? `${formatFullName(deactivatingEmployee.firstName, deactivatingEmployee.lastName)} will be marked inactive.` : null}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDeactivatingEmployee(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDeactivate} disabled={deactivateMutation.isPending}>
              {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activatingEmployee)} onOpenChange={(open) => !open && setActivatingEmployee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Activate employee?</DialogTitle>
            <DialogDescription>
              {activatingEmployee ? `${formatFullName(activatingEmployee.firstName, activatingEmployee.lastName)} will be marked active.` : null}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setActivatingEmployee(null)}>
              Cancel
            </Button>
            <Button onClick={confirmActivate} disabled={activateMutation.isPending}>
              {activateMutation.isPending ? "Activating..." : "Activate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function getRoleParam(value: string | null): EmployeeRole | undefined {
  return EMPLOYEE_ROLES.includes(value as EmployeeRole) ? (value as EmployeeRole) : undefined;
}
