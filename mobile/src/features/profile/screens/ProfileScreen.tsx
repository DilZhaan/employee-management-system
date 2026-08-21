import { Alert, StyleSheet, View } from "react-native";

import { useAuth } from "@/auth/useAuth";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors, spacing } from "@/theme";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  function handleLogout(): void {
    Alert.alert("Log out?", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          void logout();
        }
      }
    ]);
  }

  return (
    <Screen scroll>
      <AppText variant="title">Profile</AppText>
      {user ? (
        <View style={styles.container}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <AppText variant="subtitle" style={styles.avatarText}>{buildInitials(user.email)}</AppText>
            </View>
          </View>

          <Card style={styles.card}>
            <ProfileRow label="Email" value={user.email} />
            <ProfileRow label="Role" value={user.role} />
            <ProfileRow label="Employee ID" value={user.employeeId} />
          </Card>

          <Button label="Log Out" onPress={handleLogout} variant="danger" />
        </View>
      ) : (
        <AppText muted>Profile is unavailable while not authenticated.</AppText>
      )}
    </Screen>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText muted>{label}</AppText>
      <AppText style={styles.value}>{value}</AppText>
    </View>
  );
}

function buildInitials(email: string): string {
  const [localPart] = email.split("@");
  const sanitized = localPart.replace(/[^a-zA-Z0-9]/g, "");
  if (!sanitized) {
    return "U";
  }

  return sanitized.slice(0, 2).toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  avatarContainer: {
    alignItems: "center"
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  avatarText: {
    color: colors.primaryText
  },
  card: {
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md
  },
  value: {
    flex: 1,
    textAlign: "right"
  }
});
