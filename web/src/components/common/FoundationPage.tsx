import { useQuery } from "@tanstack/react-query";
import { Activity, Blocks, Cable, FileCode2, Route, ShieldCheck } from "lucide-react";
import { getApiHealth } from "@/api/endpoints/health";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/constants";

const foundationItems = [
  {
    title: "React Router",
    description: "Browser routing is configured with a root route and not-found route.",
    icon: Route
  },
  {
    title: "TanStack Query",
    description: "Server state is ready through a shared query client.",
    icon: Activity
  },
  {
    title: "Typed API Layer",
    description: "Axios endpoints use TypeScript contracts copied from the backend surface.",
    icon: Cable
  },
  {
    title: "UI Primitives",
    description: "Button, input, label, card, separator, and skeleton components are available.",
    icon: Blocks
  }
];

export function FoundationPage() {
  const healthQuery = useQuery({
    queryKey: ["api-health"],
    queryFn: getApiHealth,
    retry: false
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Enterprise Employee Management</p>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">EMS Web</h1>
            <p className="text-base leading-7 text-slate-600">
              Frontend foundation ready for the employee management dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button">Primary action</Button>
            <Button type="button" variant="outline">
              Secondary action
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API connection</CardTitle>
            <CardDescription>Health check against the configured backend base URL.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-base-url">Base URL</Label>
              <Input id="api-base-url" value={API_BASE_URL} readOnly className="mt-2" />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-600">Status</span>
              <HealthStatus isLoading={healthQuery.isLoading} isSuccess={healthQuery.isSuccess} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {foundationItems.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <item.icon className="size-5" aria-hidden="true" />
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contract alignment</CardTitle>
            <CardDescription>Frontend types match the current ASP.NET Core API response models.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-700" aria-hidden="true" />
                Roles: Employee, Manager, Admin
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-700" aria-hidden="true" />
                Errors: ProblemDetails and validation errors
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-700" aria-hidden="true" />
                Pagination: items, page, pageSize, totalCount, totalPages
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation boundary</CardTitle>
            <CardDescription>Business screens and authentication state are intentionally not implemented yet.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-start gap-3 text-sm leading-6 text-slate-600">
            <FileCode2 className="mt-0.5 size-5 shrink-0 text-slate-500" aria-hidden="true" />
            <p>
              The current app verifies routing, styling, provider composition, typed endpoints, and reusable UI primitives
              without introducing fake dashboard data.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

interface HealthStatusProps {
  isLoading: boolean;
  isSuccess: boolean;
}

function HealthStatus({ isLoading, isSuccess }: HealthStatusProps) {
  if (isLoading) {
    return <Skeleton className="h-6 w-24" />;
  }

  if (isSuccess) {
    return (
      <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
        Reachable
      </span>
    );
  }

  return (
    <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
      Not connected
    </span>
  );
}
