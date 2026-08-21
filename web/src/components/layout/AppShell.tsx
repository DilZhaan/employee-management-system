import { Outlet } from "react-router-dom";
import { Building2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3 font-semibold tracking-normal text-slate-950">
            <span className="flex size-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <Building2 className="size-5" aria-hidden="true" />
            </span>
            <span>{APP_NAME}</span>
          </a>
          <nav aria-label="Main navigation" className="text-sm text-slate-600">
            Foundation
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
