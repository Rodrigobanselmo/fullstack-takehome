"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./toast.module.css";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
  duration?: number;
  exiting?: boolean;
}

interface ToastContextValue {
  showToast: (options: Omit<Toast, "id" | "exiting">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastIdCounter = 0;

const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  useEffect(() => {
    const duration = toast.duration ?? 4000;
    const exitTime = duration - 200;

    const exitTimer = setTimeout(() => {
      onRemove();
    }, exitTime);

    return () => {
      clearTimeout(exitTimer);
    };
  }, [toast.duration, onRemove]);

  return (
    <div
      className={`${styles.toast} ${styles[toast.variant]} ${toast.exiting ? styles.exiting : ""}`}
      role="alert"
    >
      <span className={styles.icon}>{variantIcons[toast.variant]}</span>
      <div className={styles.content}>
        <p className={styles.title}>{toast.title}</p>
        {toast.message && <p className={styles.message}>{toast.message}</p>}
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onRemove}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (options: Omit<Toast, "id" | "exiting">) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { ...options, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = options.duration ?? 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const success = (title: string, message?: string) => {
    showToast({ title, message, variant: "success" });
  };

  const error = (title: string, message?: string) => {
    showToast({ title, message, variant: "error", duration: 6000 });
  };

  const warning = (title: string, message?: string) => {
    showToast({ title, message, variant: "warning" });
  };

  const info = (title: string, message?: string) => {
    showToast({ title, message, variant: "info" });
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {mounted &&
        createPortal(
          <div className={styles.toastContainer}>
            {toasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onRemove={() => removeToast(toast.id)}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
