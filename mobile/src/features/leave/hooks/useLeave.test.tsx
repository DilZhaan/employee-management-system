import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { leaveApi } from "@/api/endpoints/leave.api";
import { leaveKeys } from "@/features/leave/api/queryKeys";
import {
  getLeaveErrorMessage,
  useApproveLeaveRequest,
  useCreateLeaveRequest,
  useRejectLeaveRequest
} from "@/features/leave/hooks/useLeave";
import type { LeaveRequest } from "@/types/leave";

jest.mock("@/api/endpoints/leave.api", () => ({
  leaveApi: {
    create: jest.fn(),
    getMine: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    getReviewable: jest.fn()
  }
}));

const mockedLeaveApi = jest.mocked(leaveApi);

describe("useCreateLeaveRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("invalidates leave queries after successful creation", async () => {
    mockedLeaveApi.create.mockResolvedValue(createLeaveRequest());

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCreateLeaveRequest(), {
      wrapper: createWrapper(queryClient)
    });

    await result.current.mutateAsync({
      leaveType: "Annual",
      startDate: "2026-08-25",
      endDate: "2026-08-27",
      reason: "Family event"
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: leaveKeys.all });
  });

  it("returns backend conflict/domain message when creation fails", async () => {
    mockedLeaveApi.create.mockRejectedValue(
      new AxiosError("Bad Request", undefined, undefined, undefined, {
        data: {
          title: "Bad Request",
          detail: "Start date cannot be after end date."
        },
        status: 400,
        statusText: "Bad Request",
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

    const { result } = await renderHook(() => useCreateLeaveRequest(), {
      wrapper: createWrapper(queryClient)
    });

    await expect(
      result.current.mutateAsync({
        leaveType: "Annual",
        startDate: "2026-08-27",
        endDate: "2026-08-25",
        reason: "Family event"
      })
    ).rejects.toBeInstanceOf(AxiosError);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(getLeaveErrorMessage(result.current.error)).toBe("Start date cannot be after end date.");
  });
});

describe("review mutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("invalidates leave queries after approve", async () => {
    mockedLeaveApi.approve.mockResolvedValue(createLeaveRequest({ status: "Approved", reviewedAt: "2026-08-21T10:00:00Z" }));
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useApproveLeaveRequest(), {
      wrapper: createWrapper(queryClient)
    });

    await result.current.mutateAsync("leave-1");

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["leave", "reviewable"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: leaveKeys.all });
  });

  it("invalidates leave queries after reject", async () => {
    mockedLeaveApi.reject.mockResolvedValue(createLeaveRequest({ status: "Rejected", reviewedAt: "2026-08-21T10:00:00Z" }));
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useRejectLeaveRequest(), {
      wrapper: createWrapper(queryClient)
    });

    await result.current.mutateAsync("leave-1");

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["leave", "reviewable"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: leaveKeys.all });
  });
});

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
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
