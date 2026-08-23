import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { tokenStorage } from "@/auth/token-storage";
import { ToastProvider } from "@/components/ui/toast";
import { createAuthToken } from "@/test/auth-test-utils";
import { EmployeesPage } from "@/features/employees/pages/EmployeesPage";
import type { PagedResult } from "@/types/api";
import type { DepartmentResponse } from "@/types/department";
import type { EmployeeQuery, EmployeeResponse } from "@/types/employee";

vi.mock("@/api/endpoints/employees", () => ({
  getEmployees: vi.fn(),
  getEmployee: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deactivateEmployee: vi.fn(),
  activateEmployee: vi.fn()
}));

vi.mock("@/api/endpoints/departments", () => ({
  getDepartments: vi.fn(),
  getDepartment: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deactivateDepartment: vi.fn()
}));

const employeesApi = await import("@/api/endpoints/employees");
const departmentsApi = await import("@/api/endpoints/departments");

const departmentId = "22222222-2222-4222-8222-222222222222";
const managerId = "33333333-3333-4333-8333-333333333333";
const employeeId = "44444444-4444-4444-8444-444444444444";

const engineering: DepartmentResponse = {
  id: departmentId,
  code: "ENG",
  name: "Engineering",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z"
};

const manager: EmployeeResponse = {
  id: managerId,
  employeeCode: "EMP001",
  firstName: "Maya",
  lastName: "Manager",
  email: "maya.manager@ems.local",
  phoneNumber: null,
  departmentId,
  role: "Manager",
  managerId: null,
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z"
};

const employee: EmployeeResponse = {
  id: employeeId,
  employeeCode: "EMP002",
  firstName: "Nimal",
  lastName: "Perera",
  email: "nimal.perera@ems.local",
  phoneNumber: "0771234567",
  departmentId,
  role: "Employee",
  managerId,
  isActive: true,
  createdAt: "2026-01-02T00:00:00Z"
};

const inactiveEmployee: EmployeeResponse = {
  ...employee,
  id: "55555555-5555-4555-8555-555555555555",
  employeeCode: "EMP004",
  firstName: "Kamal",
  lastName: "Inactive",
  email: "kamal.inactive@ems.local",
  isActive: false
};

function paged<TItem>(items: TItem[], page = 1, pageSize = 20): PagedResult<TItem> {
  return {
    items,
    page,
    pageSize,
    totalCount: items.length,
    totalPages: items.length === 0 ? 0 : 1
  };
}

function renderPage(role: "Admin" | "Employee" = "Admin", initialPath = "/employees") {
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
          <MemoryRouter initialEntries={[initialPath]}>
            <EmployeesPage />
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

describe("EmployeesPage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.mocked(departmentsApi.getDepartments).mockResolvedValue(paged([engineering], 1, 100));
    vi.mocked(employeesApi.getEmployees).mockImplementation((query?: EmployeeQuery) => {
      if (query?.pageSize === 100) {
        return Promise.resolve(paged([manager], 1, 100));
      }

      return Promise.resolve(paged([employee], query?.page ?? 1, query?.pageSize ?? 20));
    });
    vi.mocked(employeesApi.createEmployee).mockResolvedValue(employee);
    vi.mocked(employeesApi.activateEmployee).mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a table skeleton while employees load", () => {
    vi.mocked(employeesApi.getEmployees).mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByLabelText("Loading rows")).toBeInTheDocument();
  });

  it("renders API employee data", async () => {
    renderPage();

    expect(await screen.findByText("Nimal Perera")).toBeInTheDocument();
    expect(screen.getAllByText("Engineering").length).toBeGreaterThan(0);
    expect(screen.getByText("Maya Manager")).toBeInTheDocument();
  });

  it("shows an empty state when no employees exist", async () => {
    vi.mocked(employeesApi.getEmployees).mockImplementation((query?: EmployeeQuery) => {
      if (query?.pageSize === 100) {
        return Promise.resolve(paged([manager], 1, 100));
      }

      return Promise.resolve(paged([]));
    });

    renderPage();

    expect(await screen.findByText("No employees exist.")).toBeInTheDocument();
  });

  it("keeps search and filters in the URL", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(await screen.findByLabelText("Search employees"), "nimal");
    await user.selectOptions(screen.getByLabelText("Role"), "Employee");

    await waitFor(
      () => {
        expect(screen.getByLabelText("location")).toHaveTextContent("role=Employee");
      },
      { timeout: 1000 }
    );
    await waitFor(
      () => {
        expect(screen.getByLabelText("location")).toHaveTextContent("search=nimal");
      },
      { timeout: 1000 }
    );
  });

  it("validates the employee form", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole("button", { name: /add employee/i }));
    await user.click(screen.getByRole("button", { name: /create employee/i }));

    expect(await screen.findByText("Employee code is required.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  it("removes numbers from names and letters from phone while typing", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole("button", { name: /add employee/i }));
    await user.type(screen.getByLabelText("First name"), "Ni123mal");
    await user.type(screen.getByLabelText("Phone"), "abc077-123");

    expect(screen.getByLabelText("First name")).toHaveValue("Nimal");
    expect(screen.getByLabelText("Phone")).toHaveValue("077-123");
  });

  it("shows Admin management actions", async () => {
    renderPage("Admin");

    expect(await screen.findByText("Nimal Perera")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add employee/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit nimal perera/i })).toBeInTheDocument();
  });

  it("hides management actions for Employee role", async () => {
    renderPage("Employee");

    expect(await screen.findByText("Nimal Perera")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add employee/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit nimal perera/i })).not.toBeInTheDocument();
  });

  it("creates an employee and refetches employee lists", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(await screen.findByRole("button", { name: /add employee/i }));
    const dialog = screen.getByRole("dialog", { name: /add employee/i });
    await user.type(screen.getByLabelText("Employee code"), "EMP003");
    await user.type(screen.getByLabelText("First name"), "Sara");
    await user.type(screen.getByLabelText("Last name"), "Silva");
    await user.type(screen.getByLabelText("Email"), "sara.silva@ems.local");
    await user.type(screen.getByLabelText("Password"), "Password123");
    await user.selectOptions(within(dialog).getByLabelText("Department"), engineering.id);
    await user.click(screen.getByRole("button", { name: /create employee/i }));

    await waitFor(() => expect(employeesApi.createEmployee).toHaveBeenCalledWith(expect.objectContaining({ employeeCode: "EMP003", firstName: "Sara" })));
    await waitFor(() => expect(vi.mocked(employeesApi.getEmployees).mock.calls.length).toBeGreaterThanOrEqual(3));
  });

  it("activates an inactive employee", async () => {
    const user = userEvent.setup();
    vi.mocked(employeesApi.getEmployees).mockImplementation((query?: EmployeeQuery) => {
      if (query?.pageSize === 100) {
        return Promise.resolve(paged([manager], 1, 100));
      }

      return Promise.resolve(paged([inactiveEmployee], query?.page ?? 1, query?.pageSize ?? 20));
    });

    renderPage();

    await user.click(await screen.findByRole("button", { name: /activate kamal inactive/i }));
    await user.click(screen.getByRole("button", { name: /^activate$/i }));

    await waitFor(() => expect(employeesApi.activateEmployee).toHaveBeenCalledWith(inactiveEmployee.id));
  });
});
