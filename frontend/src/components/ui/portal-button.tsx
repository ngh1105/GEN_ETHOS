import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export interface PortalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  asChild?: boolean;
}

export const PortalButton = React.forwardRef<HTMLButtonElement, PortalButtonProps>(
  ({ className, variant = "primary", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const base =
      "px-6 py-3 rounded-none font-black text-sm uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 border-2 border-black dark:border-white disabled:opacity-50 disabled:pointer-events-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]";

    const styles = {
      primary: "bg-[#CCFF00] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#CCFF00] dark:border-[#CCFF00]",
      secondary: "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
      outline: "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-[#050505] dark:text-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
    };

    return (
      <Comp
        ref={ref}
        className={cn(base, styles[variant], className)}
        {...props}
      />
    );
  }
);
PortalButton.displayName = "PortalButton";
