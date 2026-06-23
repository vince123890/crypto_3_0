"use client";

import { useSignalStore } from "@/store/useSignalStore";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useSignalStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border shadow-xl",
            "animate-in slide-in-from-right-5 duration-300",
            toast.variant === "destructive"
              ? "bg-red-900/90 border-red-700 text-red-100"
              : "bg-gray-800/95 border-gray-700 text-gray-100"
          )}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-gray-400 mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
