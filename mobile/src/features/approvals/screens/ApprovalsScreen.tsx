import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";

import type { ApprovalsStackParamList } from "@/app/navigation/types";
import { canAccessApprovals } from "@/auth/authorization";
import { useAuth } from "@/auth/useAuth";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeaveRequestCard } from "@/features/leave/components/LeaveRequestCard";
import { leaveKeys } from "@/features/leave/api/queryKeys";
import { useReviewableLeaveRequests } from "@/features/leave/hooks/useLeave";
import { colors, spacing } from "@/theme";

export function ApprovalsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigation = useNavigation<NativeStackNavigationProp<ApprovalsStackParamList, "ApprovalsList">>();
  const canReview = canAccessApprovals(user);
  const query = useReviewableLeaveRequests(20, canReview);

  if (!canReview) {
    return (
      <Screen>
        <ErrorState title="Access denied." message="You do not have permission to view leave approvals." />
      </Screen>
    );
  }

  const isInitialLoading = query.isLoading && query.items.length === 0;
  const isInitialError = query.isError && query.items.length === 0;
  const isEmpty = query.isSuccess && query.items.length === 0;

  return (
    <Screen>
      <AppText variant="title">Leave Approvals</AppText>
      <SectionHeader title="Pending Requests" />

      {isInitialLoading ? <LoadingState label="Loading pending requests..." /> : null}
      {isInitialError ? (
        <ErrorState
          title="Unable to load leave requests."
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : null}
      {isEmpty ? <EmptyState title="No pending leave requests." icon="checkmark-done-outline" /> : null}

      {query.items.length > 0 ? (
        <FlatList
          testID="approvals-list"
          contentContainerStyle={styles.list}
          data={query.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                queryClient.setQueryData(leaveKeys.detail(item.id), item);
                navigation.navigate("ApprovalReview", { requestId: item.id });
              }}
              style={({ pressed }) => pressed && styles.cardPressed}
            >
              <LeaveRequestCard request={item} showEmployeeCode />
            </Pressable>
          )}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) {
              void query.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          refreshing={query.isRefetching}
          onRefresh={() => {
            void query.refetch();
          }}
          ListFooterComponent={
            query.isFetchingNextPage ? (
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

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  footer: {
    paddingVertical: spacing.md
  },
  cardPressed: {
    opacity: 0.7
  }
});
