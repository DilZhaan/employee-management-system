import { fireEvent, render } from "@testing-library/react-native";

import { useAttendanceHistory } from "@/features/attendance/hooks/useAttendance";
import { AttendanceScreen } from "@/features/attendance/screens/AttendanceScreen";
import type { AttendanceLog } from "@/types/attendance";

jest.mock("@/features/attendance/hooks/useAttendance", () => ({
  useAttendanceHistory: jest.fn()
}));

const mockedUseAttendanceHistory = jest.mocked(useAttendanceHistory);

describe("AttendanceScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders attendance records from history", async () => {
    mockedUseAttendanceHistory.mockReturnValue(createHistoryResult({ items: [createRecord()] }));

    const view = await render(<AttendanceScreen />);

    expect(view.getByText("History")).toBeTruthy();
    expect(view.getByText("Present")).toBeTruthy();
    expect(view.getByText("Check In")).toBeTruthy();
  });

  it("renders empty state when history is empty", async () => {
    mockedUseAttendanceHistory.mockReturnValue(createHistoryResult({ items: [] }));

    const view = await render(<AttendanceScreen />);

    expect(view.getByText("No attendance records yet.")).toBeTruthy();
  });

  it("renders error state and supports retry", async () => {
    const refetch = jest.fn();
    mockedUseAttendanceHistory.mockReturnValue(
      createHistoryResult({
        items: [],
        isError: true,
        isSuccess: false,
        refetch
      })
    );

    const view = await render(<AttendanceScreen />);

    expect(view.getByText("Unable to load attendance.")).toBeTruthy();
    fireEvent.press(view.getByText("Try again"));
    expect(refetch).toHaveBeenCalled();
  });

  it("pull-to-refresh calls refetch", async () => {
    const refetch = jest.fn();
    mockedUseAttendanceHistory.mockReturnValue(
      createHistoryResult({
        items: [createRecord()],
        refetch
      })
    );

    const view = await render(<AttendanceScreen />);
    const list = view.getByTestId("attendance-history-list");

    fireEvent(list, "refresh");

    expect(refetch).toHaveBeenCalled();
  });
});

function createHistoryResult(overrides: Partial<ReturnType<typeof useAttendanceHistory>>): ReturnType<typeof useAttendanceHistory> {
  return {
    items: [],
    isLoading: false,
    isError: false,
    isSuccess: true,
    isRefetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    ...overrides
  } as ReturnType<typeof useAttendanceHistory>;
}

function createRecord(overrides: Partial<AttendanceLog> = {}): AttendanceLog {
  return {
    id: "att-1",
    employeeId: "emp-1",
    employeeCode: "EMP001",
    employeeName: "Demo Employee",
    checkInTime: "2026-08-21T03:30:00Z",
    checkOutTime: "2026-08-21T11:45:00Z",
    workDate: "2026-08-21",
    status: "Present",
    deviceType: "Mobile",
    ...overrides
  };
}
