import { useNavigation } from "@react-navigation/native";
import { fireEvent, render } from "@testing-library/react-native";

import { useMyLeaveRequests } from "@/features/leave/hooks/useLeave";
import { LeaveScreen } from "@/features/leave/screens/LeaveScreen";
import type { LeaveRequest } from "@/types/leave";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn()
}));

jest.mock("@/features/leave/hooks/useLeave", () => ({
  useMyLeaveRequests: jest.fn()
}));

const mockedUseNavigation = jest.mocked(useNavigation);
const mockedUseMyLeaveRequests = jest.mocked(useMyLeaveRequests);

describe("LeaveScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseNavigation.mockReturnValue({
      navigate: jest.fn()
    } as never);
  });

  it("renders leave requests list", async () => {
    mockedUseMyLeaveRequests.mockReturnValue(
      createLeaveQueryResult({
        items: [createLeaveRequest({ status: "Pending" })]
      })
    );

    const view = await render(<LeaveScreen />);

    expect(view.getByText("My Requests")).toBeTruthy();
    expect(view.getByText("Pending")).toBeTruthy();
    expect(view.getByText("Family event")).toBeTruthy();
  });

  it("renders empty state", async () => {
    mockedUseMyLeaveRequests.mockReturnValue(createLeaveQueryResult({ items: [] }));

    const view = await render(<LeaveScreen />);

    expect(view.getByText("No leave requests yet.")).toBeTruthy();
  });

  it("renders error state and retries", async () => {
    const refetch = jest.fn();
    mockedUseMyLeaveRequests.mockReturnValue(
      createLeaveQueryResult({
        items: [],
        isError: true,
        isSuccess: false,
        refetch
      })
    );

    const view = await render(<LeaveScreen />);

    fireEvent.press(view.getByText("Try again"));
    expect(refetch).toHaveBeenCalled();
  });

  it("supports pull-to-refresh", async () => {
    const refetch = jest.fn();
    mockedUseMyLeaveRequests.mockReturnValue(
      createLeaveQueryResult({
        items: [createLeaveRequest()],
        refetch
      })
    );

    const view = await render(<LeaveScreen />);
    fireEvent(view.getByTestId("leave-list"), "refresh");

    expect(refetch).toHaveBeenCalled();
  });
});

function createLeaveQueryResult(overrides: Partial<ReturnType<typeof useMyLeaveRequests>>): ReturnType<typeof useMyLeaveRequests> {
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
  } as unknown as ReturnType<typeof useMyLeaveRequests>;
}

function createLeaveRequest(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
  return {
    id: "leave-1",
    employeeId: "emp-1",
    employeeCode: "EMP001",
    employeeName: "Demo Employee",
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
