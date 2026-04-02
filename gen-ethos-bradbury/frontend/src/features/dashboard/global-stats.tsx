"use client";

import { usePlatformStats } from "@/hooks/useGenEthos";
import { Buildings, ClipboardText } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const StatBox = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: React.ReactNode, 
  color: "amber" | "indigo" | "green" 
}) => {
  const colors = {
    amber: "bg-white text-black border-black dark:bg-[#050505] dark:text-[#CCFF00] dark:border-white",
    indigo: "bg-white text-black border-black dark:bg-[#050505] dark:text-[#CCFF00] dark:border-white",
    green: "bg-[#CCFF00] text-black border-black dark:border-white",
  };
  const iconColors = {
    amber: "dark:border-white dark:text-white",
    indigo: "dark:border-white dark:text-white",
    green: "dark:border-white dark:text-white",
  };
  return (
    <div className={cn(
      "p-10 rounded-none border-2 border-black flex flex-col gap-6 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
      colors[color] || colors.amber
    )}>
      <div className={cn(
        "p-4 w-fit rounded-none border-2 border-black bg-white text-black dark:bg-[#050505]",
        iconColors[color] || "dark:border-white dark:text-white"
      )}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">{label}</div>
        <div className="text-4xl font-black tracking-tighter italic leading-none">
          {value}
        </div>
      </div>
    </div>
  );
};

export function GlobalStats() {
  const { data, isLoading } = usePlatformStats();

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 relative pl-6 border-l-4 border-black dark:border-white">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-black dark:text-white">
          Oversight Dashboard
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">
          Verified Ethical Resource Governance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatBox 
          icon={<ClipboardText className="h-6 w-6" weight="duotone" />} 
          label="Cumulative Audits" 
          value={isLoading ? <div className="h-9 w-16 animate-pulse rounded-lg bg-black/10 dark:bg-white/10" /> : Number(data?.total_audits ?? 0)} 
          color="amber" 
        />
        <StatBox 
          icon={<Buildings className="h-6 w-6" weight="duotone" />} 
          label="Registered Companies" 
          value={isLoading ? <div className="h-9 w-16 animate-pulse rounded-lg bg-black/10 dark:bg-white/10" /> : Number(data?.total_companies ?? 0)} 
          color="green" 
        />
      </div>
    </div>
  );
}
