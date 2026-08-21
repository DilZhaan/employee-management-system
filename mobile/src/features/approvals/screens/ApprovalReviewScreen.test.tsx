import { useNavigation, useRoute } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";
import type { ReactElement } from "react";

import { leaveKeys } from "@/features/leave/api/queryKeys";
import { useAuth } from "@/auth/useAuth";
import { ApprovalReviewScreen } from "@/features/approvals/screens/ApprovalReviewScreen";
import { useApproveLeaveRequest, useRejectLeaveRequest } from "@/features/leave/hooks/useLeave";
import type { LeaveRequest } from "@/types/leave";

jest.mock("@react-navigation/native", () => ({
  useRoute: jest.fn(),
  useNavigation: jest.fn()
}));

jest.mock("@/auth/useAuth", () => ({
  useAuth: jest.fn()
}));

jest.mock("@/features/leave/hooks/useLeave", () => ({
  useApproveLeaveRequest: jest.fn(),
  useRejectLeaveRequest: jest.fn(),
  getLeaveErrorMessage: jest.fn(() => "Unable to process request.")
}));

const mockedUseRoute = jest.mocked(useRoute);
const mockedUseNavigation = jest.mocked(useNavigation);
const mockedUseAuth = jest.mocked(useAuth);
const mockedUseApproveLeaveRequest = jest.mocked(useApproveLeaveRequest);
const mockedUseRejectLeaveRequest = jest.mocked(useRejectLeaveRequest);

describe("ApprovalReviewScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    mockedUseAuth.mockReturnValue({
      user: { employeeId: "mgr-1", email: "manager@ems.local", role: "Manager", expiresAt: 9999999999 }
    } as never);
    mockedUseRoute.mockReturnValue({
      params: { requestId: "leave-1" }
    } as never);
    mockedUseNavigation.mockReturnValue({ goBack: jest.fn() } as never);
    mockedUseApproveLeaveRequest.mockReturnValue(createMutationMock() as never);
    mockedUseRejectLeaveRequest.mockReturnValue(createMutationMock() as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows review details", async () => {
    const view = await renderWithQueryClient(<ApprovalReviewScreen />);

    expect(view.getByText("Leave Review")).toBeTruthy();
    expect(view.getByText("Employee Code")).toBeTruthy();
    expect(view.getByText("EMP001")).toBeTruthy();
    expect(view.getByText("Family event")).toBeTruthy();
  });

  it("opens approve confirmation", async () => {
    const approveMutation = createMutationMock();
    mockedUseApproveLeaveRequest.mockReturnValue(approveMutation as never);

    const view = await renderWithQueryClient(<ApprovalReviewScreen />);
    fireEvent.press(view.getByText("Approve"));

    expect(Alert.alert).toHaveBeenCalled();
    const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    buttons[1].onPress();
    expect(approveMutation.mutate).toHaveBeenCalledWith(
      "leave-1",
      expect.objectContaining({
        onSuccess: expect.any(Function)
      })
    );
  });

  it("opens reject confirmation", async () => {
    const rejectMutation = createMutationMock();
    mockedUseRejectLeaveRequest.mockReturnValue(rejectMutation as never);

    const view = await renderWithQueryClient(<ApprovalReviewScreen />);
    fireEvent.press(view.getByText("Reject"));

    const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    buttons[1].onPress();
    expect(rejectMutation.mutate).toHaveBeenCalledWith(
      "leave-1",
      expect.objectContaining({
        onSuccess: expect.any(Function)
      })
    );
  });

  it("hides actions for processed requests", async () => {
    const queryClient = createQueryClient(createLeaveRequest({ status: "Approved" }));
    mockedUseRoute.mockReturnValue({
      params: { requestId: "leave-1" }
    } as never);

    const view = await renderWithQueryClient(<ApprovalReviewScreen />, queryClient);

    expect(view.queryByText("Approve")).toBeNull();
    expect(view.queryByText("Reject")).toBeNull();
    expect(view.getByText("This request has already been processed.")).toBeTruthy();
  });

  it("shows mutation errors without logging out session", async () => {
    mockedUseApproveLeaveRequest.mockReturnValue({
      ...createMutationMock(),
      error: new Error("forbidden")
    } as never);

    const view = await renderWithQueryClient(<ApprovalReviewScreen />);

    expect(view.getAllByText("Unable to process request.").length).toBeGreaterThan(0);
  });

  it("shows access denied for unauthorized users", async () => {
    mockedUseAuth.mockReturnValue({
      user: { employeeId: "emp-1", email: "employee@ems.local", role: "Employee", expiresAt: 9999999999 }
    } as never);

    const view = await renderWithQueryClient(<ApprovalReviewScreen />);

    expect(view.getByText("Access denied.")).toBeTruthy();
  });
});

function renderWithQueryClient(ui: ReactElement, queryClient = createQueryClient()) {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function createQueryClient(request = createLeaveRequest()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  queryClient.setQueryData(leaveKeys.detail(request.id), request);
  return queryClient;
}

function createMutationMock() {
  return {
    mutate: jest.fn(),
    isPending: false,
    error: null
  };
}

function createLeaveRequest(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
  return {
    id: "leave-1",
    employeeId: "emp-1",
    employeeCode: "EMP001",
    leaveType: "Annual",
    startDate: "2026-08-25",
    endDate: "2026-08-27",
    reason: "Family event",
    status: "Pending",
    approvedById: null,
    appliedOn: "2026-08-20T10:00:00Z",
    reviewedAt: null,
    ...overrides
  };
}
