import { createContext } from "react";

import type { AuthUser, LoginResponse } from "@/types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  establishSession: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  onLoginSuccess: (response: LoginResponse) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
