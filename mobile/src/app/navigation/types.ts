export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Attendance: undefined;
  Leave: undefined;
  Approvals: undefined;
  Profile: undefined;
};

export type LeaveStackParamList = {
  LeaveList: undefined;
  RequestLeave: undefined;
};

export type ApprovalsStackParamList = {
  ApprovalsList: undefined;
  ApprovalReview: { requestId: string };
};
