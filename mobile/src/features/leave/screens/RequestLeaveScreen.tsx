import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View
} from "react-native";

import type { LeaveStackParamList } from "@/app/navigation/types";
import { normalizeApiError } from "@/api/errors/normalizeApiError";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useCreateLeaveRequest, getLeaveErrorMessage } from "@/features/leave/hooks/useLeave";
import { requestLeaveSchema, type RequestLeaveFormValues } from "@/features/leave/schemas/requestLeave.schema";
import { parseDateOnlyValue, toDateOnlyValue } from "@/features/leave/utils/dateOnly";
import { LEAVE_TYPES } from "@/types/leave";
import { colors, radius, spacing } from "@/theme";
import { formatDateOnly, todayDateOnly } from "@/utils/date";

export function RequestLeaveScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<LeaveStackParamList, "RequestLeave">>();
  const [activeDateField, setActiveDateField] = useState<"startDate" | "endDate" | null>(null);
  const createLeaveMutation = useCreateLeaveRequest();

  const form = useForm<RequestLeaveFormValues>({
    resolver: zodResolver(requestLeaveSchema),
    mode: "onChange",
    defaultValues: {
      leaveType: "Annual",
      startDate: "",
      endDate: "",
      reason: ""
    }
  });
  const minimumDate = parseDateOnlyValue(todayDateOnly()) ?? new Date();

  function submit(values: RequestLeaveFormValues): void {
    createLeaveMutation.mutate(values, {
      onSuccess: () => {
        navigation.goBack();
      },
      onError: (error) => {
        const normalized = normalizeApiError(error);

        const fieldMap: Record<string, keyof RequestLeaveFormValues> = {
          LeaveType: "leaveType",
          StartDate: "startDate",
          EndDate: "endDate",
          Reason: "reason"
        };

        Object.entries(normalized.errors ?? {}).forEach(([fieldName, messages]) => {
          const mappedField = fieldMap[fieldName];
          if (mappedField && messages.length > 0) {
            form.setError(mappedField, { type: "server", message: messages[0] });
          }
        });
      }
    });
  }

  const selectedDate = getSelectedDate(activeDateField, form.getValues(activeDateField ?? "startDate"));

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <AppText variant="title">Request Leave</AppText>

        <View style={styles.fieldGroup}>
          <AppText variant="small" style={styles.label}>
            Leave Type
          </AppText>
          <Controller
            control={form.control}
            name="leaveType"
            render={({ field: { value, onChange } }) => (
              <View style={styles.leaveTypesContainer}>
                {LEAVE_TYPES.map((leaveType) => (
                  <Pressable
                    key={leaveType}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${leaveType} leave type`}
                    onPress={() => onChange(leaveType)}
                    style={[styles.leaveTypeButton, value === leaveType && styles.leaveTypeButtonActive]}
                  >
                    <AppText style={[styles.leaveTypeText, value === leaveType && styles.leaveTypeTextActive]}>{leaveType}</AppText>
                  </Pressable>
                ))}
              </View>
            )}
          />
          {form.formState.errors.leaveType?.message ? <AppText style={styles.error}>{form.formState.errors.leaveType.message}</AppText> : null}
        </View>

        <Controller
          control={form.control}
          name="startDate"
          render={({ field: { value, onChange } }) => (
            <DateField
              label="Start Date"
              value={value}
              error={form.formState.errors.startDate?.message}
              onPress={() => setActiveDateField("startDate")}
              onChange={onChange}
              isPickerVisible={activeDateField === "startDate"}
              onDismiss={() => setActiveDateField(null)}
              selectedDate={selectedDate}
              minimumDate={minimumDate}
            />
          )}
        />

        <Controller
          control={form.control}
          name="endDate"
          render={({ field: { value, onChange } }) => (
            <DateField
              label="End Date"
              value={value}
              error={form.formState.errors.endDate?.message}
              onPress={() => setActiveDateField("endDate")}
              onChange={onChange}
              isPickerVisible={activeDateField === "endDate"}
              onDismiss={() => setActiveDateField(null)}
              selectedDate={selectedDate}
              minimumDate={minimumDate}
            />
          )}
        />

        <Controller
          control={form.control}
          name="reason"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Reason"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={form.formState.errors.reason?.message}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoCapitalize="sentences"
            />
          )}
        />

        {createLeaveMutation.error ? <ErrorState title="Unable to submit leave request." message={getLeaveErrorMessage(createLeaveMutation.error)} /> : null}

        <Button
          label={createLeaveMutation.isPending ? "Submitting..." : "Submit Request"}
          loading={createLeaveMutation.isPending}
          disabled={!form.formState.isValid || createLeaveMutation.isPending}
          onPress={() => {
            void form.handleSubmit(submit)();
          }}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

interface DateFieldProps {
  label: string;
  value: string;
  error?: string;
  onPress: () => void;
  onChange: (value: string) => void;
  isPickerVisible: boolean;
  onDismiss: () => void;
  selectedDate: Date;
  minimumDate: Date;
}

function DateField({
  label,
  value,
  error,
  onPress,
  onChange,
  isPickerVisible,
  onDismiss,
  selectedDate,
  minimumDate
}: DateFieldProps) {
  function handlePickerChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (event.type === "dismissed") {
      onDismiss();
      return;
    }

    if (nextDate) {
      onChange(toDateOnlyValue(nextDate));
    }

    if (Platform.OS !== "ios") {
      onDismiss();
    }
  }

  return (
    <View style={styles.fieldGroup}>
      <AppText variant="small" style={styles.label}>
        {label}
      </AppText>
      <Pressable accessibilityRole="button" accessibilityLabel={`Select ${label}`} onPress={onPress} style={[styles.dateButton, Boolean(error) && styles.dateButtonError]}>
        <AppText>{value ? formatDateOnly(value) : "Select date"}</AppText>
      </Pressable>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      {isPickerVisible ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handlePickerChange}
          minimumDate={minimumDate}
        />
      ) : null}
    </View>
  );
}

function getSelectedDate(field: "startDate" | "endDate" | null, dateOnlyValue: string): Date {
  if (!field) {
    return new Date();
  }

  const parsed = parseDateOnlyValue(dateOnlyValue);
  return parsed ?? new Date();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md
  },
  fieldGroup: {
    gap: spacing.xs
  },
  label: {
    fontWeight: "700"
  },
  leaveTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  leaveTypeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  leaveTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted
  },
  leaveTypeText: {
    color: colors.text
  },
  leaveTypeTextActive: {
    color: colors.primary,
    fontWeight: "700"
  },
  dateButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  dateButtonError: {
    borderColor: colors.danger
  },
  error: {
    color: colors.danger
  }
});
