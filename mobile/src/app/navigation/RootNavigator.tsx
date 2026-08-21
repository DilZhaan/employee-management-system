import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import type { AuthStackParamList, MainTabParamList, RootStackParamList } from "@/app/navigation/types";
import { getMainTabsForRole } from "@/app/navigation/tabConfig";
import { useAuth } from "@/auth/useAuth";
import { AppText } from "@/components/ui/AppText";
import { AttendanceScreen } from "@/features/attendance/screens/AttendanceScreen";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { ApprovalsNavigator } from "@/features/approvals/navigation/ApprovalsNavigator";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import { LeaveNavigator } from "@/features/leave/navigation/LeaveNavigator";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";
import { colors, shadows, spacing } from "@/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export function RootNavigator() {
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View style={styles.restoringContainer}>
        <ActivityIndicator color={colors.primary} />
        <AppText muted>Restoring secure session...</AppText>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? <Stack.Screen name="MainTabs" component={MainTabs} /> : <Stack.Screen name="AuthStack" component={AuthStackNavigator} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  const { user } = useAuth();
  const tabs = getMainTabsForRole(user?.role);
  const showApprovals = tabs.includes("Approvals");

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: colors.text
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          ...shadows.card,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size, focused }) => <TabIcon name={route.name} color={color} size={size} focused={focused} />
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Leave" component={LeaveNavigator} options={{ headerShown: false }} />
      {showApprovals ? <Tab.Screen name="Approvals" component={ApprovalsNavigator} options={{ headerShown: false }} /> : null}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

interface TabIconProps {
  name: keyof MainTabParamList;
  color: string;
  size: number;
  focused: boolean;
}

function TabIcon({ name, color, size, focused }: TabIconProps) {
  const outlineIcons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
    Home: "home-outline",
    Attendance: "time-outline",
    Leave: "calendar-outline",
    Approvals: "checkmark-done-outline",
    Profile: "person-circle-outline"
  };

  const filledIcons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
    Home: "home",
    Attendance: "time",
    Leave: "calendar",
    Approvals: "checkmark-done",
    Profile: "person-circle"
  };

  const iconName = focused ? filledIcons[name] : outlineIcons[name];

  return <Ionicons name={iconName} size={size} color={color} />;
}

const styles = StyleSheet.create({
  restoringContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.background
  }
});
