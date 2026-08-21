import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { subscribeToUnauthorized } from "@/auth/auth-events";
import { AuthContext } from "@/auth/auth-context";
import { parseAuthUserFromToken } from "@/auth/jwt";
import { tokenStorage } from "@/auth/token-storage";
import { login as loginRequest } from "@/api/endpoints/auth";
import type { AuthUser, LoginRequest } from "@/types/auth";

function restoreSession(): { token: string; user: AuthUser } | null {
  const token = tokenStorage.get();
  if (!token) {
    return null;
  }

  const user = parseAuthUserFromToken(token);
  if (!user) {
    tokenStorage.remove();
    return null;
  }

  return { token, user };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(() => restoreSession());

  const clearSession = useCallback(() => {
    tokenStorage.remove();
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => subscribeToUnauthorized(clearSession), [clearSession]);

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await loginRequest(request);
      const user = parseAuthUserFromToken(response.token);

      if (!user) {
        tokenStorage.remove();
        throw new Error("The sign-in response was invalid.");
      }

      queryClient.clear();
      tokenStorage.set(response.token);
      setSession({ token: response.token, user });
    },
    [queryClient]
  );

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.user && session?.token),
      login,
      logout: clearSession
    }),
    [clearSession, login, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
