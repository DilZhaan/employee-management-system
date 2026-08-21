import { forwardRef, type ReactNode, useState } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/theme";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightAccessory?: ReactNode;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, rightAccessory, ...props },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <AppText variant="small" style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.inputContainer, isFocused && styles.inputFocused, Boolean(error) && styles.inputError]}>
        <TextInput
          {...props}
          ref={ref}
          accessibilityLabel={props.accessibilityLabel ?? label}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {rightAccessory ? <View style={styles.rightAccessory}>{rightAccessory}</View> : null}
      </View>
      {error ? (
        <AppText accessibilityRole="alert" variant="small" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  },
  label: {
    fontWeight: "700"
  },
  inputContainer: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface
  },
  inputFocused: {
    borderColor: colors.primary
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16
  },
  rightAccessory: {
    paddingRight: spacing.sm
  },
  inputError: {
    borderColor: colors.danger
  },
  error: {
    color: colors.danger
  }
});
