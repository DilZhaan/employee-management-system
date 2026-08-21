import { Badge } from "@/components/ui/badge";
import type { LeaveStatus } from "@/types/leave";

const tones: Record<LeaveStatus, "warning" | "success" | "danger"> = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger"
};

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return <Badge tone={tones[status]}>{status}</Badge>;
}
