import { useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ label, onPress, disabled = false, loading = false, variant = "primary" }: ButtonProps) {
  const isDisabled = disabled || loading;
  const [scale] = useState(() => new Animated.Value(1));

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }

  const loaderColor = variant === "secondary" ? colors.primary : colors.primaryText;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.base,
          styles[variant],
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled
        ]}
      >
        {loading ? (
          <ActivityIndicator color={loaderColor} />
        ) : (
          <AppText style={[styles.label, variant === "secondary" && styles.secondaryLabel, variant === "danger" && styles.dangerLabel]}>{label}</AppText>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  danger: {
    backgroundColor: colors.danger
  },
  pressed: {
    opacity: 0.86
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    color: colors.primaryText,
    fontWeight: "700"
  },
  secondaryLabel: {
    color: colors.primary
  },
  dangerLabel: {
    color: colors.primaryText
  }
});
