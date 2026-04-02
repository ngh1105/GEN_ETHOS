/* GEN-ETHOS contract response types */

export interface AuditRecord {
  verdict: string;
  summary: string;
  score_change: string; // contract returns as string e.g. "-10", "+10"
  slash_amount?: number;
}

export interface CompanyProfile {
  company_id: string;
  // contract returns "target_reduction" (not target_reduction_percentage)
  target_reduction: string;
  target_reduction_percentage?: string; // backwards compat alias
  owner?: `0x${string}` | string;
  ethos_score: number;
  escrow_balance: number;
  withdrawable_amount?: number;
  audit_count: number;
  latest_verdict?: string;
  // contract returns "audit_history" (not audits)
  audit_history: AuditRecord[];
  audits?: AuditRecord[]; // backwards compat alias
}

export interface ContractErrorResponse {
  error: string;
}

export interface PlatformStats {
  total_companies: number;
  total_audits: number;
}

export interface CompanyAuditPage {
  company_id: string;
  offset: number;
  limit: number;
  total: number;
  items: AuditRecord[];
  has_next: boolean;
  next_offset: number | null;
}

export type AuditVerdict = "COMPLIANT" | "MINOR_VIOLATION" | "VIOLATION" | "INCONCLUSIVE";

export type AuditStage =
  | "idle"
  | "broadcasting"
  | "rendering"
  | "reasoning"
  | "consensus"
  | "finalizing"
  | "complete"
  | "error";

export interface AuditRequest {
  company_id: string;
  official_report_url: string;
  iot_sensor_url?: string;
  ngo_watchdog_url?: string;
}

export interface RegisterCompanyRequest {
  company_id: string;
  target_reduction_percentage: string;
}

export interface DepositEscrowRequest {
  company_id: string;
  amount: bigint;
}
