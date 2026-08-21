import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { registerUnauthorizedHandler, resetUnauthorizedGuard } from "@/api/client/apiClient";
import { AuthContext } from "@/auth/AuthContext";
import { sessionToken } from "@/auth/sessionToken";
import { tokenStorage } from "@/storage/tokenStorage";
import type { AuthUser, LoginResponse } from "@/types/auth";
import { parseAuthUserFromToken } from "@/utils/jwt";

interface SessionState {
  token: string;
  user: AuthUser;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<SessionState | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const clearSession = useCallback(async () => {
    sessionToken.set(null);
    resetUnauthorizedGuard();
    setSession(null);
    await tokenStorage.remove();
    queryClient.clear();
  }, [queryClient]);

  const establishSession = useCallback(async (token: string) => {
    const user = parseAuthUserFromToken(token);

    if (!user) {
      await clearSession();
      throw new Error("Received an invalid session token.");
    }

    await tokenStorage.set(token);
    sessionToken.set(token);
    resetUnauthorizedGuard();
    setSession({ token, user });
  }, [clearSession]);

  const onLoginSuccess = useCallback(
    async (response: LoginResponse) => {
      await establishSession(response.token);
    },
    [establishSession]
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  useEffect(() => {
    registerUnauthorizedHandler(logout);
    return () => registerUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const storedToken = await tokenStorage.get();

        if (!storedToken) {
          sessionToken.set(null);
          return;
        }

        const user = parseAuthUserFromToken(storedToken);

        if (!user) {
          sessionToken.set(null);
          await tokenStorage.remove();
          return;
        }

        sessionToken.set(storedToken);

        if (!cancelled) {
          setSession({ token: storedToken, user });
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token && session?.user),
      isRestoring,
      establishSession,
      logout,
      onLoginSuccess
    }),
    [session, isRestoring, establishSession, logout, onLoginSuccess]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
