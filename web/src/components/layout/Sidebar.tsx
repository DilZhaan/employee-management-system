import { NavLink } from "react-router-dom";
import { Building2 } from "lucide-react";
import { navigationItems } from "@/app/router/navigation";
import { useAuth } from "@/auth/use-auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const visibleItems = navigationItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <span className="flex size-9 items-center justify-center rounded-md bg-slate-950 text-white">
          <Building2 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-950">EMS Web</p>
          <p className="text-xs text-slate-500">Management system</p>
        </div>
      </div>
      <nav aria-label="Application navigation" className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950",
                isActive && "bg-slate-100 text-slate-950"
              )
            }
          >
            <item.icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
