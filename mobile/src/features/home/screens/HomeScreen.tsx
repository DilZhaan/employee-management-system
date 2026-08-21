import { Alert, StyleSheet, View } from "react-native";

import { useAuth } from "@/auth/useAuth";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAttendanceMutationError, useCheckIn, useCheckOut, useTodayAttendance } from "@/features/attendance/hooks/useAttendance";
import { TodayAttendanceCard } from "@/features/attendance/components/TodayAttendanceCard";
import { colors, spacing } from "@/theme";
import { formatDateOnly } from "@/utils/date";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getNameFromEmail(email: string): string {
  const [localPart] = email.split("@");
  const name = localPart.replace(/[._-]/g, " ");
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getInitials(email: string): string {
  const [localPart] = email.split("@");
  const sanitized = localPart.replace(/[^a-zA-Z0-9]/g, "");
  if (!sanitized) return "U";
  return sanitized.slice(0, 2).toUpperCase();
}

export function HomeScreen() {
  const { user } = useAuth();
  const todayAttendance = useTodayAttendance();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const mutationError = checkInMutation.error ?? checkOutMutation.error;
  const displayName = user ? getNameFromEmail(user.email) : "";

  function handleCheckIn(): void {
    checkInMutation.mutate(undefined, {
      onSuccess: () => {
        Alert.alert("Checked in", "Checked in successfully.");
      }
    });
  }

  function handleCheckOut(): void {
    Alert.alert("Check out now?", "This will complete your attendance for today.", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Check Out",
        style: "destructive",
        onPress: () => {
          checkOutMutation.mutate(undefined, {
            onSuccess: () => {
              Alert.alert("Checked out", "Checked out successfully.");
            }
          });
        }
      }
    ]);
  }

  return (
    <Screen scroll>
      <View style={styles.greetingRow}>
        <View style={styles.greetingText}>
          <AppText variant="title">{getGreeting()}{user ? `,` : ""}</AppText>
          {user ? <AppText variant="title">{displayName}</AppText> : null}
          <AppText muted>{formatDateOnly(todayAttendance.workDate)}</AppText>
        </View>
        {user ? (
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>{getInitials(user.email)}</AppText>
          </View>
        ) : null}
      </View>

      <SectionHeader title="Today's Attendance" />

      {todayAttendance.isLoading ? <LoadingState label="Loading today's attendance..." /> : null}
      {todayAttendance.isError ? (
        <ErrorState
          title="Unable to load today's attendance."
          message="Please try again."
          onRetry={() => {
            void todayAttendance.refetch();
          }}
        />
      ) : null}
      {todayAttendance.isSuccess ? (
        <TodayAttendanceCard
          summary={todayAttendance.data}
          isCheckingIn={checkInMutation.isPending}
          isCheckingOut={checkOutMutation.isPending}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      ) : null}

      {mutationError ? (
        <View style={styles.mutationError}>
          <ErrorState title="Attendance action failed." message={getAttendanceMutationError(mutationError)} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  greetingText: {
    flex: 1,
    gap: spacing.xs
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginLeft: spacing.md
  },
  avatarText: {
    color: colors.primaryText,
    fontWeight: "700",
    fontSize: 16
  },
  mutationError: {
    marginTop: spacing.sm
  }
});
