import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { RoleGuard } from "@/app/router/RoleGuard";
import { useAuth } from "@/auth/use-auth";
import { tokenStorage } from "@/auth/token-storage";
import { createAuthToken } from "@/test/auth-test-utils";

function renderWithAuth(ui: React.ReactNode, initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("auth routing", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("redirects unauthenticated users from protected routes", () => {
    renderWithAuth(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/employees" element={<div>Employees</div>} />
        </Route>
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
      "/employees"
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("allows authenticated users to access protected routes", () => {
    tokenStorage.set(createAuthToken({ role: "Admin" }));

    renderWithAuth(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/employees" element={<div>Employees</div>} />
        </Route>
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
      "/employees"
    );

    expect(screen.getByText("Employees")).toBeInTheDocument();
  });

  it("permits allowed roles", () => {
    tokenStorage.set(createAuthToken({ role: "Admin" }));

    renderWithAuth(
      <Routes>
        <Route element={<RoleGuard allowedRoles={["Admin"]} />}>
          <Route path="/employees" element={<div>Employees</div>} />
        </Route>
        <Route path="/forbidden" element={<div>Forbidden</div>} />
      </Routes>,
      "/employees"
    );

    expect(screen.getByText("Employees")).toBeInTheDocument();
  });

  it("rejects disallowed roles", () => {
    tokenStorage.set(createAuthToken({ role: "Employee" }));

    renderWithAuth(
      <Routes>
        <Route element={<RoleGuard allowedRoles={["Admin"]} />}>
          <Route path="/employees" element={<div>Employees</div>} />
        </Route>
        <Route path="/forbidden" element={<div>Forbidden</div>} />
      </Routes>,
      "/employees"
    );

    expect(screen.getByText("Forbidden")).toBeInTheDocument();
  });

  it("clears authentication state on logout", async () => {
    const user = userEvent.setup();
    tokenStorage.set(createAuthToken({ role: "Admin", email: "admin@ems.local" }));

    renderWithAuth(<LogoutProbe />);

    expect(screen.getByText("admin@ems.local")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(screen.getByText("signed out")).toBeInTheDocument();
    expect(tokenStorage.get()).toBeNull();
  });

  it("rejects expired tokens during restoration", () => {
    tokenStorage.set(createAuthToken({ expiresAt: Math.floor(Date.now() / 1000) - 60 }));

    renderWithAuth(<AuthStatusProbe />);

    expect(screen.getByText("signed out")).toBeInTheDocument();
    expect(tokenStorage.get()).toBeNull();
  });
});

function AuthStatusProbe() {
  const { user } = useAuth();
  return <div>{user?.email ?? "signed out"}</div>;
}

function LogoutProbe() {
  const { user, logout } = useAuth();
  return (
    <div>
      <span>{user?.email ?? "signed out"}</span>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
