"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBar,
  Buildings,
  Brain,
  MagnifyingGlass,
  List,
  ArrowSquareOut
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: ChartBar,
    description: "Platform overview",
  },
  {
    label: "Onboarding",
    href: "/onboarding",
    icon: Buildings,
    description: "Register & stake",
  },
  {
    label: "AI Audit Engine",
    href: "/audit-engine",
    icon: Brain,
    description: "Request AI audit",
  },
  {
    label: "Explorer",
    href: "/explorer",
    icon: MagnifyingGlass,
    description: "Company lookup",
  },
];

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r-2 border-black bg-white dark:border-white dark:bg-[#050505] transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="p-6 flex items-center justify-between border-b-2 border-black dark:border-white h-20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center shrink-0 overflow-hidden border-2 border-black bg-[#F5F5F0] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Image
                src="/gen-ethos-logo-480.png"
                alt="GEN-ETHOS logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-black text-lg tracking-tighter leading-none text-black dark:text-white">
                  GEN-ETHOS
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest mt-1 text-black dark:text-[#CCFF00]">
                  Computed Trust
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 transition-all duration-200 group relative cursor-pointer border-2",
                  isActive
                    ? "bg-black text-[#CCFF00] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-white dark:text-black dark:border-white dark:shadow-[4px_4px_0px_0px_#CCFF00]"
                    : "text-gray-800 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:text-gray-200 dark:hover:border-white dark:hover:shadow-[4px_4px_0px_0px_#CCFF00]",
                  collapsed && "justify-center px-0 w-12 h-12 mx-auto"
                )}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-[-18px] top-1/2 -translate-y-1/2 w-2 h-10 bg-black dark:bg-white border-y-2 border-r-2 border-black dark:border-white" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-[#CCFF00] dark:text-black"
                      : "text-black group-hover:text-black dark:text-white dark:group-hover:text-[#CCFF00]"
                  )}
                  weight={isActive ? "fill" : "bold"}
                />
                {!collapsed && (
                  <span className="text-[12px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 border-t-2 border-black dark:border-white space-y-4">
          
          <a
            href="https://zksync-os-testnet-genlayer.explorer.zksync.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center border-2 border-black bg-white py-3 text-black font-black uppercase tracking-widest text-[10px] transition-all duration-200 hover:bg-[#CCFF00] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-[#050505] dark:text-white dark:hover:bg-[#CCFF00] dark:hover:text-black dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer"
            title="GenLayer Testnet Explorer"
          >
            <ArrowSquareOut className="h-4 w-4" weight="bold" />
            {!collapsed && <span className="ml-2">Testnet Explorer</span>}
          </a>

          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center py-2 text-gray-800 dark:text-gray-200 font-bold transition-colors duration-200 hover:text-black dark:hover:text-[#CCFF00] cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <List className="h-4 w-4" weight="bold" />
            {!collapsed && <span className="text-[10px] ml-2 uppercase tracking-widest">Collapse Menu</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
