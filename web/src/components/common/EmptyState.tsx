import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {description ? <p className="max-w-md text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
