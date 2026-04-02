"use client";

import { useState } from "react";
import { useDepositEscrow } from "@/hooks/useGenEthos";
import { PortalCard } from "@/components/ui/portal-card";
import { PortalInput } from "@/components/ui/portal-input";
import { PortalButton } from "@/components/ui/portal-button";
import { Coins, CircleDashed } from "@phosphor-icons/react";
import { toast } from "sonner";

export function DepositForm() {
  const [companyId, setCompanyId] = useState("");
  const [amount, setAmount] = useState("");
  const mutation = useDepositEscrow();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId.trim() || !amount.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const normalized = amount.trim();
    if (!/^\d+$/.test(normalized)) {
      toast.error("Amount must be a whole number.");
      return;
    }
    const parsedAmount = BigInt(normalized);
    if (parsedAmount <= BigInt(0)) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    mutation.mutate(
      { company_id: companyId.trim(), amount: parsedAmount },
      {
        onSuccess: () => {
          toast.success(`Deposited ${parsedAmount.toString()} to "${companyId}" escrow!`);
          setCompanyId("");
          setAmount("");
        },
        onError: (err) => {
          toast.error(`Deposit failed: ${err.message}`);
        },
      }
    );
  };

  return (
    <PortalCard className="p-10 border-dashed border-2 bg-white border-black" accent={false}>
      <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-black">
        <div className="p-2 bg-black text-[#CCFF00] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Coins size={24} weight="bold" />
        </div>
        <h3 className="font-black uppercase text-xs tracking-[0.2em] text-black">GEN Escrow Stake</h3>
      </div>
      <form className="space-y-8" onSubmit={handleSubmit} data-testid="deposit-form">
        <PortalInput
          label="Registered Entity"
          placeholder="e.g. ACME_ENERGY"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          disabled={mutation.isPending}
          data-testid="deposit-company-id"
        />
        <PortalInput
          label="Stake Amount (GEN)"
          placeholder="5000"
          value={amount}
          inputMode="numeric"
          pattern="[0-9]*"
          onChange={(e) => setAmount(e.target.value)}
          disabled={mutation.isPending}
          data-testid="deposit-amount"
        />
        <PortalButton
          variant="secondary"
          disabled={mutation.isPending || !companyId || !amount}
          className="w-full h-14 uppercase font-black text-[11px] gap-3"
          data-testid="deposit-submit"
        >
          {mutation.isPending ? (
            <><CircleDashed className="animate-spin" size={18} /> Depositing...</>
          ) : "Stake GEN & Lock"}
        </PortalButton>
      </form>
    </PortalCard>
  );
}
