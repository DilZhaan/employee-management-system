import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { ApprovalsStackParamList } from "@/app/navigation/types";
import { ApprovalReviewScreen } from "@/features/approvals/screens/ApprovalReviewScreen";
import { ApprovalsScreen } from "@/features/approvals/screens/ApprovalsScreen";
import { colors } from "@/theme";

const Stack = createNativeStackNavigator<ApprovalsStackParamList>();

export function ApprovalsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text
      }}
    >
      <Stack.Screen name="ApprovalsList" component={ApprovalsScreen} options={{ title: "Approvals" }} />
      <Stack.Screen name="ApprovalReview" component={ApprovalReviewScreen} options={{ title: "Review Request" }} />
    </Stack.Navigator>
  );
}
