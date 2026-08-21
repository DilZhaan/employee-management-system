import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { LeaveStackParamList } from "@/app/navigation/types";
import { LeaveScreen } from "@/features/leave/screens/LeaveScreen";
import { RequestLeaveScreen } from "@/features/leave/screens/RequestLeaveScreen";
import { colors } from "@/theme";

const Stack = createNativeStackNavigator<LeaveStackParamList>();

export function LeaveNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text
      }}
    >
      <Stack.Screen name="LeaveList" component={LeaveScreen} options={{ title: "Leave" }} />
      <Stack.Screen name="RequestLeave" component={RequestLeaveScreen} options={{ title: "Request Leave" }} />
    </Stack.Navigator>
  );
}
