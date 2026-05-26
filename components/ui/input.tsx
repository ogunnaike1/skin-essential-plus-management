import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[#A0AEC0] bg-white px-3 py-2 text-sm text-[#1A202C] placeholder:text-[#A0AEC0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0346A0] focus-visible:border-[#0346A0] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1A2535] dark:border-[#2D3748] dark:text-white dark:placeholder:text-[#4A5568]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
