import { Badge } from "@/components/ui/badge";
import type { EmployeeRole } from "@/types/auth";

const roleTone: Record<EmployeeRole, "info" | "warning" | "neutral"> = {
  Admin: "warning",
  Manager: "info",
  Employee: "neutral"
};

export function RoleBadge({ role }: { role: EmployeeRole }) {
  return <Badge tone={roleTone[role]}>{role}</Badge>;
}
