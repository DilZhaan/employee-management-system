import type { PropsWithChildren } from "react";
import { StyleSheet, Text, type TextProps } from "react-native";

import { colors, typography } from "@/theme";

type AppTextVariant = "title" | "subtitle" | "body" | "small" | "caption";

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  muted?: boolean;
}

export function AppText({ children, style, variant = "body", muted = false, ...props }: PropsWithChildren<AppTextProps>) {
  return (
    <Text {...props} style={[styles.base, styles[variant], muted && styles.muted, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    lineHeight: 22
  },
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    lineHeight: 32
  },
  subtitle: {
    fontSize: typography.subtitle,
    fontWeight: "700",
    lineHeight: 24
  },
  body: {
    fontSize: typography.body
  },
  small: {
    fontSize: typography.small,
    lineHeight: 20
  },
  caption: {
    fontSize: typography.caption,
    lineHeight: 18
  },
  muted: {
    color: colors.textMuted
  }
});
