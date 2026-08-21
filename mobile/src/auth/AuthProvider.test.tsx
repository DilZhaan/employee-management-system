import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { Text } from "react-native";

import { AuthProvider } from "@/auth/AuthProvider";
import { useAuth } from "@/auth/useAuth";
import { tokenStorage } from "@/storage/tokenStorage";
import { createFakeJwt } from "@/test-utils/fakeJwt";

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(tokenStorage, "get").mockResolvedValue(null);
    jest.spyOn(tokenStorage, "set").mockResolvedValue();
    jest.spyOn(tokenStorage, "remove").mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("restores a valid stored token", async () => {
    jest.spyOn(tokenStorage, "get").mockResolvedValue(createFakeJwt({ email: "restore@example.com" }));

    const view = await render(
      <ProviderWrapper>
        <AuthProbe />
      </ProviderWrapper>
    );

    expect(await view.findByText("AUTH:restore@example.com")).toBeTruthy();
  });

  it("removes expired stored token during restoration", async () => {
    jest.spyOn(tokenStorage, "get").mockResolvedValue(createFakeJwt({ exp: Math.floor(Date.now() / 1000) - 60 }));

    const view = await render(
      <ProviderWrapper>
        <AuthProbe />
      </ProviderWrapper>
    );

    expect(await view.findByText("UNAUTH")).toBeTruthy();
    expect(tokenStorage.remove).toHaveBeenCalled();
  });

  it("establishes and clears session through auth API", async () => {
    const token = createFakeJwt({ email: "session@example.com" });

    const view = await render(
      <ProviderWrapper>
        <AuthActions />
      </ProviderWrapper>
    );

    fireEvent.press(await view.findByText("Establish"));
    await waitFor(() => expect(view.getByText("AUTH:session@example.com")).toBeTruthy());
    expect(tokenStorage.set).toHaveBeenCalledWith(token);

    fireEvent.press(view.getByText("Logout"));
    await waitFor(() => expect(view.getByText("UNAUTH")).toBeTruthy());
    expect(tokenStorage.remove).toHaveBeenCalled();
  });
});

function ProviderWrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

function AuthProbe() {
  const { isAuthenticated, isRestoring, user } = useAuth();

  if (isRestoring) {
    return <Text>RESTORING</Text>;
  }

  return <Text>{isAuthenticated ? `AUTH:${user?.email}` : "UNAUTH"}</Text>;
}

function AuthActions() {
  const { isAuthenticated, isRestoring, user, establishSession, logout } = useAuth();
  const token = createFakeJwt({ email: "session@example.com" });

  if (isRestoring) {
    return <Text>RESTORING</Text>;
  }

  return (
    <>
      <Text>{isAuthenticated ? `AUTH:${user?.email}` : "UNAUTH"}</Text>
      <Text onPress={() => void establishSession(token)}>Establish</Text>
      <Text onPress={() => void logout()}>Logout</Text>
    </>
  );
}
