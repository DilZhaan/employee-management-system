import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AttendanceHistoryItem } from "@/features/attendance/components/AttendanceHistoryItem";
import { useAttendanceHistory } from "@/features/attendance/hooks/useAttendance";
import type { AttendanceLog } from "@/types/attendance";
import { colors, spacing } from "@/theme";

export function AttendanceScreen() {
  const historyQuery = useAttendanceHistory();

  const isInitialLoading = historyQuery.isLoading && historyQuery.items.length === 0;
  const isInitialError = historyQuery.isError && historyQuery.items.length === 0;
  const isEmpty = historyQuery.isSuccess && historyQuery.items.length === 0;

  return (
    <Screen>
      <AppText variant="title">Attendance</AppText>
      <SectionHeader title="History" />

      {isInitialLoading ? <LoadingState label="Loading attendance history..." /> : null}
      {isInitialError ? (
        <ErrorState
          title="Unable to load attendance."
          onRetry={() => {
            void historyQuery.refetch();
          }}
        />
      ) : null}
      {isEmpty ? <EmptyState title="No attendance records yet." icon="time-outline" /> : null}

      {historyQuery.items.length > 0 ? (
        <FlatList
          testID="attendance-history-list"
          contentContainerStyle={styles.list}
          data={historyQuery.items}
          keyExtractor={(item) => item.id}
          renderItem={renderAttendanceItem}
          onEndReached={() => {
            if (historyQuery.hasNextPage && !historyQuery.isFetchingNextPage) {
              void historyQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          refreshing={historyQuery.isRefetching}
          onRefresh={() => {
            void historyQuery.refetch();
          }}
          ListFooterComponent={
            historyQuery.isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
        />
      ) : null}
    </Screen>
  );
}

function renderAttendanceItem({ item }: { item: AttendanceLog }) {
  return <AttendanceHistoryItem record={item} />;
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  footer: {
    paddingVertical: spacing.md
  }
});
