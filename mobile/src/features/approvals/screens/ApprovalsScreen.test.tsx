import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";
import type { ReactElement } from "react";

import { useAuth } from "@/auth/useAuth";
import { useReviewableLeaveRequests } from "@/features/leave/hooks/useLeave";
import { ApprovalsScreen } from "@/features/approvals/screens/ApprovalsScreen";
import type { LeaveRequest } from "@/types/leave";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn()
}));

jest.mock("@/auth/useAuth", () => ({
  useAuth: jest.fn()
}));

jest.mock("@/features/leave/hooks/useLeave", () => ({
  useReviewableLeaveRequests: jest.fn()
}));

const mockedUseNavigation = jest.mocked(useNavigation);
const mockedUseAuth = jest.mocked(useAuth);
const mockedUseReviewableLeaveRequests = jest.mocked(useReviewableLeaveRequests);

describe("ApprovalsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseNavigation.mockReturnValue({
      navigate: jest.fn()
    } as never);
    mockedUseAuth.mockReturnValue({
      user: { employeeId: "mgr-1", email: "manager@ems.local", role: "Manager", expiresAt: 9999999999 }
    } as never);
  });

  it("renders pending requests", async () => {
    mockedUseReviewableLeaveRequests.mockReturnValue(
      createReviewResult({
        items: [createLeaveRequest({ employeeCode: "EMP003" })]
      })
    );

    const view = await renderWithQueryClient(<ApprovalsScreen />);

    expect(view.getByText("Leave Approvals")).toBeTruthy();
    expect(view.getByText("Pending")).toBeTruthy();
    expect(view.getByText("Employee: EMP003")).toBeTruthy();
  });

  it("renders empty state", async () => {
    mockedUseReviewableLeaveRequests.mockReturnValue(createReviewResult({ items: [] }));

    const view = await renderWithQueryClient(<ApprovalsScreen />);

    expect(view.getByText("No pending leave requests.")).toBeTruthy();
  });

  it("renders error state and retries", async () => {
    const refetch = jest.fn();
    mockedUseReviewableLeaveRequests.mockReturnValue(
      createReviewResult({
        isError: true,
        isSuccess: false,
        refetch
      })
    );

    const view = await renderWithQueryClient(<ApprovalsScreen />);

    fireEvent.press(view.getByText("Try again"));
    expect(refetch).toHaveBeenCalled();
  });

  it("shows access denied for Employee role", async () => {
    mockedUseAuth.mockReturnValue({
      user: { employeeId: "emp-1", email: "employee@ems.local", role: "Employee", expiresAt: 9999999999 }
    } as never);
    mockedUseReviewableLeaveRequests.mockReturnValue(createReviewResult({ items: [] }));

    const view = await renderWithQueryClient(<ApprovalsScreen />);

    expect(view.getByText("Access denied.")).toBeTruthy();
    expect(view.getByText("You do not have permission to view leave approvals.")).toBeTruthy();
  });

  it("supports pull-to-refresh", async () => {
    const refetch = jest.fn();
    mockedUseReviewableLeaveRequests.mockReturnValue(
      createReviewResult({
        items: [createLeaveRequest()],
        refetch
      })
    );

    const view = await renderWithQueryClient(<ApprovalsScreen />);
    fireEvent(view.getByTestId("approvals-list"), "refresh");

    expect(refetch).toHaveBeenCalled();
  });
});

function createReviewResult(overrides: Partial<ReturnType<typeof useReviewableLeaveRequests>>): ReturnType<typeof useReviewableLeaveRequests> {
  return {
    items: [],
    isLoading: false,
    isError: false,
    isSuccess: true,
    isRefetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
    ...overrides
  } as unknown as ReturnType<typeof useReviewableLeaveRequests>;
}

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
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
