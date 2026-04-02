import type { AuditRequest } from "@/types";
import { getLatestAudit, getLatestVerdict, parseCompanyProfileResponse } from "./company-profile";
import { getReceiptStatusName } from "./genlayer/transaction-status";

export type AuditFlowOutcome = "SUCCESS" | "INCONCLUSIVE";

export type AuditFlowResult = {
  txHash: string;
  receiptStatus: string;
  verdict: string;
  summary: string;
  outcome: AuditFlowOutcome;
};

type ExecuteAuditRequestFlowParams = {
  request: AuditRequest;
  writeAuditTx: (args: [string, string, string, string]) => Promise<string>;
  waitForReceipt: (txHash: string) => Promise<{ status?: unknown }>;
  readCompanyProfile?: () => Promise<unknown>;
  onTxHash?: (hash: string) => void;
};

export function toRequestAuditArgs(request: AuditRequest): [string, string, string, string] {
  return [
    request.company_id.trim(),
    request.official_report_url.trim(),
    request.iot_sensor_url?.trim() ?? "",
    request.ngo_watchdog_url?.trim() ?? "",
  ];
}

export async function executeAuditRequestFlow(
  params: ExecuteAuditRequestFlowParams
): Promise<AuditFlowResult> {
  const txHash = await params.writeAuditTx(toRequestAuditArgs(params.request));
  params.onTxHash?.(txHash);

  const receipt = await params.waitForReceipt(txHash);
  const receiptStatus = getReceiptStatusName(receipt);

  if (receiptStatus !== "ACCEPTED" && receiptStatus !== "FINALIZED") {
    throw new Error(`Audit failed: transaction status is ${receiptStatus}`);
  }

  let verdict = "";
  let summary = "";
  if (params.readCompanyProfile) {
    const profileResponse = await params.readCompanyProfile();
    const profile = parseCompanyProfileResponse(profileResponse);
    verdict = getLatestVerdict(profile);
    summary = getLatestAudit(profile)?.summary ?? "";
  }

  return {
    txHash,
    receiptStatus,
    verdict,
    summary,
    outcome: verdict === "INCONCLUSIVE" ? "INCONCLUSIVE" : "SUCCESS",
  };
}
