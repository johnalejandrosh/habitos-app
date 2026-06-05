"use client";

import { useEffect, useState } from "react";

export type ToastItem = {
  id: string;
  message: string;
  variant?: "success" | "info";
};

type ToastStackProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[max(4.5rem,env(safe-area-inset-top))] z-50 flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setExiting(true), 2200);
    const removeTimer = setTimeout(() => onDismiss(toast.id), 2600);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto max-w-sm rounded-2xl px-4 py-3 text-center text-sm font-semibold shadow-lg ${
        exiting ? "habit-toast-out" : "habit-toast-in"
      } ${
        toast.variant === "info"
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "bg-emerald-600 text-white"
      }`}
    >
      {toast.message}
    </div>
  );
}
