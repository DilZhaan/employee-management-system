import { createContext, useContext } from "react";

export type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

export interface ToastContextValue {
  showToast: (message: Omit<ToastMessage, "id">) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return value;
}
