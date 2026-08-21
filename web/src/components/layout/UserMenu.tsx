import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/use-auth";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-slate-950">{user?.email}</p>
        <p className="text-xs text-slate-500">{user?.role}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="size-4" aria-hidden="true" />
        Logout
      </Button>
    </div>
  );
}
