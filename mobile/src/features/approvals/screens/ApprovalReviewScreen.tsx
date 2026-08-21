import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Alert, StyleSheet, View } from "react-native";

import type { ApprovalsStackParamList } from "@/app/navigation/types";
import { canAccessApprovals } from "@/auth/authorization";
import { useAuth } from "@/auth/useAuth";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Screen } from "@/components/ui/Screen";
import { leaveKeys } from "@/features/leave/api/queryKeys";
import { LeaveStatusBadge } from "@/features/leave/components/LeaveStatusBadge";
import { getLeaveErrorMessage, useApproveLeaveRequest, useRejectLeaveRequest } from "@/features/leave/hooks/useLeave";
import { spacing } from "@/theme";
import type { LeaveRequest } from "@/types/leave";
import { formatDateOnly, formatDateTime } from "@/utils/date";

type ApprovalReviewRoute = RouteProp<ApprovalsStackParamList, "ApprovalReview">;

export function ApprovalReviewScreen() {
  const { user } = useAuth();
  const route = useRoute<ApprovalReviewRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<ApprovalsStackParamList, "ApprovalReview">>();
  const queryClient = useQueryClient();
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();
  const request = queryClient.getQueryData<LeaveRequest>(leaveKeys.detail(route.params.requestId));

  if (!canAccessApprovals(user)) {
    return (
      <Screen>
        <ErrorState title="Access denied." message="You do not have permission to review leave requests." />
      </Screen>
    );
  }

  if (!request) {
    return (
      <Screen>
        <ErrorState
          title="Unable to load leave request."
          message="Please return to the approvals list and try again."
          onRetry={() => {
            navigation.goBack();
          }}
        />
      </Screen>
    );
  }

  const isPendingStatus = request.status === "Pending";
  const isMutating = approveMutation.isPending || rejectMutation.isPending;
  const actionError = approveMutation.error ?? rejectMutation.error;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <AppText variant="title">Leave Review</AppText>

        <Card style={styles.card}>
          <Row label="Employee Code" value={request.employeeCode} />
          <Row label="Leave Type" value={request.leaveType} />
          <Row label="Dates" value={`${formatDateOnly(request.startDate)} — ${formatDateOnly(request.endDate)}`} />
          <Row label="Status" valueNode={<LeaveStatusBadge status={request.status} />} />
          <Row label="Submitted" value={formatDateTime(request.appliedOn)} />
          <Row label="Reason" value={request.reason} multiline />
        </Card>

        {actionError ? <ErrorState title="Unable to process request." message={getLeaveErrorMessage(actionError)} /> : null}

        {isPendingStatus ? (
          <View style={styles.actions}>
            <Button
              label={approveMutation.isPending ? "Approving..." : "Approve"}
              disabled={isMutating}
              loading={approveMutation.isPending}
              onPress={() => {
                Alert.alert("Approve Leave Request?", "Are you sure you want to approve this request?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Approve",
                    onPress: () => {
                      approveMutation.mutate(request.id, {
                        onSuccess: () => {
                          navigation.goBack();
                        }
                      });
                    }
                  }
                ]);
              }}
            />
            <Button
              label={rejectMutation.isPending ? "Rejecting..." : "Reject"}
              variant="danger"
              disabled={isMutating}
              loading={rejectMutation.isPending}
              onPress={() => {
                Alert.alert("Reject Leave Request?", "Are you sure you want to reject this request?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reject",
                    style: "destructive",
                    onPress: () => {
                      rejectMutation.mutate(request.id, {
                        onSuccess: () => {
                          navigation.goBack();
                        }
                      });
                    }
                  }
                ]);
              }}
            />
          </View>
        ) : (
          <AppText muted>This request has already been processed.</AppText>
        )}
      </View>
    </Screen>
  );
}

function Row({ label, value, valueNode, multiline = false }: { label: string; value?: string; valueNode?: ReactNode; multiline?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText muted>{label}</AppText>
      {valueNode ?? <AppText style={multiline ? styles.rowValueMultiline : undefined}>{value}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  card: {
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  rowValueMultiline: {
    flex: 1,
    marginLeft: spacing.md,
    textAlign: "right"
  },
  actions: {
    gap: spacing.sm
  }
});
