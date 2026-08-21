import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import type { LeaveStatus } from "@/types/leave";
import { colors, radius, spacing } from "@/theme";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

const dotColors: Record<LeaveStatus, string> = {
  Pending: colors.warning,
  Approved: colors.success,
  Rejected: colors.danger,
};

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  return (
    <View style={[styles.badge, toneStyles[status]]}>
      <View style={[styles.dot, { backgroundColor: dotColors[status] }]} />
      <AppText variant="small" style={styles.text}>
        {status}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  text: {
    fontWeight: "700"
  }
});

const toneStyles = StyleSheet.create({
  Pending: {
    backgroundColor: colors.warningSurface
  },
  Approved: {
    backgroundColor: colors.successSurface
  },
  Rejected: {
    backgroundColor: colors.dangerSurface
  }
});
