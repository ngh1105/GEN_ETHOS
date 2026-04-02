import * as React from "react";
import { cn } from "@/lib/utils";

export interface PortalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
}

export const PortalCard = React.forwardRef<HTMLDivElement, PortalCardProps>(
  ({ className, accent = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border-2 border-black dark:border-white rounded-none transition-all duration-300",
          "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "dark:bg-[#050505] dark:text-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
          accent && "border-[#CCFF00] dark:border-[#CCFF00] dark:shadow-[4px_4px_0px_0px_#CCFF00]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PortalCard.displayName = "PortalCard";
