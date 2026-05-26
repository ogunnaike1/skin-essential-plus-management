import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#F5F7FA] dark:bg-[#2D3748]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
