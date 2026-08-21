import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { attendanceApi } from "@/api/endpoints/attendance.api";
import { attendanceKeys } from "@/features/attendance/api/queryKeys";
import { getAttendanceMutationError, useCheckIn, useCheckOut } from "@/features/attendance/hooks/useAttendance";
import type { AttendanceLog } from "@/types/attendance";

jest.mock("@/api/endpoints/attendance.api", () => ({
  attendanceApi: {
    checkIn: jest.fn(),
    checkOut: jest.fn(),
    getMine: jest.fn()
  }
}));

const mockedAttendanceApi = jest.mocked(attendanceApi);

describe("attendance mutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("invalidates attendance queries after successful check-in", async () => {
    mockedAttendanceApi.checkIn.mockResolvedValue(createRecord());

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCheckIn(), {
      wrapper: createWrapper(queryClient)
    });

    await result.current.mutateAsync();

    expect(mockedAttendanceApi.checkIn).toHaveBeenCalledWith({ deviceType: "Mobile" });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: attendanceKeys.all });
  });

  it("invalidates attendance queries after successful check-out", async () => {
    mockedAttendanceApi.checkOut.mockResolvedValue(createRecord({ checkOutTime: "2026-08-21T11:45:00Z" }));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCheckOut(), {
      wrapper: createWrapper(queryClient)
    });

    await result.current.mutateAsync();

    expect(mockedAttendanceApi.checkOut).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: attendanceKeys.all });
  });

  it("exposes conflict error message for rejected attendance action", async () => {
    mockedAttendanceApi.checkIn.mockRejectedValue(
      new AxiosError("Conflict", undefined, undefined, undefined, {
        data: { title: "Conflict", detail: "Employee already has an active attendance record." },
        status: 409,
        statusText: "Conflict",
        headers: {},
        config: {} as never
      })
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    const { result } = await renderHook(() => useCheckIn(), {
      wrapper: createWrapper(queryClient)
    });

    await expect(result.current.mutateAsync()).rejects.toBeInstanceOf(AxiosError);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(getAttendanceMutationError(result.current.error)).toBe("Employee already has an active attendance record.");
  });
});

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createRecord(overrides: Partial<AttendanceLog> = {}): AttendanceLog {
  return {
    id: "att-1",
    employeeId: "emp-1",
    checkInTime: "2026-08-21T03:30:00Z",
    checkOutTime: null,
    workDate: "2026-08-21",
    status: "Present",
    deviceType: "Mobile",
    ...overrides
  };
}
