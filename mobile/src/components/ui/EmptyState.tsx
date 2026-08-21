import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radius, shadows, spacing } from "@/theme";

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <Ionicons name={icon} size={32} color={colors.textMuted} /> : null}
      <AppText variant="subtitle" style={styles.title}>{title}</AppText>
      {message ? <AppText muted style={styles.message}>{message}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  title: {
    textAlign: "center"
  },
  message: {
    textAlign: "center"
  }
});
