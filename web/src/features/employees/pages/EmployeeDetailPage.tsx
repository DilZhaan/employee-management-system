import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleBadge } from "@/components/common/RoleBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useEmployee, useEmployees } from "@/features/employees/hooks/useEmployees";
import { formatDate, formatFullName } from "@/lib/format";

export function EmployeeDetailPage() {
  const { id } = useParams();
  const employeeQuery = useEmployee(id ?? "");
  const departmentsQuery = useDepartments({ page: 1, pageSize: 100 });
  const managersQuery = useEmployees({ page: 1, pageSize: 100, isActive: true });

  if (!id) {
    return <ErrorState title="Unable to load employee." error={{ kind: "not-found", title: "Employee was not found.", original: null }} />;
  }

  if (employeeQuery.isLoading || departmentsQuery.isLoading || managersQuery.isLoading) {
    return <TableSkeleton columns={2} rows={6} />;
  }

  if (employeeQuery.isError) {
    return <ErrorState title="Unable to load employee." error={normalizeApiError(employeeQuery.error)} onRetry={() => void employeeQuery.refetch()} />;
  }

  if (!employeeQuery.data) {
    return <ErrorState title="Unable to load employee." error={{ kind: "not-found", title: "Employee was not found.", original: null }} />;
  }

  if (departmentsQuery.isError || managersQuery.isError) {
    return (
      <ErrorState
        title="Unable to load employee references."
        error={normalizeApiError(departmentsQuery.error ?? managersQuery.error)}
        onRetry={() => void Promise.all([departmentsQuery.refetch(), managersQuery.refetch()])}
      />
    );
  }

  const employee = employeeQuery.data;
  const department = departmentsQuery.data?.items.find((item) => item.id === employee.departmentId);
  const manager = managersQuery.data?.items.find((item) => item.id === employee.managerId);

  return (
    <section className="space-y-6">
      <PageHeader
        title={formatFullName(employee.firstName, employee.lastName)}
        description={employee.employeeCode}
        actions={
          <Button asChild variant="outline">
            <Link to="/employees">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Employees
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-5 p-5 md:grid-cols-2">
          <Detail label="Employee code" value={employee.employeeCode} />
          <Detail label="Email" value={employee.email} />
          <Detail label="Phone" value={employee.phoneNumber ?? "Not provided"} />
          <Detail label="Department" value={department ? `${department.code} - ${department.name}` : "Unknown"} />
          <Detail label="Role" value={<RoleBadge role={employee.role} />} />
          <Detail label="Manager" value={manager ? formatFullName(manager.firstName, manager.lastName) : "None"} />
          <Detail label="Status" value={<StatusBadge isActive={employee.isActive} />} />
          <Detail label="Created" value={formatDate(employee.createdAt)} />
        </CardContent>
      </Card>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-950">{value}</dd>
    </div>
  );
}
