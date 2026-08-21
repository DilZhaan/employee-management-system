import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastContext, type ToastMessage, type ToastTone } from "@/components/ui/toast-context";
import { cn } from "@/lib/utils";

const toneStyles: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  error: "border-rose-200 bg-rose-50 text-rose-950",
  info: "border-cyan-200 bg-cyan-50 text-cyan-950"
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  const showToast = useCallback(
    (message: Omit<ToastMessage, "id">) => {
      const id = Date.now() + Math.random();
      setMessages((current) => [...current, { ...message, id }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-60 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" role="status" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={cn("rounded-lg border p-4 shadow-lg", toneStyles[message.tone])}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{message.title}</p>
                {message.description ? <p className="text-sm opacity-80">{message.description}</p> : null}
              </div>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => dismiss(message.id)} aria-label="Dismiss message">
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
