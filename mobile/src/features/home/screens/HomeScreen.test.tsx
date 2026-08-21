import { Alert } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

import { useAuth } from "@/auth/useAuth";
import { useCheckIn, useCheckOut, useTodayAttendance } from "@/features/attendance/hooks/useAttendance";
import { HomeScreen } from "@/features/home/screens/HomeScreen";
import type { TodayAttendanceSummary } from "@/features/attendance/utils/todayAttendance";

jest.mock("@/auth/useAuth", () => ({
  useAuth: jest.fn()
}));

jest.mock("@/features/attendance/hooks/useAttendance", () => ({
  useTodayAttendance: jest.fn(),
  useCheckIn: jest.fn(),
  useCheckOut: jest.fn(),
  getAttendanceMutationError: jest.fn(() => "Attendance action failed.")
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseTodayAttendance = jest.mocked(useTodayAttendance);
const mockedUseCheckIn = jest.mocked(useCheckIn);
const mockedUseCheckOut = jest.mocked(useCheckOut);

describe("HomeScreen attendance states", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: {
        employeeId: "emp-1",
        email: "employee@example.com",
        role: "Employee",
        expiresAt: 4102444800
      },
      token: "fake-token",
      isAuthenticated: true,
      isRestoring: false,
      establishSession: jest.fn(),
      logout: jest.fn(),
      onLoginSuccess: jest.fn()
    });
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows check-in action when no attendance exists for today", async () => {
    const mutate = jest.fn();
    mockedUseTodayAttendance.mockReturnValue(createTodayResult(createSummary("not_checked_in")));
    mockedUseCheckIn.mockReturnValue(createMutationResult(mutate));
    mockedUseCheckOut.mockReturnValue(createMutationResult(jest.fn()));

    const view = await render(<HomeScreen />);

    expect(view.getByText("Status")).toBeTruthy();
    fireEvent.press(view.getByRole("button", { name: "Check In" }));
    expect(mutate).toHaveBeenCalled();
  });

  it("shows check-out action when employee is checked in", async () => {
    mockedUseTodayAttendance.mockReturnValue(
      createTodayResult(
        createSummary("checked_in", {
          checkInTime: "2026-08-21T03:30:00Z"
        })
      )
    );
    mockedUseCheckIn.mockReturnValue(createMutationResult(jest.fn()));
    mockedUseCheckOut.mockReturnValue(createMutationResult(jest.fn()));

    const view = await render(<HomeScreen />);

    expect(view.getByRole("button", { name: "Check Out" })).toBeTruthy();
  });

  it("shows completed state without attendance actions", async () => {
    mockedUseTodayAttendance.mockReturnValue(
      createTodayResult(
        createSummary("completed", {
          checkInTime: "2026-08-21T03:30:00Z",
          checkOutTime: "2026-08-21T11:45:00Z"
        })
      )
    );
    mockedUseCheckIn.mockReturnValue(createMutationResult(jest.fn()));
    mockedUseCheckOut.mockReturnValue(createMutationResult(jest.fn()));

    const view = await render(<HomeScreen />);

    expect(view.getByText("Your attendance for today is complete.")).toBeTruthy();
    expect(view.queryByRole("button", { name: "Check In" })).toBeNull();
    expect(view.queryByRole("button", { name: "Check Out" })).toBeNull();
  });
});

function createSummary(
  state: TodayAttendanceSummary["state"],
  overrides: Partial<TodayAttendanceSummary> = {}
): TodayAttendanceSummary {
  return {
    state,
    status: state === "not_checked_in" ? "Not checked in" : state === "checked_in" ? "Checked in" : "Completed",
    checkInTime: null,
    checkOutTime: null,
    latestRecord: null,
    ...overrides
  };
}

function createTodayResult(summary: TodayAttendanceSummary): ReturnType<typeof useTodayAttendance> {
  return {
    workDate: "2026-08-21",
    data: summary,
    isLoading: false,
    isError: false,
    isSuccess: true,
    refetch: jest.fn()
  } as unknown as ReturnType<typeof useTodayAttendance>;
}

function createMutationResult(mutate: jest.Mock): ReturnType<typeof useCheckIn> {
  return {
    mutate,
    isPending: false,
    error: null
  } as unknown as ReturnType<typeof useCheckIn>;
}
