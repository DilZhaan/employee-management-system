import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { tokenStorage } from "@/auth/token-storage";
import { ToastProvider } from "@/components/ui/toast";
import { AttendancePage } from "@/features/attendance/pages/AttendancePage";
import { todayDateOnly } from "@/lib/date-rules";
import { createAuthToken } from "@/test/auth-test-utils";
import type { PagedResult } from "@/types/api";
import type { AttendanceResponse } from "@/types/attendance";
import type { DepartmentResponse } from "@/types/department";

vi.mock("@/api/endpoints/attendance", () => ({
  checkIn: vi.fn(),
  checkOut: vi.fn(),
  getMyAttendance: vi.fn(),
  getAttendance: vi.fn()
}));

vi.mock("@/api/endpoints/departments", () => ({
  getDepartments: vi.fn(),
  getDepartment: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deactivateDepartment: vi.fn()
}));

const attendanceApi = await import("@/api/endpoints/attendance");
const departmentsApi = await import("@/api/endpoints/departments");

const attendanceId = "11111111-1111-4111-8111-111111111111";
const employeeId = "44444444-4444-4444-8444-444444444444";
const departmentId = "22222222-2222-4222-8222-222222222222";
const tomorrow = addDays(todayDateOnly(), 1);

const record: AttendanceResponse = {
  id: attendanceId,
  employeeId,
  checkInTime: "2026-01-02T03:00:00Z",
  checkOutTime: null,
  workDate: "2026-01-02",
  status: "Present",
  deviceType: "Web"
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
          <MemoryRouter initialEntries={["/attendance"]}>
            <AttendancePage />
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

describe("AttendancePage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.mocked(attendanceApi.getMyAttendance).mockResolvedValue(paged([record]));
    vi.mocked(attendanceApi.getAttendance).mockResolvedValue(paged([record]));
    vi.mocked(attendanceApi.checkIn).mockResolvedValue(record);
    vi.mocked(attendanceApi.checkOut).mockResolvedValue({ ...record, checkOutTime: "2026-01-02T11:00:00Z" });
    vi.mocked(departmentsApi.getDepartments).mockResolvedValue(paged([department]));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders attendance data", async () => {
    renderPage();

    expect(await screen.findByText(employeeId)).toBeInTheDocument();
    expect(screen.getByText("Present")).toBeInTheDocument();
  });

  it("checks in with web device type", async () => {
    const user = userEvent.setup();
    vi.mocked(attendanceApi.getMyAttendance).mockResolvedValue(paged([]));

    renderPage("Employee");

    await user.click(await screen.findByRole("button", { name: /check in/i }));

    await waitFor(() => expect(attendanceApi.checkIn).toHaveBeenCalledWith({ deviceType: "Web" }));
  });

  it("disables check-in and check-out after completed attendance", async () => {
    vi.mocked(attendanceApi.getMyAttendance).mockResolvedValue(
      paged([{ ...record, checkOutTime: "2026-01-02T11:00:00Z" }])
    );

    renderPage("Employee");

    expect(await screen.findByRole("button", { name: /check in/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /check out/i })).toBeDisabled();
  });

  it("keeps manager filters in the URL", async () => {
    const user = userEvent.setup();

    renderPage("Manager");

    await user.type(await screen.findByLabelText("Employee ID"), employeeId);
    await user.selectOptions(screen.getByLabelText("Department"), department.id);

    await waitFor(() => expect(screen.getByLabelText("location")).toHaveTextContent(`employeeId=${employeeId}`));
    expect(screen.getByLabelText("location")).toHaveTextContent(`departmentId=${departmentId}`);
  });

  it("clamps future attendance filter dates to today", async () => {
    renderPage("Manager");

    fireEvent.change(await screen.findByLabelText("From"), { target: { value: tomorrow } });

    await waitFor(() => expect(screen.getByLabelText("location")).toHaveTextContent(`from=${todayDateOnly()}`));
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
