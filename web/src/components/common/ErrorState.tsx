import { Button } from "@/components/ui/button";
import type { NormalizedApiError } from "@/api/errors";

interface ErrorStateProps {
  title: string;
  error: NormalizedApiError;
  onRetry?: () => void;
}

export function ErrorState({ title, error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <p className="max-w-md text-sm leading-6 text-slate-600">{error.detail ?? error.title}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
