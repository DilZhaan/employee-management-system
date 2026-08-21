import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { TodayAttendanceSummary } from "@/features/attendance/utils/todayAttendance";
import { colors, spacing } from "@/theme";
import { formatTime } from "@/utils/date";

interface TodayAttendanceCardProps {
  summary: TodayAttendanceSummary;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export function TodayAttendanceCard({
  summary,
  isCheckingIn,
  isCheckingOut,
  onCheckIn,
  onCheckOut
}: TodayAttendanceCardProps) {
  const hasCheckInAction = summary.state === "not_checked_in";
  const hasCheckOutAction = summary.state === "checked_in";
  const hasCompletedDay = summary.state === "completed";

  return (
    <Card style={styles.card}>
      <View style={styles.statusRow}>
        <AppText muted>Status</AppText>
        <AppText style={styles.statusValue}>{summary.status}</AppText>
      </View>

      <View style={styles.divider} />

      <View style={styles.timesRow}>
        <View style={styles.timeColumn}>
          <AppText variant="caption" muted>Check In</AppText>
          <AppText variant="subtitle">{summary.checkInTime ? formatTime(summary.checkInTime) : "—"}</AppText>
        </View>
        <View style={styles.timeColumn}>
          <AppText variant="caption" muted>Check Out</AppText>
          <AppText variant="subtitle">{summary.checkOutTime ? formatTime(summary.checkOutTime) : "—"}</AppText>
        </View>
      </View>

      {hasCheckInAction ? <Button label="Check In" onPress={onCheckIn} loading={isCheckingIn} /> : null}
      {hasCheckOutAction ? <Button label="Check Out" onPress={onCheckOut} loading={isCheckingOut} /> : null}
      {hasCompletedDay ? <AppText muted style={styles.completedText}>Your attendance for today is complete.</AppText> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  statusValue: {
    fontWeight: "600"
  },
  divider: {
    height: 1,
    backgroundColor: colors.border
  },
  timesRow: {
    flexDirection: "row"
  },
  timeColumn: {
    flex: 1,
    gap: spacing.xs
  },
  completedText: {
    textAlign: "center"
  }
});
