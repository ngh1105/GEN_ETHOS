import * as React from "react";
import { cn } from "@/lib/utils";

export interface PortalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const PortalInput = React.forwardRef<HTMLInputElement, PortalInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-3 w-full">
        <label className="text-[11px] font-black text-black dark:text-[#CCFF00] uppercase tracking-[0.25em] block ml-2">
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            "w-full border-2 border-black dark:border-white rounded-none px-6 py-4 text-sm outline-none transition-all placeholder:text-gray-500 font-bold tracking-tight",
            "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[4px] focus:translate-y-[4px] focus:shadow-none focus:border-[#CCFF00]",
            "dark:bg-[#050505] dark:text-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:focus:shadow-none dark:focus:border-[#CCFF00]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
PortalInput.displayName = "PortalInput";
