import { useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { normalizeApiError } from "@/api/errors";
import { useAuth } from "@/auth/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useLogin } from "@/features/auth/hooks/useLogin";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";

interface RedirectState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as RedirectState | null)?.from?.pathname ?? "/dashboard";

  const errorMessage = useMemo(() => {
    if (!loginMutation.error) {
      return undefined;
    }

    const error = normalizeApiError(loginMutation.error);
    if (error.kind === "unauthenticated") {
      return "Invalid email or password.";
    }

    if (error.kind === "network" || error.kind === "timeout") {
      return "Unable to connect to the server. Please try again.";
    }

    return "Sign in failed. Please try again.";
  }, [loginMutation.error]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(values: LoginFormValues) {
    await loginMutation.mutateAsync(values);
    navigate(redirectTo, { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex size-12 items-center justify-center rounded-md bg-slate-950 text-white">
            <Building2 className="size-6" aria-hidden="true" />
          </span>
          <CardTitle className="text-xl">EMS</CardTitle>
          <CardDescription>Employee Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={handleSubmit} errorMessage={errorMessage} isSubmitting={loginMutation.isPending} />
        </CardContent>
      </Card>
    </main>
  );
}
