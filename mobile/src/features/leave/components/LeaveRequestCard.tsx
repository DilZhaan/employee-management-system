import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { LeaveStatusBadge } from "@/features/leave/components/LeaveStatusBadge";
import type { LeaveRequest } from "@/types/leave";
import { spacing } from "@/theme";
import { formatDateOnly } from "@/utils/date";

interface LeaveRequestCardProps {
  request: LeaveRequest;
  showEmployeeCode?: boolean;
}

export function LeaveRequestCard({ request, showEmployeeCode = false }: LeaveRequestCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="subtitle">{request.leaveType}</AppText>
        <LeaveStatusBadge status={request.status} />
      </View>

      <AppText muted>
        {formatDateOnly(request.startDate)} — {formatDateOnly(request.endDate)}
      </AppText>
      {showEmployeeCode ? <AppText muted>Employee: {request.employeeCode}</AppText> : null}

      <AppText numberOfLines={2}>{request.reason}</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
