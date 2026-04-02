import type { AuditRecord, CompanyAuditPage, CompanyProfile, ContractErrorResponse } from "@/types";

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new Error("Contract returned an invalid object.");
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toSafeNumber(value: number | bigint | string): number {
  if (typeof value === "number") {
    if (Number.isFinite(value)) {
      return value;
    }
    throw new Error("Contract returned a non-finite numeric value.");
  }

  if (typeof value === "bigint") {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed)) {
      return parsed;
    }
    throw new Error("Contract returned an unsafe bigint value.");
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Contract returned an empty numeric string.");
  }

  if (!/^-?\d+$/.test(trimmed)) {
    throw new Error("Contract returned a non-integer numeric string.");
  }

  const parsed = Number(trimmed);
  if (Number.isSafeInteger(parsed)) {
    return parsed;
  }

  throw new Error("Contract returned an unsafe numeric string.");
}

function asNumber(value: unknown, fallback = 0): number {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "number" || typeof value === "bigint" || typeof value === "string") {
    return toSafeNumber(value);
  }

  return fallback;
}

function normalizeAuditRecord(value: unknown): AuditRecord {
  const row = asObject(value);
  return {
    verdict: asString(row.verdict, "INCONCLUSIVE"),
    summary: asString(row.summary, "No details provided."),
    score_change: asString(row.score_change, "0"),
    slash_amount: asNumber(row.slash_amount, 0),
  };
}

export function isContractErrorResponse(value: unknown): value is ContractErrorResponse {
  if (typeof value !== "object" || value === null) return false;
  if (!("error" in value)) return false;
  return typeof (value as { error?: unknown }).error === "string";
}

export function parseCompanyProfileResponse(value: unknown): CompanyProfile {
  if (isContractErrorResponse(value)) {
    throw new Error(value.error);
  }

  const obj = asObject(value);
  const auditHistoryRaw = Array.isArray(obj.audit_history)
    ? obj.audit_history
    : Array.isArray(obj.audits)
      ? obj.audits
      : [];

  const auditHistory = auditHistoryRaw.map((row) => normalizeAuditRecord(row));

  return {
    company_id: asString(obj.company_id),
    target_reduction: asString(obj.target_reduction, asString(obj.target_reduction_percentage)),
    target_reduction_percentage: asString(
      obj.target_reduction_percentage,
      asString(obj.target_reduction)
    ),
    owner: asString(obj.owner),
    ethos_score: asNumber(obj.ethos_score, 100),
    escrow_balance: asNumber(obj.escrow_balance, 0),
    withdrawable_amount: asNumber(obj.withdrawable_amount, 0),
    audit_count: asNumber(obj.audit_count, auditHistory.length),
    latest_verdict: asString(obj.latest_verdict),
    audit_history: auditHistory,
    audits: auditHistory,
  };
}

export function parseCompanyAuditPageResponse(value: unknown): CompanyAuditPage {
  if (isContractErrorResponse(value)) {
    throw new Error(value.error);
  }

  const obj = asObject(value);
  const itemsRaw = Array.isArray(obj.items) ? obj.items : [];
  const items = itemsRaw.map((row) => normalizeAuditRecord(row));
  const offset = asNumber(obj.offset, 0);
  const total = asNumber(obj.total, items.length);
  const parsedHasNext =
    typeof obj.has_next === "boolean" ? obj.has_next : offset + items.length < total;
  const nextOffset = parsedHasNext
    ? asNumber(obj.next_offset, offset + items.length)
    : null;

  return {
    company_id: asString(obj.company_id),
    offset,
    limit: asNumber(obj.limit, 0),
    total,
    items,
    has_next: parsedHasNext,
    next_offset: nextOffset,
  };
}

export function getLatestVerdict(profile: CompanyProfile): string {
  if (profile.latest_verdict && profile.latest_verdict.trim().length > 0) {
    return profile.latest_verdict;
  }
  if (profile.audit_history.length === 0) {
    return "";
  }
  return profile.audit_history[profile.audit_history.length - 1]?.verdict ?? "";
}

export function getLatestAudit(profile: CompanyProfile): AuditRecord | null {
  if (profile.audit_history.length === 0) {
    return null;
  }
  return profile.audit_history[profile.audit_history.length - 1] ?? null;
}

export function buildAuditPageFromProfile(
  profile: CompanyProfile,
  offset: number,
  limit: number
): CompanyAuditPage {
  if (profile.audit_count > profile.audit_history.length) {
    throw new Error("Paged audit history is unavailable for this contract deployment.");
  }

  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.max(1, limit);
  const total = profile.audit_history.length;
  const end = Math.min(safeOffset + safeLimit, total);

  return {
    company_id: profile.company_id,
    offset: safeOffset,
    limit: safeLimit,
    total,
    items: profile.audit_history.slice(safeOffset, end),
    has_next: end < total,
    next_offset: end < total ? end : null,
  };
}
