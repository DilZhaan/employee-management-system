import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/auth/use-auth";
import type { LoginRequest } from "@/types/auth";

export function useLogin() {
  const auth = useAuth();

  return useMutation({
    mutationFn: (request: LoginRequest) => auth.login(request)
  });
}
