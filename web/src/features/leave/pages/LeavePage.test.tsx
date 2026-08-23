import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { tokenStorage } from "@/auth/token-storage";
import { ToastProvider } from "@/components/ui/toast";
import { LeavePage } from "@/features/leave/pages/LeavePage";
import { todayDateOnly } from "@/lib/date-rules";
import { createAuthToken } from "@/test/auth-test-utils";
import type { PagedResult } from "@/types/api";
import type { DepartmentResponse } from "@/types/department";
import type { LeaveRequestResponse } from "@/types/leave";

vi.mock("@/api/endpoints/leave", () => ({
  createLeaveRequest: vi.fn(),
  getMyLeaveRequests: vi.fn(),
  getLeaveRequests: vi.fn(),
  approveLeaveRequest: vi.fn(),
  rejectLeaveRequest: vi.fn()
}));

vi.mock("@/api/endpoints/departments", () => ({
  getDepartments: vi.fn(),
  getDepartment: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deactivateDepartment: vi.fn()
}));

const leaveApi = await import("@/api/endpoints/leave");
const departmentsApi = await import("@/api/endpoints/departments");

const leaveId = "55555555-5555-4555-8555-555555555555";
const employeeId = "44444444-4444-4444-8444-444444444444";
const departmentId = "22222222-2222-4222-8222-222222222222";
const tomorrow = addDays(todayDateOnly(), 1);
const dayAfterTomorrow = addDays(todayDateOnly(), 2);
const yesterday = addDays(todayDateOnly(), -1);

const request: LeaveRequestResponse = {
  id: leaveId,
  employeeId,
  employeeCode: "EMP001",
  employeeName: "Demo Employee",
  leaveType: "Annual",
  startDate: "2026-01-10",
  endDate: "2026-01-11",
  reason: "Family event",
  status: "Pending",
  approvedById: null,
  appliedOn: "2026-01-01T00:00:00Z",
  reviewedAt: null
};

const ownRequest: LeaveRequestResponse = {
  ...request,
  id: "66666666-6666-4666-8666-666666666666",
  employeeId: "11111111-1111-1111-1111-111111111111",
  employeeCode: "MGR001",
  employeeName: "Manager User"
};

const department: DepartmentResponse = {
  id: departmentId,
  code: "ENG",
  name: "Engineering",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z"
};

function paged<TItem>(items: TItem[]): PagedResult<TItem> {
  return { items, page: 1, pageSize: 20, totalCount: items.length, totalPages: items.length === 0 ? 0 : 1 };
}

function renderPage(role: "Admin" | "Manager" | "Employee" = "Admin") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  tokenStorage.set(createAuthToken({ role }));

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={["/leave"]}>
            <LeavePage />
            <LocationProbe />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="location">{location.pathname + location.search}</output>;
}

describe("LeavePage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.mocked(leaveApi.getMyLeaveRequests).mockResolvedValue(paged([request]));
    vi.mocked(leaveApi.getLeaveRequests).mockResolvedValue(paged([request]));
    vi.mocked(leaveApi.createLeaveRequest).mockResolvedValue(request);
    vi.mocked(leaveApi.approveLeaveRequest).mockResolvedValue({ ...request, status: "Approved" });
    vi.mocked(leaveApi.rejectLeaveRequest).mockResolvedValue({ ...request, status: "Rejected" });
    vi.mocked(departmentsApi.getDepartments).mockResolvedValue(paged([department]));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders leave history and review data", async () => {
    renderPage();

    expect(await screen.findAllByText("Family event")).toHaveLength(2);
    expect(screen.getAllByText("Pending").length).toBeGreaterThanOrEqual(2);
  });

  it("validates leave request form", async () => {
    const user = userEvent.setup();

    renderPage("Employee");

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(await screen.findByText("Start date is required.")).toBeInTheDocument();
    expect(screen.getByText("End date is required.")).toBeInTheDocument();
    expect(screen.getByText("Reason is required.")).toBeInTheDocument();
  });

  it("submits a leave request", async () => {
    const user = userEvent.setup();

    renderPage("Employee");

    await user.type(screen.getByLabelText("Start date"), tomorrow);
    await user.type(screen.getByLabelText("End date"), dayAfterTomorrow);
    await user.type(screen.getByLabelText("Reason"), "Family event");
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => expect(leaveApi.createLeaveRequest).toHaveBeenCalledWith(expect.objectContaining({ leaveType: "Annual" })));
  });

  it("rejects past leave dates on blur", async () => {
    const user = userEvent.setup();

    renderPage("Employee");

    await user.type(screen.getByLabelText("Start date"), yesterday);
    await user.tab();

    expect(await screen.findByText("Start date cannot be in the past.")).toBeInTheDocument();
  });

  it("approves a pending request", async () => {
    const user = userEvent.setup();

    renderPage("Manager");

    await screen.findAllByText("Family event");
    await user.click(screen.getByRole("button", { name: /approve leave request/i }));
    await user.click(screen.getByRole("button", { name: /^approve$/i }));

    await waitFor(() => expect(leaveApi.approveLeaveRequest).toHaveBeenCalledWith(leaveId));
  });

  it("does not show review actions for the current user's own request", async () => {
    vi.mocked(leaveApi.getLeaveRequests).mockResolvedValue(paged([ownRequest]));

    renderPage("Manager");

    expect(await screen.findByText("Own request")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /approve leave request/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reject leave request/i })).not.toBeInTheDocument();
  });

  it("searches review requests by employee text", async () => {
    const user = userEvent.setup();

    renderPage("Manager");

    await user.type(await screen.findByLabelText("Employee"), "Amina");

    await waitFor(() => expect(screen.getByLabelText("location")).toHaveTextContent("employeeSearch=Amina"));
    await waitFor(() => expect(leaveApi.getLeaveRequests).toHaveBeenCalledWith(expect.objectContaining({ employeeSearch: "Amina" })));
  });
});

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
