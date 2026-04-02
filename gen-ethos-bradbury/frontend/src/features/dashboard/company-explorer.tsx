"use client";

import React, { useMemo, useState } from "react";
import { useCompanyAuditHistory, useCompanyProfile } from "@/hooks/useGenEthos";
import { PortalCard } from "@/components/ui/portal-card";
import { PortalInput } from "@/components/ui/portal-input";
import { PortalButton } from "@/components/ui/portal-button";
import {
  MagnifyingGlass,
  Buildings,
  ShieldCheck,
  ShieldWarning,
  WarningCircle,
  Scales,
  ClipboardText,
  CircleDashed,
  ArrowRight,
} from "@phosphor-icons/react";
import type { AuditRecord, AuditVerdict, CompanyProfile } from "@/types";
import { cn } from "@/lib/utils";

type ExplorerAuditRow = AuditRecord & {
  timestamp?: number | string;
};

type VerdictConfig = {
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
};

const verdictConfig: Record<string, VerdictConfig> = {
  COMPLIANT: {
    label: "COMPLIANT",
    color: "text-black dark:text-black",
    bg: "bg-[#CCFF00] border-2 border-black",
    icon: ShieldCheck,
  },
  MINOR_VIOLATION: {
    label: "MINOR VIOLATION",
    color: "text-black dark:text-black",
    bg: "bg-amber-400 border-2 border-black",
    icon: WarningCircle,
  },
  VIOLATION: {
    label: "VIOLATION",
    color: "text-white dark:text-white",
    bg: "bg-red-500 border-2 border-black",
    icon: ShieldWarning,
  },
  INCONCLUSIVE: {
    label: "INCONCLUSIVE",
    color: "text-black dark:text-white",
    bg: "bg-white border-2 border-black dark:bg-[#111] dark:border-white",
    icon: CircleDashed,
  },
};

function normalizeAuditRows(profile: CompanyProfile, sourceRows: AuditRecord[] | null): ExplorerAuditRow[] {
  const rawRows = sourceRows ?? profile.audit_history ?? profile.audits ?? [];
  return rawRows.map((row) => {
    const withTimestamp = row as AuditRecord & { timestamp?: number | string };
    return {
      verdict: String(withTimestamp.verdict ?? "INCONCLUSIVE"),
      summary:
        typeof withTimestamp.summary === "string"
          ? withTimestamp.summary
          : "No details provided.",
      score_change:
        typeof withTimestamp.score_change === "string" ? withTimestamp.score_change : "0",
      slash_amount:
        typeof withTimestamp.slash_amount === "number" && Number.isFinite(withTimestamp.slash_amount)
          ? withTimestamp.slash_amount
          : 0,
      timestamp: withTimestamp.timestamp,
    };
  });
}

