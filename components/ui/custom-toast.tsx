"use client";

import { toast as sonnerToast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

const config: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; title: string; iconColor: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    bg: "bg-white dark:bg-[#0F1923]",
    border: "border-l-4 border-l-green-500",
    title: "text-green-700 dark:text-green-400",
    iconColor: "text-green-500",
  },
  error: {
    icon: <XCircle className="w-5 h-5" />,
    bg: "bg-white dark:bg-[#0F1923]",
    border: "border-l-4 border-l-red-500",
    title: "text-red-700 dark:text-red-400",
    iconColor: "text-red-500",
  },
  warning: {
    icon: <AlertCircle className="w-5 h-5" />,
    bg: "bg-white dark:bg-[#0F1923]",
    border: "border-l-4 border-l-amber-500",
    title: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-500",
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    bg: "bg-white dark:bg-[#0F1923]",
    border: "border-l-4 border-l-blue-500",
    title: "text-blue-700 dark:text-blue-400",
    iconColor: "text-blue-500",
  },
};

function ToastContent({
  type, message, id,
}: {
  type: ToastType;
  message: string;
  id: string | number;
}) {
  const c = config[type];
  return (
    <div className={`flex items-start gap-3 w-full px-4 py-3 rounded-xl shadow-lg border border-[#A0AEC0]/20 ${c.bg} ${c.border}`}>
      <span className={`mt-0.5 shrink-0 ${c.iconColor}`}>{c.icon}</span>
      <p className={`flex-1 text-sm font-medium leading-snug ${c.title}`}>{message}</p>
      <button
        onClick={() => sonnerToast.dismiss(id)}
        className="shrink-0 mt-0.5 text-[#A0AEC0] hover:text-[#718096] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export const toast = {
  success: (message: string) =>
    sonnerToast.custom((id) => <ToastContent type="success" message={message} id={id} />, { duration: 3500 }),

  error: (message: string) =>
    sonnerToast.custom((id) => <ToastContent type="error" message={message} id={id} />, { duration: 5000 }),

  warning: (message: string) =>
    sonnerToast.custom((id) => <ToastContent type="warning" message={message} id={id} />, { duration: 4000 }),

  info: (message: string) =>
    sonnerToast.custom((id) => <ToastContent type="info" message={message} id={id} />, { duration: 3500 }),
};
