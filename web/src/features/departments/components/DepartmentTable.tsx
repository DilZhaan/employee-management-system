import { Pencil, Power } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { DepartmentResponse } from "@/types/department";

interface DepartmentTableProps {
  departments: DepartmentResponse[];
  canManage: boolean;
  onEdit: (department: DepartmentResponse) => void;
  onDeactivate: (department: DepartmentResponse) => void;
  onActivate: (department: DepartmentResponse) => void;
}

export function DepartmentTable({ departments, canManage, onEdit, onDeactivate, onActivate }: DepartmentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Code
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Department
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Created
            </th>
            {canManage ? (
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {departments.map((department) => (
            <tr key={department.id} className="bg-white">
              <td className="px-4 py-3 font-medium text-slate-950">{department.code}</td>
              <td className="px-4 py-3 text-slate-700">{department.name}</td>
              <td className="px-4 py-3">
                <StatusBadge isActive={department.isActive} />
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDate(department.createdAt)}</td>
              {canManage ? (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(department)} aria-label={`Edit ${department.name}`}>
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => (department.isActive ? onDeactivate(department) : onActivate(department))}
                      aria-label={`${department.isActive ? "Deactivate" : "Activate"} ${department.name}`}
                    >
                      {department.isActive ? (
                        <Power className="size-4" aria-hidden="true" />
                      ) : (
                        <Power className="size-4 text-emerald-700" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
