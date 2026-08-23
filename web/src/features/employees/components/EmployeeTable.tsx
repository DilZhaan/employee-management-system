import { Eye, Pencil, Power } from "lucide-react";
import { Link } from "react-router-dom";
import { RoleBadge } from "@/components/common/RoleBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatFullName } from "@/lib/format";
import type { DepartmentResponse } from "@/types/department";
import type { EmployeeResponse } from "@/types/employee";

interface EmployeeTableProps {
  employees: EmployeeResponse[];
  departments: DepartmentResponse[];
  managers: EmployeeResponse[];
  canManage: boolean;
  onEdit: (employee: EmployeeResponse) => void;
  onDeactivate: (employee: EmployeeResponse) => void;
  onActivate: (employee: EmployeeResponse) => void;
}

export function EmployeeTable({ employees, departments, managers, canManage, onEdit, onDeactivate, onActivate }: EmployeeTableProps) {
  const departmentById = new Map(departments.map((department) => [department.id, department]));
  const managerById = new Map(managers.map((manager) => [manager.id, manager]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-230 border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Code
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Employee
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Department
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Role
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Manager
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {employees.map((employee) => {
            const manager = employee.managerId ? managerById.get(employee.managerId) : undefined;
            const department = departmentById.get(employee.departmentId);
            return (
              <tr key={employee.id} className="bg-white">
                <td className="px-4 py-3 font-medium text-slate-950">{employee.employeeCode}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-950">{formatFullName(employee.firstName, employee.lastName)}</div>
                  <div className="text-slate-600">{employee.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{department ? department.name : "Unknown"}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={employee.role} />
                </td>
                <td className="px-4 py-3 text-slate-700">{manager ? formatFullName(manager.firstName, manager.lastName) : "None"}</td>
                <td className="px-4 py-3">
                  <StatusBadge isActive={employee.isActive} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" aria-label={`View ${employee.firstName} ${employee.lastName}`}>
                      <Link to={`/employees/${employee.id}`}>
                        <Eye className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    {canManage ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(employee)} aria-label={`Edit ${employee.firstName} ${employee.lastName}`}>
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => (employee.isActive ? onDeactivate(employee) : onActivate(employee))}
                          aria-label={`${employee.isActive ? "Deactivate" : "Activate"} ${employee.firstName} ${employee.lastName}`}
                        >
                          {employee.isActive ? (
                            <Power className="size-4" aria-hidden="true" />
                          ) : (
                            <Power className="size-4 text-emerald-700" aria-hidden="true" />
                          )}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
