"use client";

import { useEffect, useRef, useState } from "react";
import { client } from "@/lib/genlayer/client";
import { useRequestAudit } from "@/hooks/useGenEthos";
import { isAuditFormSubmittable, sanitizeAuditFormInput } from "@/lib/audit-request";
import { PortalCard } from "@/components/ui/portal-card";
import { PortalInput } from "@/components/ui/portal-input";
import { PortalButton } from "@/components/ui/portal-button";
import { Cpu, Sparkle, Database, CircleDashed, X, ArrowUpRight } from "@phosphor-icons/react";

type TxStatus = "PENDING" | "ACCEPTED" | "FINALIZED" | "FAILED" | string;
type TransactionLookupHash = Parameters<typeof client.getTransaction>[0]["hash"];
type TxDetails = { hash: TransactionLookupHash; show: boolean; status: TxStatus };
type AuditOutcome = "SUCCESS" | "INCONCLUSIVE";
type AuditResult = { outcome: AuditOutcome; verdict: string; summary: string };

const TERMINAL_STATUSES = new Set(["ACCEPTED", "FINALIZED", "FAILED"]);

export function AuditForm() {
  const [companyId, setCompanyId] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [iotUrl, setIotUrl] = useState("");
  const [ngoUrl, setNgoUrl] = useState("");
  const [txDetails, setTxDetails] = useState<TxDetails | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const statusRef = useRef<TxStatus>("PENDING");

  const audit = useRequestAudit();

  useEffect(() => {
    if (!txDetails?.hash || !txDetails.show) return;
    if (TERMINAL_STATUSES.has(statusRef.current)) return;

    const intervalId = setInterval(async () => {
      if (TERMINAL_STATUSES.has(statusRef.current)) {
        clearInterval(intervalId);
        return;
      }

      try {
        const tx = await client.getTransaction({ hash: txDetails.hash });
        if (tx?.status) {
          const newStatus = String(tx.status);
          if (statusRef.current !== newStatus) {
            statusRef.current = newStatus;
            setTxDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
          }
        }
      } catch {
        // Ignore transient RPC/network errors while polling.
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [txDetails?.hash, txDetails?.show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !isAuditFormSubmittable({
        companyId,
        officialReportUrl: reportUrl,
        iotSensorUrl: iotUrl,
        ngoWatchdogUrl: ngoUrl,
      })
    ) {
      return;
    }

    const payload = sanitizeAuditFormInput({
      companyId,
      officialReportUrl: reportUrl,
      iotSensorUrl: iotUrl,
      ngoWatchdogUrl: ngoUrl,
    });

    statusRef.current = "PENDING";
    setTxDetails(null);
    setResult(null);
    setErrorMessage(null);

    audit.mutate(
      {
        ...payload,
        onTxHash: (hash) => {
          statusRef.current = "PENDING";
          setTxDetails({
            hash: hash as TransactionLookupHash,
            show: true,
            status: "PENDING",
          });
        },
      },
      {
        onSuccess: (data) => {
          statusRef.current = "ACCEPTED";
          setTxDetails((prev) => (prev ? { ...prev, status: "ACCEPTED" } : null));
          setResult({
            outcome: data.outcome === "INCONCLUSIVE" ? "INCONCLUSIVE" : "SUCCESS",
            verdict: data.verdict || "INCONCLUSIVE",
            summary: data.summary || "No details provided.",
          });
        },
        onError: (error) => {
          statusRef.current = "FAILED";
          setTxDetails((prev) => (prev ? { ...prev, status: "FAILED" } : null));
          setErrorMessage(error instanceof Error ? error.message : "Audit request failed.");
        },
      }
    );
  };

  const isRunning = audit.isPending;

  const getStatusColor = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === "ACCEPTED" || normalized === "FINALIZED") return "bg-green-500";
    if (normalized === "FAILED" || normalized.includes("ERROR") || normalized === "REVERTED") {
      return "bg-red-500";
    }
    return "bg-amber-500 animate-pulse";
  };

  return (
    <>
      <div className="relative mx-auto max-w-4xl space-y-10 py-4 animate-in slide-in-from-bottom-8 duration-700">
        <div className="relative flex flex-col gap-1 pl-6">
          <div className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-cyan-500 dark:bg-cyan-400 dark:shadow-[0_0_10px_#22d3ee]" />
          <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-gray-900 dark:text-white">
            AI Audit Engine
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            LLM-Driven Compliance Verification
          </p>
        </div>

        <PortalCard
          className="border-t-4 border-t-cyan-500 p-10 shadow-lg dark:border-t-cyan-400"
          accent={false}
        >
          <div className="mb-10 flex items-center gap-4 border-b border-gray-50 pb-4 dark:border-white/5">
            <div className="rounded-2xl bg-cyan-50 p-2.5 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
              <Database size={24} weight="bold" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-500">
              Execution Parameters
            </h3>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit} data-testid="audit-form">
            <PortalInput
              label="Target Entity (ID)"
              placeholder="e.g. ACME_ENERGY"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              disabled={isRunning}
              data-testid="audit-company-id"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <PortalInput
                label="ESG Report URL"
                placeholder="https://..."
                value={reportUrl}
                onChange={(e) => setReportUrl(e.target.value)}
                disabled={isRunning}
                data-testid="audit-official-url"
              />
              <PortalInput
                label="IoT Sensor URL (Optional)"
                placeholder="https://..."
                value={iotUrl}
                onChange={(e) => setIotUrl(e.target.value)}
                disabled={isRunning}
                data-testid="audit-iot-url"
              />
              <PortalInput
                label="NGO Watchdog URL (Optional)"
                placeholder="https://..."
                value={ngoUrl}
                onChange={(e) => setNgoUrl(e.target.value)}
                disabled={isRunning}
                data-testid="audit-ngo-url"
              />
            </div>

            <div className="mt-8 flex gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
              <Cpu className="shrink-0 text-gray-500 dark:text-gray-400" size={24} />
              <div>
                <div className="mb-1 text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">
                  Equivalence Principle
                </div>
                <div className="text-xs font-medium text-gray-500">
                  Consensus validated by GenLayer Intelligent Validators
                </div>
              </div>
            </div>

            <PortalButton
              variant="primary"
              disabled={
                isRunning ||
                !isAuditFormSubmittable({
                  companyId,
                  officialReportUrl: reportUrl,
                  iotSensorUrl: iotUrl,
                  ngoWatchdogUrl: ngoUrl,
                })
              }
              className="mt-4 h-14 w-full gap-3 bg-cyan-500 text-[11px] font-black uppercase text-white shadow-cyan-500/20 hover:bg-cyan-600 dark:bg-cyan-400 dark:text-black dark:hover:bg-cyan-500"
              data-testid="audit-submit"
            >
              {isRunning ? (
                <>
                  <CircleDashed className="animate-spin" size={20} /> Requesting Consensus...
                </>
              ) : (
                <>
                  <Sparkle weight="fill" size={20} /> Execute AI Audit
                </>
              )}
            </PortalButton>
          </form>

          {result && (
            <div
              className={`mt-8 rounded-2xl border p-5 ${
                result.outcome === "INCONCLUSIVE"
                  ? "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/20"
                  : "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/20"
              }`}
              data-testid="audit-result-card"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-200">
                Audit Result: {result.verdict}
              </div>
              <p className="mt-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                {result.summary}
              </p>
              {result.outcome === "INCONCLUSIVE" && (
                <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Provide at least two reliable source URLs to improve confidence.
                </p>
              )}
            </div>
          )}

          {errorMessage && (
            <div
              className="mt-8 rounded-2xl border border-red-400 bg-red-50 p-5 dark:border-red-500 dark:bg-red-950/20"
              data-testid="audit-error-card"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700 dark:text-red-300">
                Audit Error
              </div>
              <p className="mt-2 text-sm font-bold text-red-700 dark:text-red-200">{errorMessage}</p>
            </div>
          )}
        </PortalCard>
      </div>

      {txDetails?.show && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[380px] flex-col gap-4">
          <div className="relative flex flex-col gap-3 border-2 border-black bg-white p-5 shadow-[8px_8px_0_0_#06b6d4] dark:border-white dark:bg-[#111]">
            <button
              onClick={() => setTxDetails((prev) => (prev ? { ...prev, show: false } : null))}
              className="absolute right-3 top-3 bg-gray-100 p-1 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20"
            >
              <X size={16} weight="bold" className="text-gray-900 dark:text-white" />
            </button>

            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(txDetails.status)}`} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                STATUS: {txDetails.status.toUpperCase()}
              </p>
            </div>

            <a
              href={`https://explorer-bradbury.genlayer.com/tx/${txDetails.hash}`}
              target="_blank"
              rel="noreferrer"
              className="group mt-1 flex items-center justify-between"
            >
              <div className="text-[13px] font-bold text-gray-900 transition-colors group-hover:text-cyan-500 dark:text-white dark:group-hover:text-cyan-400">
                View 5 Validators Process
              </div>
              <ArrowUpRight size={18} weight="bold" className="text-cyan-500" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
