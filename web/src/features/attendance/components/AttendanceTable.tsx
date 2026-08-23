import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/format";
import type { AttendanceResponse } from "@/types/attendance";

interface AttendanceTableProps {
  records: AttendanceResponse[];
  showEmployee?: boolean;
}

export function AttendanceTable({ records, showEmployee = false }: AttendanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-190 border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
          <tr>
            {showEmployee ? <th className="px-4 py-3 font-semibold">Employee</th> : null}
            <th className="px-4 py-3 font-semibold">Work date</th>
            <th className="px-4 py-3 font-semibold">Check in</th>
            <th className="px-4 py-3 font-semibold">Check out</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Device</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {records.map((record) => (
            <tr key={record.id} className="bg-white">
              {showEmployee ? (
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-950">{record.employeeName}</div>
                  <div className="font-mono text-xs text-slate-500">{record.employeeCode}</div>
                </td>
              ) : null}
              <td className="px-4 py-3 text-slate-950">{formatDate(record.workDate)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(record.checkInTime)}</td>
              <td className="px-4 py-3 text-slate-700">{record.checkOutTime ? formatDateTime(record.checkOutTime) : "Open"}</td>
              <td className="px-4 py-3">
                <Badge tone={record.status === "Late" ? "warning" : "success"}>{record.status}</Badge>
              </td>
              <td className="px-4 py-3 text-slate-700">{record.deviceType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
