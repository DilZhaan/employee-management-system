import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { authApi } from "@/api/endpoints/auth.api";
import { AuthContext, type AuthContextValue } from "@/auth/AuthContext";
import { useLogin } from "@/features/auth/hooks/useLogin";
import type { LoginResponse } from "@/types/auth";

jest.mock("@/api/endpoints/auth.api", () => ({
  authApi: {
    login: jest.fn()
  }
}));

const mockedAuthApi = jest.mocked(authApi);

describe("useLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits credentials and establishes session on success", async () => {
    const response: LoginResponse = {
      token: "fake-token",
      employee: {
        id: "00000000-0000-0000-0000-000000000001",
        employeeCode: "EMP-001",
        firstName: "Demo",
        lastName: "User",
        email: "employee@example.com",
        phoneNumber: null,
        departmentId: "00000000-0000-0000-0000-000000000010",
        role: "Employee",
        managerId: null,
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z"
      }
    };
    mockedAuthApi.login.mockResolvedValue(response);

    const onLoginSuccess = jest.fn().mockResolvedValue(undefined);
    const wrapper = createWrapper(onLoginSuccess);
    const { result } = await renderHook(() => useLogin(), { wrapper });

    await result.current.login({
      email: "employee@example.com",
      password: "password"
    });

    expect(mockedAuthApi.login).toHaveBeenCalledWith({
      email: "employee@example.com",
      password: "password"
    });
    expect(onLoginSuccess).toHaveBeenCalledWith(response);
  });

  it("maps 401 errors and does not establish session", async () => {
    mockedAuthApi.login.mockRejectedValue(
      new AxiosError("Unauthorized", undefined, undefined, undefined, {
        data: {},
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: {} as never
      })
    );

    const onLoginSuccess = jest.fn().mockResolvedValue(undefined);
    const wrapper = createWrapper(onLoginSuccess);
    const { result } = await renderHook(() => useLogin(), { wrapper });

    await expect(
      result.current.login({
        email: "employee@example.com",
        password: "bad-password"
      })
    ).rejects.toBeInstanceOf(AxiosError);

    await waitFor(() => {
      expect(result.current.errorMessage).toBe("Invalid email or password.");
    });
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });
});

function createWrapper(onLoginSuccess: AuthContextValue["onLoginSuccess"]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user: null,
            token: null,
            isAuthenticated: false,
            isRestoring: false,
            establishSession: jest.fn(),
            logout: jest.fn(),
            onLoginSuccess
          }}
        >
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}
