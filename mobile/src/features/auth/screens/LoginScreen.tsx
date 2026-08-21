import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View
} from "react-native";

import { useLogin } from "@/features/auth/hooks/useLogin";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { colors, radius, spacing } from "@/theme";

export function LoginScreen() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);
  const { login, isPending, errorMessage } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await login(values);
  });

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardContainer}>
        <View style={styles.header}>
          <AppText muted style={styles.brandLabel}>Employee Management</AppText>
          <AppText variant="title">Welcome Back</AppText>
        </View>

        <View style={styles.form}>
          <Controller
            control={form.control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                accessibilityHint="Enter your account email address"
                error={form.formState.errors.email?.message}
                keyboardType="email-address"
                label="Email"
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                returnKeyType="next"
                value={value}
              />
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                accessibilityHint="Enter your account password"
                error={form.formState.errors.password?.message}
                label="Password"
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  void handleSubmit();
                }}
                ref={passwordInputRef}
                returnKeyType="done"
                rightAccessory={
                  <Pressable
                    accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
                    accessibilityRole="button"
                    accessibilityHint={isPasswordVisible ? "Hides password text" : "Reveals password text"}
                    hitSlop={8}
                    onPress={() => setIsPasswordVisible((previous) => !previous)}
                  >
                    <AppText variant="small" style={styles.togglePassword}>
                      {isPasswordVisible ? "Hide" : "Show"}
                    </AppText>
                  </Pressable>
                }
                secureTextEntry={!isPasswordVisible}
                value={value}
              />
            )}
          />

          {errorMessage ? (
            <View accessibilityRole="alert" style={styles.errorBox}>
              <AppText style={styles.errorText}>{errorMessage}</AppText>
            </View>
          ) : null}

          <Button
            label={isPending ? "Signing In..." : "Sign In"}
            loading={isPending}
            disabled={!form.formState.isValid || isPending}
            onPress={() => {
              void handleSubmit();
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    justifyContent: "center"
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xl
  },
  brandLabel: {
    fontWeight: "600"
  },
  form: {
    gap: spacing.md
  },
  togglePassword: {
    color: colors.primary,
    fontWeight: "700"
  },
  errorBox: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerSurface,
    padding: spacing.sm
  },
  errorText: {
    color: colors.danger
  }
});
