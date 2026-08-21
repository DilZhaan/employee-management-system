import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import type { AttendanceLog } from "@/types/attendance";
import { colors, spacing } from "@/theme";
import { formatDateOnly, formatTime } from "@/utils/date";

interface AttendanceHistoryItemProps {
  record: AttendanceLog;
}

export function AttendanceHistoryItem({ record }: AttendanceHistoryItemProps) {
  const isLate = record.status === "Late";

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="subtitle">{formatDateOnly(record.workDate)}</AppText>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, isLate ? styles.dotLate : styles.dotPresent]} />
          <AppText variant="small">{record.status}</AppText>
        </View>
      </View>

      <View style={styles.timesRow}>
        <View style={styles.timeColumn}>
          <AppText variant="caption" muted>Check In</AppText>
          <AppText>{formatTime(record.checkInTime)}</AppText>
        </View>
        <View style={styles.timeColumn}>
          <AppText variant="caption" muted>Check Out</AppText>
          <AppText>{record.checkOutTime ? formatTime(record.checkOutTime) : "—"}</AppText>
        </View>
      </View>
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
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  dotPresent: {
    backgroundColor: colors.success
  },
  dotLate: {
    backgroundColor: colors.warning
  },
  timesRow: {
    flexDirection: "row"
  },
  timeColumn: {
    flex: 1,
    gap: spacing.xs
  }
});
