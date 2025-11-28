"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2 } from "lucide-react";

type Toast = {
  id: number;
  title?: string;
  description?: string;
};

type ToastContextValue = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...toast }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Clean up any state on unmount
  useEffect(() => {
    setMounted(true);
    return () => {
      setToasts([]);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-8">
            <div className="flex w-full max-w-sm flex-col gap-2">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className="pointer-events-auto flex items-start gap-3 rounded-md border border-border/60 bg-background/90 px-4 py-3 text-sm shadow-lg backdrop-blur-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <div>
                    {toast.title && (
                      <p className="font-medium leading-snug">{toast.title}</p>
                    )}
                    {toast.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {toast.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return ctx;
}


