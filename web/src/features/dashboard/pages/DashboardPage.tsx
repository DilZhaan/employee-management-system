import { useAuth } from "@/auth/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <PageContainer title="Dashboard" description="Overview workspace for the employee management system.">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Your authenticated session is active.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>
            Signed in as <span className="font-medium text-slate-950">{user?.email}</span>
          </p>
          <p>
            Role: <span className="font-medium text-slate-950">{user?.role}</span>
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
