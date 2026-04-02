"use client";

import { RegisterForm } from "@/features/onboarding/register-form";
import { DepositForm } from "@/features/onboarding/deposit-form";
import { Info } from "@phosphor-icons/react";

export default function OnboardingPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 animate-in fade-in zoom-in-95 duration-500 space-y-12">
      
      {/* Brutalist Header */}
      <div className="flex flex-col gap-2 relative pl-6 border-l-4 border-black">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-black">
          Onboarding
        </h1>
        <p className="text-black font-mono text-xs uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-[#CCFF00] border border-black inline-block" />
          Establish Corporate Ethical Reputation
        </p>
      </div>
      
      {/* Forms Grid - No rounding, sharp borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <RegisterForm />
        <DepositForm />
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-black -translate-x-1/2 z-[-1]" />
      </div>

      {/* Info Directive - Brutalist Warning Box */}
      <div className="p-8 flex flex-col md:flex-row gap-6 items-start bg-yellow-400 text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex-shrink-0 mt-1">
          <Info size={32} weight="bold" className="text-black" />
        </div>
        <div>
          <h4 className="font-black uppercase tracking-widest text-sm mb-2">Immutable Directive</h4>
          <p className="text-sm font-medium leading-relaxed">
            By onboarding, the entity authorizes decentralized AI to audit all public filings. 
            Slashing conditions are cryptographically enforced and cannot be reversed by any central authority.
          </p>
        </div>
      </div>
    </div>
  );
}
