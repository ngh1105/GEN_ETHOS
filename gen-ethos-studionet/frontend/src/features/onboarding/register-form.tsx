"use client";

import { useState } from "react";
import { useRegisterCompany } from "@/hooks/useGenEthos";
import { PortalCard } from "@/components/ui/portal-card";
import { PortalInput } from "@/components/ui/portal-input";
import { PortalButton } from "@/components/ui/portal-button";
import { UserPlus, CircleDashed } from "@phosphor-icons/react";
import { toast } from "sonner";

export function RegisterForm() {
  const [companyId, setCompanyId] = useState("");
  const [target, setTarget] = useState("");
  const mutation = useRegisterCompany();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId.trim() || !target.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    mutation.mutate(
      { company_id: companyId.trim(), target_reduction_percentage: target.trim() },
      {
        onSuccess: () => {
          toast.success(`Company "${companyId}" registered successfully!`);
          setCompanyId("");
          setTarget("");
        },
        onError: (err) => {
          toast.error(`Registration failed: ${err.message}`);
        },
      }
    );
  };

  return (
    <PortalCard className="p-10" accent={false}>
      <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-black">
        <div className="p-2 bg-[#CCFF00] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <UserPlus size={24} weight="bold" />
        </div>
        <h3 className="font-black uppercase text-xs tracking-[0.2em] text-black">Corporate Registry</h3>
      </div>
      <form className="space-y-8" onSubmit={handleSubmit} data-testid="register-form">
        <PortalInput 
          label="Company Identifier" 
          placeholder="e.g. ACME_ENERGY" 
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          disabled={mutation.isPending}
          data-testid="register-company-id"
        />
        <PortalInput 
          label="Target Reduction (%)" 
          placeholder="15.0" 
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={mutation.isPending}
          data-testid="register-target"
        />
        <PortalButton 
          variant="primary" 
          disabled={mutation.isPending || !companyId || !target}
          className="w-full h-14 uppercase font-black text-[11px] gap-3"
          data-testid="register-submit"
        >
          {mutation.isPending ? (
            <><CircleDashed className="animate-spin" size={18} /> Registering...</>
          ) : "Initialize Entity"}
        </PortalButton>
      </form>
    </PortalCard>
  );
}