export function CompanyExplorer() {
  const [searchId, setSearchId] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: profile, isLoading, error } = useCompanyProfile(activeId);
  const {
    data: auditHistoryPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCompanyAuditHistory(activeId);

  const pagedAuditRows = useMemo(
    () => (auditHistoryPages ? auditHistoryPages.pages.flatMap((page) => page.items) : null),
    [auditHistoryPages]
  );
  const auditRows = useMemo(
    () => (profile ? normalizeAuditRows(profile, pagedAuditRows) : []),
    [profile, pagedAuditRows]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setActiveId(searchId.trim());
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-4 animate-in slide-in-from-bottom-8 duration-700">
      <div className="relative flex flex-col gap-1 border-l-4 border-black pl-6 dark:border-white">
        <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-black dark:text-white">
          Global Ledger
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-[#CCFF00]">
          Decentralized Transparency Network
        </p>
      </div>

      <PortalCard className="p-6" accent={false}>
        <form onSubmit={handleSearch} className="flex flex-col items-end gap-4 md:flex-row">
          <div className="relative w-full flex-1">
            <PortalInput
              label="Company ID"
              placeholder="e.g. ACME_ENERGY"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-5"
              data-testid="explorer-company-id"
            />
          </div>
          <PortalButton
            type="submit"
            disabled={!searchId.trim()}
            variant="primary"
            className="h-[54px] w-full px-8 md:w-auto"
            data-testid="explorer-lookup"
          >
            <MagnifyingGlass weight="bold" size={20} /> Lookup Entity
          </PortalButton>
        </form>
      </PortalCard>

      {isLoading && (
        <PortalCard className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-4 text-black dark:text-white">
            <CircleDashed size={32} className="animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Scanning GenLayer Ledger...
            </span>
          </div>
        </PortalCard>
      )}

      {error && activeId && (
        <PortalCard className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <WarningCircle size={48} className="text-red-500" weight="bold" />
          <div>
            <p className="text-lg font-black uppercase tracking-tight text-red-500">Entity Not Found</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              No cryptographically secured data exists for &quot;{activeId}&quot;
            </p>
          </div>
        </PortalCard>
      )}

      {profile && !isLoading && !error && (
        <div
          className="space-y-6 animate-in fade-in zoom-in-95 duration-500"
          data-testid="explorer-profile"
        >
          <PortalCard className="p-0">
            <div className="flex flex-col items-center gap-6 border-b-2 border-black p-8 dark:border-white sm:flex-row">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-black bg-[#CCFF00] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:shadow-[2px_2px_0px_0px_#CCFF00]">
                <Buildings size={32} weight="bold" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-black dark:text-white">
                  {profile.company_id}
                </h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-black dark:text-[#CCFF00]">
                  Target: {profile.target_reduction ?? profile.target_reduction_percentage ?? "-"}%
                  reduction commitment
                </p>
              </div>
              {profile.latest_verdict && (
                <div className="mt-4 shrink-0 sm:mt-0">
                  <VerdictBadge
                    verdict={profile.latest_verdict as AuditVerdict}
                    testId="explorer-latest-verdict"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 divide-y-2 divide-black bg-white dark:divide-white dark:bg-[#050505] sm:grid-cols-4 sm:divide-x-2 sm:divide-y-0">
              <StatCell label="ETHOS SCORE" value={profile.ethos_score ?? "-"} icon={Scales} highlight />
              <StatCell
                label="ESCROW BALANCE"
                value={
                  profile.escrow_balance !== undefined ? `${profile.escrow_balance} GEN` : "-"
                }
                icon={ShieldCheck}
                valueTestId="explorer-escrow-balance"
              />
              <StatCell
                label="UNLOCKED"
                value={
                  profile.withdrawable_amount !== undefined
                    ? `${profile.withdrawable_amount} GEN`
                    : "-"
                }
                icon={ShieldCheck}
              />
              <StatCell
                label="TOTAL AUDITS"
                value={profile.audit_count ?? "-"}
                icon={ClipboardText}
                valueTestId="explorer-total-audits"
              />
            </div>
          </PortalCard>

          {auditRows.length > 0 && (
            <PortalCard className="p-1" accent={false}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-black bg-black text-[10px] font-black uppercase tracking-[0.2em] text-[#CCFF00] dark:border-white dark:bg-[#CCFF00] dark:text-black">
                      <th className="p-6">Audit #</th>
                      <th className="p-6">Entity</th>
                      <th className="p-6">Score Delta</th>
                      <th className="p-6">Slash</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black text-sm font-bold dark:divide-white">
                    {auditRows.map((audit, i) => (
                      <AuditRow
                        key={`${profile.company_id}-${i}`}
                        audit={audit}
                        companyId={profile.company_id}
                        index={auditRows.length - i}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </PortalCard>
          )}

          {hasNextPage && (
            <div className="flex justify-center">
              <PortalButton
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                data-testid="explorer-load-more"
              >
                {isFetchingNextPage ? "Loading..." : "Load More Audits"}
              </PortalButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const AuditRow = React.memo(function AuditRow({
  audit,
  companyId,
  index,
}: {
  audit: ExplorerAuditRow;
  companyId: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const scoreChange = audit.score_change || "0";
  const isPositive = scoreChange.startsWith("+");
  const isNegative = scoreChange.startsWith("-");
  const slashAmount =
    typeof audit.slash_amount === "number" && Number.isFinite(audit.slash_amount)
      ? audit.slash_amount
      : 0;
  const scoreColor = isPositive
    ? "text-green-500 dark:text-[#CCFF00] font-black"
    : isNegative
      ? "text-red-500 font-black"
      : "text-black dark:text-white font-bold";

  const timestamp =
    typeof audit.timestamp === "string" ? Number(audit.timestamp) : audit.timestamp;
  const hasTimestamp = typeof timestamp === "number" && Number.isFinite(timestamp);

  const dateStr = hasTimestamp
    ? new Date(timestamp * 1000).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : `Audit #${index}`;

  const summary =
    audit.summary && audit.summary !== "No details provided." ? audit.summary : null;
  const verdict = audit.verdict || "INCONCLUSIVE";

  return (
    <>
      <tr
        className="group cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#111]"
        onClick={() => summary && setExpanded((v) => !v)}
      >
        <td className="whitespace-nowrap p-6 font-bold text-black dark:text-white">{dateStr}</td>
        <td className="whitespace-nowrap p-6 font-mono text-[11px] tracking-wider text-black dark:text-white">
          {companyId} <span className="ml-1 opacity-50">#{index}</span>
        </td>
        <td className="whitespace-nowrap p-6">
          <span className={scoreColor}>{scoreChange !== "0" ? scoreChange : "-"}</span>
        </td>
        <td className="whitespace-nowrap p-6 text-black dark:text-white">
          {slashAmount > 0 ? `${slashAmount} GEN` : "-"}
        </td>
        <td className="whitespace-nowrap p-6">
          <VerdictBadge verdict={verdict} />
        </td>
        <td className="whitespace-nowrap p-6 text-right">
          {summary ? (
            <button
              className={cn(
                "rounded-none border-2 border-black bg-white p-2 text-black transition-all duration-200 dark:border-white dark:bg-black dark:text-white",
                expanded
                  ? "rotate-90 border-black bg-[#CCFF00] text-black dark:bg-[#CCFF00] dark:text-black"
                  : "hover:bg-black hover:text-[#CCFF00] dark:hover:bg-white dark:hover:text-black"
              )}
              title={expanded ? "Collapse" : "View AI summary"}
            >
              <ArrowRight
                size={18}
                weight="bold"
                className={cn("transition-transform duration-200", expanded && "rotate-90")}
              />
            </button>
          ) : (
            <span className="cursor-default p-2 opacity-20">
              <ArrowRight size={18} weight="bold" />
            </span>
          )}
        </td>
      </tr>
      {expanded && summary && (
        <tr className="animate-in slide-in-from-top-1 border-2 border-black bg-white shadow-inner duration-200 dark:border-white dark:bg-black">
          <td colSpan={6} className="border-t-2 border-black px-8 py-5 dark:border-white">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 border-black bg-[#CCFF00] dark:border-white">
                <ShieldCheck className="h-3.5 w-3.5 text-black" weight="bold" />
              </div>
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white">
                  AI Auditor Justification
                </p>
                <p className="border-l-4 border-black pl-4 text-sm font-bold italic leading-relaxed text-black dark:border-[#CCFF00] dark:text-white">
                  &quot;{summary}&quot;
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

const VerdictBadge = React.memo(function VerdictBadge({
  verdict,
  testId,
}: {
  verdict: string;
  testId?: string;
}) {
  const config = verdictConfig[verdict];
  if (!config) {
    return (
      <div
        className="inline-flex items-center justify-center gap-1.5 rounded-none border-2 border-black bg-gray-100 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-[#111] dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
        data-testid={testId}
      >
        {verdict || "-"}
      </div>
    );
  }

  const Icon = config.icon as React.ComponentType<{ className?: string; weight?: "bold" }>;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-none border-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#CCFF00]",
        config.bg,
        config.color
      )}
      data-testid={testId}
    >
      <Icon className="h-3.5 w-3.5" weight="bold" />
      {config.label}
    </div>
  );
});

const StatCell = React.memo(function StatCell({
  label,
  value,
  icon: Icon,
  highlight,
  valueTestId,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{
    className?: string;
    weight?: "bold" | "duotone" | "fill" | "regular" | "light" | "thin";
  }>;
  highlight?: boolean;
  valueTestId?: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-8 text-center">
      <Icon
        className={cn("mb-3 h-6 w-6", highlight ? "text-black dark:text-[#CCFF00]" : "text-black dark:text-white")}
        weight="bold"
      />
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-black dark:text-white">
        {label}
      </p>
      <p
        className={cn(
          "text-3xl font-black italic tracking-tighter",
          highlight ? "text-[#CCFF00] dark:text-[#CCFF00]" : "text-black dark:text-white"
        )}
        data-testid={valueTestId}
      >
        {value}
      </p>
    </div>
  );
});
