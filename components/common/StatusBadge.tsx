import { cn, statusColors } from "@/lib/utils";

type StatusKey = keyof typeof statusColors;

export function StatusBadge({ status }: { status: string }) {
  const colorClass = statusColors[status as StatusKey] ?? "bg-gray-100 text-gray-600";
  const label = status.replace("_", " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        status === "PENDING" && "animate-pulse"
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
