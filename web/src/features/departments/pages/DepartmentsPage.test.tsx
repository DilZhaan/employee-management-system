import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { tokenStorage } from "@/auth/token-storage";
import { ToastProvider } from "@/components/ui/toast";
import { DepartmentsPage } from "@/features/departments/pages/DepartmentsPage";
import { createAuthToken } from "@/test/auth-test-utils";
import type { PagedResult } from "@/types/api";
import type { DepartmentResponse } from "@/types/department";

vi.mock("@/api/endpoints/departments", () => ({
  getDepartments: vi.fn(),
  getDepartment: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deactivateDepartment: vi.fn()
}));

vi.mock("@/api/endpoints/employees", () => ({
  getEmployees: vi.fn(),
  getEmployee: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deactivateEmployee: vi.fn()
}));

const departmentsApi = await import("@/api/endpoints/departments");

const department: DepartmentResponse = {
  id: "22222222-2222-4222-8222-222222222222",
  code: "ENG",
  name: "Engineering",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z"
};

function paged<TItem>(items: TItem[]): PagedResult<TItem> {
  return {
    items,
    page: 1,
    pageSize: 20,
    totalCount: items.length,
    totalPages: items.length === 0 ? 0 : 1
  };
}

function renderPage(role: "Admin" | "Employee" = "Admin") {
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
          <MemoryRouter initialEntries={["/departments"]}>
            <DepartmentsPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe("DepartmentsPage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.mocked(departmentsApi.getDepartments).mockResolvedValue(paged([department]));
    vi.mocked(departmentsApi.createDepartment).mockResolvedValue(department);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders API department data", async () => {
    renderPage();

    expect(await screen.findByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("ENG")).toBeInTheDocument();
  });

  it("validates the department form", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole("button", { name: /add department/i }));
    await user.click(screen.getByRole("button", { name: /create department/i }));

    expect(await screen.findByText("Department code is required.")).toBeInTheDocument();
    expect(screen.getByText("Department name is required.")).toBeInTheDocument();
  });

  it("removes numbers from department name while typing", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole("button", { name: /add department/i }));
    await user.type(screen.getByLabelText("Name"), "Finance123");

    expect(screen.getByLabelText("Name")).toHaveValue("Finance");
  });

  it("shows department mutation errors", async () => {
    const user = userEvent.setup();
    vi.mocked(departmentsApi.createDepartment).mockRejectedValue(new Error("duplicate"));

    renderPage();

    await user.click(await screen.findByRole("button", { name: /add department/i }));
    await user.type(screen.getByLabelText("Code"), "ENG");
    await user.type(screen.getByLabelText("Name"), "Engineering");
    await user.click(screen.getByRole("button", { name: /create department/i }));

    expect(await screen.findByText("Something went wrong while processing the request.")).toBeInTheDocument();
  });

  it("hides management actions for Employee role", async () => {
    renderPage("Employee");

    expect(await screen.findByText("Engineering")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add department/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit engineering/i })).not.toBeInTheDocument();
  });
});
