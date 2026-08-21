import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import type { LeaveStackParamList } from "@/app/navigation/types";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeaveRequestCard } from "@/features/leave/components/LeaveRequestCard";
import { useMyLeaveRequests } from "@/features/leave/hooks/useLeave";
import type { LeaveRequest } from "@/types/leave";
import { colors, spacing } from "@/theme";

export function LeaveScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<LeaveStackParamList, "LeaveList">>();
  const leaveQuery = useMyLeaveRequests();

  const isInitialLoading = leaveQuery.isLoading && leaveQuery.items.length === 0;
  const isInitialError = leaveQuery.isError && leaveQuery.items.length === 0;
  const isEmpty = leaveQuery.isSuccess && leaveQuery.items.length === 0;

  return (
    <Screen>
      <AppText variant="title">Leave</AppText>
      <Button label="Request Leave" onPress={() => navigation.navigate("RequestLeave")} />
      <SectionHeader title="My Requests" />

      {isInitialLoading ? <LoadingState label="Loading leave requests..." /> : null}
      {isInitialError ? (
        <ErrorState
          title="Unable to load leave requests."
          onRetry={() => {
            void leaveQuery.refetch();
          }}
        />
      ) : null}
      {isEmpty ? <EmptyState title="No leave requests yet." message="Create a leave request to get started." icon="calendar-outline" /> : null}

      {leaveQuery.items.length > 0 ? (
        <FlatList
          testID="leave-list"
          contentContainerStyle={styles.list}
          data={leaveQuery.items}
          keyExtractor={(item) => item.id}
          renderItem={renderLeaveItem}
          onEndReached={() => {
            if (leaveQuery.hasNextPage && !leaveQuery.isFetchingNextPage) {
              void leaveQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          refreshing={leaveQuery.isRefetching}
          onRefresh={() => {
            void leaveQuery.refetch();
          }}
          ListFooterComponent={
            leaveQuery.isFetchingNextPage ? (
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

function renderLeaveItem({ item }: { item: LeaveRequest }) {
  return <LeaveRequestCard request={item} />;
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
