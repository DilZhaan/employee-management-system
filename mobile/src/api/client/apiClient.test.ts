import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

import { apiClient, registerUnauthorizedHandler, resetUnauthorizedGuard } from "@/api/client/apiClient";
import { sessionToken } from "@/auth/sessionToken";

describe("apiClient", () => {
  beforeEach(() => {
    registerUnauthorizedHandler(null);
    resetUnauthorizedGuard();
    sessionToken.set(null);
  });

  it("uses the public API base URL", () => {
    expect(apiClient.defaults.baseURL).toBe("http://127.0.0.1:5186");
  });

  it("attaches bearer token when session token exists", async () => {
    sessionToken.set("fake-session-token");
    const adapter = jest.fn(async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => ({
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config
    }));

    await apiClient.get("/api/v1/attendance/me", { adapter });

    expect(adapter).toHaveBeenCalled();
    const config = adapter.mock.calls[0][0];
    expect(config.headers.Authorization).toBe("Bearer fake-session-token");
  });

  it("invalidates session on protected 401 once", async () => {
    const unauthorizedHandler = jest.fn().mockResolvedValue(undefined);
    registerUnauthorizedHandler(unauthorizedHandler);

    const failingAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
      throw createAxiosError(401, config);
    };

    await expect(apiClient.get("/api/v1/attendance/me", { adapter: failingAdapter })).rejects.toBeInstanceOf(AxiosError);
    await expect(apiClient.get("/api/v1/attendance/me", { adapter: failingAdapter })).rejects.toBeInstanceOf(AxiosError);

    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
  });

  it("does not invalidate session on login 401", async () => {
    const unauthorizedHandler = jest.fn().mockResolvedValue(undefined);
    registerUnauthorizedHandler(unauthorizedHandler);

    const failingAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
      throw createAxiosError(401, config);
    };

    await expect(
      apiClient.post(
        "/api/v1/auth/login",
        { email: "employee@example.com", password: "bad-password" },
        { adapter: failingAdapter, skipAuthInvalidation: true }
      )
    ).rejects.toBeInstanceOf(AxiosError);

    expect(unauthorizedHandler).not.toHaveBeenCalled();
  });

  it("does not invalidate session on 403", async () => {
    const unauthorizedHandler = jest.fn().mockResolvedValue(undefined);
    registerUnauthorizedHandler(unauthorizedHandler);

    const failingAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
      throw createAxiosError(403, config);
    };

    await expect(apiClient.get("/api/v1/attendance/me", { adapter: failingAdapter })).rejects.toBeInstanceOf(AxiosError);

    expect(unauthorizedHandler).not.toHaveBeenCalled();
  });
});

function createAxiosError(status: number, config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError(
    `Request failed with status code ${status}`,
    undefined,
    config,
    undefined,
    {
      data: {},
      status,
      statusText: String(status),
      headers: {},
      config
    }
  );
}
