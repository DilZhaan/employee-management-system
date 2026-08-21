import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/UserMenu";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open navigation">
        <Menu className="size-5" aria-hidden="true" />
      </Button>
      <div className="hidden text-sm font-medium text-slate-600 lg:block">Employee Management System</div>
      <UserMenu />
    </header>
  );
}
