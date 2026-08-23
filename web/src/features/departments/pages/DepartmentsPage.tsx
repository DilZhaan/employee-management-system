import { Plus, RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { normalizeApiError } from "@/api/errors";
import { useAuth } from "@/auth/use-auth";
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
import { useDebouncedValue } from "@/features/common/useDebouncedValue";
import { useApiErrorToast } from "@/features/common/useApiErrorToast";
import { getOptionalBoolean, getPositiveInt, useListSearchParams } from "@/features/common/list-params";
import { DepartmentForm } from "@/features/departments/components/DepartmentForm";
import { DepartmentTable } from "@/features/departments/components/DepartmentTable";
import { useActivateDepartment, useCreateDepartment, useDeactivateDepartment, useUpdateDepartment } from "@/features/departments/hooks/useDepartmentMutations";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import type { DepartmentFormValues } from "@/features/departments/schemas/department.schema";
import type { DepartmentQuery, DepartmentResponse } from "@/types/department";

const defaultPageSize = 20;
const validPageSizes = new Set([10, 20, 50]);

export function DepartmentsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { searchParams, updateSearchParams, setSearchParams } = useListSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentResponse | null>(null);
  const [deactivatingDepartment, setDeactivatingDepartment] = useState<DepartmentResponse | null>(null);
  const [activatingDepartment, setActivatingDepartment] = useState<DepartmentResponse | null>(null);
  const debouncedSearch = useDebouncedValue(searchInput);
  const pageSizeParam = getPositiveInt(searchParams.get("pageSize"), defaultPageSize);
  const pageSize = validPageSizes.has(pageSizeParam) ? pageSizeParam : defaultPageSize;
  const query: DepartmentQuery = {
    page: getPositiveInt(searchParams.get("page"), 1),
    pageSize,
    search: searchParams.get("search") || undefined,
    isActive: getOptionalBoolean(searchParams.get("isActive"))
  };
  const canManage = user?.role === "Admin";
  const departmentsQuery = useDepartments(query);
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment(editingDepartment?.id ?? "");
  const deactivateMutation = useDeactivateDepartment();
  const activateMutation = useActivateDepartment();
  const hasFilters = Boolean(query.search || query.isActive !== undefined);
  useApiErrorToast(departmentsQuery.error, "Unable to load departments");
  useApiErrorToast(createMutation.error, "Unable to create department");
  useApiErrorToast(updateMutation.error, "Unable to update department");
  useApiErrorToast(deactivateMutation.error, "Unable to deactivate department");
  useApiErrorToast(activateMutation.error, "Unable to activate department");

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debouncedSearch !== current) {
      updateSearchParams({ search: debouncedSearch.trim() || undefined });
    }
  }, [debouncedSearch, searchParams, updateSearchParams]);

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

  function handleCreate(values: DepartmentFormValues) {
    createMutation.mutate(values, {
      onSuccess: () => {
        setCreateOpen(false);
        showToast({ title: "Department created", tone: "success" });
      }
    });
  }

  function handleUpdate(values: DepartmentFormValues) {
    if (!editingDepartment) {
      return;
    }

    updateMutation.mutate(values, {
      onSuccess: () => {
        setEditingDepartment(null);
        showToast({ title: "Department updated", tone: "success" });
      }
    });
  }

  function confirmDeactivate() {
    if (!deactivatingDepartment) {
      return;
    }

    deactivateMutation.mutate(deactivatingDepartment.id, {
      onSuccess: () => {
        setDeactivatingDepartment(null);
        showToast({ title: "Department deactivated", tone: "success" });
      }
    });
  }

  function confirmActivate() {
    if (!activatingDepartment) {
      return;
    }

    activateMutation.mutate(activatingDepartment.id, {
      onSuccess: () => {
        setActivatingDepartment(null);
        showToast({ title: "Department activated", tone: "success" });
      }
    });
  }

  const pageData = departmentsQuery.data;
  const departmentCount = pageData?.items.length ?? 0;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage organizational departments."
        actions={
          canManage ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Add department
            </Button>
          ) : undefined
        }
      />

      <Card className="overflow-hidden">
        <div className="grid gap-4 border-b border-slate-200 p-4 md:grid-cols-[minmax(18rem,1fr)_10rem_auto]">
          <div className="space-y-2">
            <Label htmlFor="department-search">Search departments</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                key={searchParams.get("search") ?? "empty"}
                id="department-search"
                className="pl-9"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name or code"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department-status-filter">Status</Label>
            <Select id="department-status-filter" value={query.isActive === undefined ? "" : String(query.isActive)} onChange={(event) => updateSearchParams({ isActive: event.target.value || undefined })}>
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

        {departmentsQuery.isLoading ? <TableSkeleton columns={canManage ? 5 : 4} /> : null}
        {departmentsQuery.isError ? (
          <ErrorState title="Unable to load departments." error={normalizeApiError(departmentsQuery.error)} onRetry={() => void departmentsQuery.refetch()} />
        ) : null}
        {departmentsQuery.isSuccess && departmentCount === 0 ? (
          <EmptyState
            title={hasFilters ? "No departments found." : "No departments exist."}
            description={hasFilters ? "Try adjusting your search or filters." : "Create the first department to get started."}
            action={canManage && !hasFilters ? <Button onClick={() => setCreateOpen(true)}>Add department</Button> : undefined}
          />
        ) : null}
        {departmentsQuery.isSuccess && departmentCount > 0 ? (
          <DepartmentTable
            departments={pageData?.items ?? []}
            canManage={canManage}
            onEdit={setEditingDepartment}
            onDeactivate={setDeactivatingDepartment}
            onActivate={setActivatingDepartment}
          />
        ) : null}

        {pageData && departmentCount > 0 ? (
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
            <DialogTitle>Add department</DialogTitle>
            <DialogDescription>Create a department record for employee assignment.</DialogDescription>
          </DialogHeader>
          <DepartmentForm isSubmitting={createMutation.isPending} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingDepartment)} onOpenChange={(open) => !open && setEditingDepartment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit department</DialogTitle>
            <DialogDescription>Update the department name and code.</DialogDescription>
          </DialogHeader>
          {editingDepartment ? (
            <DepartmentForm
              department={editingDepartment}
              isSubmitting={updateMutation.isPending}
              onSubmit={handleUpdate}
              onCancel={() => setEditingDepartment(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deactivatingDepartment)} onOpenChange={(open) => !open && setDeactivatingDepartment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate department?</DialogTitle>
            <DialogDescription>{deactivatingDepartment ? `${deactivatingDepartment.name} will be marked inactive.` : null}</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDeactivatingDepartment(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDeactivate} disabled={deactivateMutation.isPending}>
              {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activatingDepartment)} onOpenChange={(open) => !open && setActivatingDepartment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Activate department?</DialogTitle>
            <DialogDescription>{activatingDepartment ? `${activatingDepartment.name} will be marked active.` : null}</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setActivatingDepartment(null)}>
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
