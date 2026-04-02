import type {
  AuditRecord,
  AuditRequest,
  CompanyAuditPage,
  CompanyProfile,
  DepositEscrowRequest,
  PlatformStats,
  RegisterCompanyRequest,
} from "@/types";
import {
  applyAuditVerdictToFinance,
  applyCompliantWithdrawToFinance,
} from "@/lib/finance-rules";

export const MOCK_WALLET_ADDRESS = "0xf45432d0C8e651EA4F95815388210e4ED4A1F15B" as const;

type MutableCompany = CompanyProfile & {
  owner: string;
  target_reduction: string;
  latest_verdict: string;
  withdrawable_amount: number;
  owner_deposit: number;
  audit_history: AuditRecord[];
};

type MockState = {
  txNonce: number;
  companies: Record<string, MutableCompany>;
};

const MOCK_STATE_STORAGE_KEY = "genethos_mock_state_v1";

function buildPagedAuditHistory(total: number): AuditRecord[] {
  const rows: AuditRecord[] = [];
  for (let i = 0; i < total; i += 1) {
    const violation = i % 3 === 0;
    rows.push({
      verdict: violation ? "VIOLATION" : "COMPLIANT",
      summary: violation
        ? "Synthetic smoke data: supplier emissions exceeded target baseline."
        : "Synthetic smoke data: independent sources aligned with reduction claims.",
      score_change: violation ? "-30" : "+10",
      slash_amount: violation ? 30 : 0,
    });
  }
  return rows;
}

function createInitialState(): MockState {
  const appleHistory: AuditRecord[] = [
    {
      verdict: "INCONCLUSIVE",
      summary:
        "Insufficient independent evidence from at least two sources to verify Apple's claimed 60% emissions reduction.",
      score_change: "0",
      slash_amount: 0,
    },
    {
      verdict: "VIOLATION",
      summary:
        "Court and NGO evidence contradicted the sustainability claim and indicated unresolved supplier violations.",
      score_change: "-30",
      slash_amount: 30,
    },
  ];

  const pagedHistory = buildPagedAuditHistory(28);

  return {
    txNonce: 1,
    companies: {
      APPLE_INC: {
        company_id: "APPLE_INC",
        target_reduction: "20",
        owner: MOCK_WALLET_ADDRESS,
        ethos_score: 70,
        escrow_balance: 70,
        withdrawable_amount: 0,
        owner_deposit: 70,
        audit_count: appleHistory.length,
        latest_verdict: "VIOLATION",
        audit_history: appleHistory,
      },
      PAGED_INC: {
        company_id: "PAGED_INC",
        target_reduction: "18",
        owner: MOCK_WALLET_ADDRESS,
        ethos_score: 520,
        escrow_balance: 940,
        withdrawable_amount: 80,
        owner_deposit: 1020,
        audit_count: pagedHistory.length,
        latest_verdict: pagedHistory[pagedHistory.length - 1]?.verdict ?? "",
        audit_history: pagedHistory,
      },
    },
  };
}

let state: MockState | null = null;

function loadStateFromStorage(): MockState | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(MOCK_STATE_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as MockState;
    if (!parsed || typeof parsed !== "object" || !parsed.companies) {
      return null;
    }
    for (const company of Object.values(parsed.companies)) {
      if (typeof company.owner_deposit !== "number" || !Number.isFinite(company.owner_deposit)) {
        company.owner_deposit = (company.escrow_balance ?? 0) + (company.withdrawable_amount ?? 0);
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistState(): void {
  if (typeof window === "undefined") {
    return;
  }
  if (!state) {
    return;
  }
  window.localStorage.setItem(MOCK_STATE_STORAGE_KEY, JSON.stringify(state));
}

function getState(): MockState {
  if (!state) {
    state = loadStateFromStorage() ?? createInitialState();
  }
  return state;
}

function nextHash(): `0x${string}` {
  const current = getState();
  current.txNonce += 1;
  persistState();
  return `0x${current.txNonce.toString(16).padStart(64, "0")}` as `0x${string}`;
}

function cloneCompany(company: MutableCompany): CompanyProfile {
  return {
    company_id: company.company_id,
    target_reduction: company.target_reduction,
    owner: company.owner,
    ethos_score: company.ethos_score,
    escrow_balance: company.escrow_balance,
    withdrawable_amount: company.withdrawable_amount,
    audit_count: company.audit_history.length,
    latest_verdict: company.latest_verdict,
    audit_history: company.audit_history.map((row) => ({ ...row })),
  };
}

function getCompanyOrThrow(companyId: string): MutableCompany {
  const company = getState().companies[companyId];
  if (!company) {
    throw new Error("Company not registered");
  }
  return company;
}

function normalizeSignal(url: string | undefined): string {
  return (url ?? "").trim().toLowerCase();
}

function decideVerdict(req: AuditRequest): { verdict: AuditRecord["verdict"]; summary: string } {
  const official = normalizeSignal(req.official_report_url);
  const iot = normalizeSignal(req.iot_sensor_url);
  const ngo = normalizeSignal(req.ngo_watchdog_url);
  const sourceCount = Number(official.length > 0) + Number(iot.length > 0) + Number(ngo.length > 0);

  if (sourceCount < 2) {
    return {
      verdict: "INCONCLUSIVE",
      summary:
        "Insufficient independent evidence from at least two usable sources for a definitive verdict.",
    };
  }

  const combined = `${official} ${iot} ${ngo}`;
  if (combined.includes("minor")) {
    return {
      verdict: "MINOR_VIOLATION",
      summary: "Independent evidence found mild inconsistencies against the stated ESG reduction trajectory.",
    };
  }

  if (combined.includes("violation") || combined.includes("fraud") || combined.includes("greenwash")) {
    return {
      verdict: "VIOLATION",
      summary: "Independent evidence materially contradicted the claimed ESG progress.",
    };
  }

  return {
    verdict: "COMPLIANT",
    summary: "Independent evidence was consistent with the declared ESG progress.",
  };
}

function applyAuditImpact(company: MutableCompany, verdict: string): { scoreChange: string; slashAmount: number } {
  const impact = applyAuditVerdictToFinance(
    {
      escrowBalance: company.escrow_balance,
      ethosScore: company.ethos_score,
      ownerDeposit: company.owner_deposit,
      withdrawableAmount: company.withdrawable_amount,
    },
    verdict as "COMPLIANT" | "MINOR_VIOLATION" | "VIOLATION" | "INCONCLUSIVE"
  );

  company.escrow_balance = impact.next.escrowBalance;
  company.ethos_score = impact.next.ethosScore;
  company.owner_deposit = impact.next.ownerDeposit;
  company.withdrawable_amount = impact.next.withdrawableAmount;
  return { scoreChange: impact.scoreChange, slashAmount: impact.slashAmount };
}

export function isMockDataEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}

export async function mockGetPlatformStats(): Promise<PlatformStats> {
  const companies = Object.values(getState().companies);
  return {
    total_companies: companies.length,
    total_audits: companies.reduce((sum, company) => sum + company.audit_history.length, 0),
  };
}

export async function mockGetCompanyProfile(companyId: string): Promise<CompanyProfile> {
  const company = getCompanyOrThrow(companyId);
  return cloneCompany(company);
}

export async function mockGetCompanyAuditPage(
  companyId: string,
  offset: number,
  limit: number
): Promise<CompanyAuditPage> {
  const company = getCompanyOrThrow(companyId);
  const safeLimit = Math.max(1, limit);
  const start = Math.max(0, offset);
  const end = Math.min(start + safeLimit, company.audit_history.length);
  const hasNext = end < company.audit_history.length;
  return {
    company_id: company.company_id,
    offset: start,
    limit: safeLimit,
    total: company.audit_history.length,
    items: company.audit_history.slice(start, end).map((row) => ({ ...row })),
    has_next: hasNext,
    next_offset: hasNext ? end : null,
  };
}

export async function mockRegisterCompany(
  request: RegisterCompanyRequest,
  callerAddress: string
): Promise<{ status: "ACCEPTED"; hash: `0x${string}` }> {
  const id = request.company_id.trim();
  if (!id) {
    throw new Error("company_id cannot be empty");
  }
  if (getState().companies[id]) {
    throw new Error("Company already registered");
  }

  getState().companies[id] = {
    company_id: id,
    target_reduction: request.target_reduction_percentage.trim(),
    owner: callerAddress,
    ethos_score: 100,
    escrow_balance: 0,
    withdrawable_amount: 0,
    owner_deposit: 0,
    audit_count: 0,
    latest_verdict: "",
    audit_history: [],
  };
  persistState();

  return { status: "ACCEPTED", hash: nextHash() };
}

export async function mockDepositEscrow(
  request: DepositEscrowRequest,
  callerAddress: string
): Promise<{ status: "ACCEPTED"; hash: `0x${string}` }> {
  const company = getCompanyOrThrow(request.company_id.trim());
  if (company.owner.toLowerCase() !== callerAddress.toLowerCase()) {
    throw new Error("Only the company owner can deposit escrow");
  }
  if (request.amount <= BigInt(0)) {
    throw new Error("Amount must be greater than zero");
  }

  const amount = Number(request.amount);
  company.escrow_balance += amount;
  company.owner_deposit += amount;
  persistState();
  return { status: "ACCEPTED", hash: nextHash() };
}

export async function mockRequestAudit(
  request: AuditRequest,
  callerAddress: string
): Promise<{
  status: "ACCEPTED";
  hash: `0x${string}`;
  verdict: string;
  summary: string;
}> {
  const company = getCompanyOrThrow(request.company_id.trim());
  if (company.owner.toLowerCase() !== callerAddress.toLowerCase()) {
    throw new Error("Only the registering wallet can request audits");
  }
  if (company.escrow_balance <= 0) {
    throw new Error("No escrow staked. Deposit GEN tokens first.");
  }

  const verdictResult = decideVerdict(request);
  const impact = applyAuditImpact(company, verdictResult.verdict);

  const record: AuditRecord = {
    verdict: verdictResult.verdict,
    summary: verdictResult.summary,
    score_change: impact.scoreChange,
    slash_amount: impact.slashAmount,
  };

  company.audit_history.push(record);
  company.audit_count = company.audit_history.length;
  company.latest_verdict = record.verdict;
  persistState();

  return {
    status: "ACCEPTED",
    hash: nextHash(),
    verdict: record.verdict,
    summary: record.summary,
  };
}

export async function mockWithdrawCompliantUnlock(
  companyId: string,
  amount: bigint,
  callerAddress: string
): Promise<{ status: "ACCEPTED"; hash: `0x${string}` }> {
  const company = getCompanyOrThrow(companyId.trim());
  if (company.owner.toLowerCase() !== callerAddress.toLowerCase()) {
    throw new Error("Only the company owner can withdraw escrow");
  }

  const nextState = applyCompliantWithdrawToFinance(
    {
      escrowBalance: company.escrow_balance,
      ethosScore: company.ethos_score,
      ownerDeposit: company.owner_deposit,
      withdrawableAmount: company.withdrawable_amount,
    },
    Number(amount)
  );

  company.escrow_balance = nextState.escrowBalance;
  company.ethos_score = nextState.ethosScore;
  company.owner_deposit = nextState.ownerDeposit;
  company.withdrawable_amount = nextState.withdrawableAmount;
  persistState();
  return { status: "ACCEPTED", hash: nextHash() };
}

export function resetMockState(): void {
  state = createInitialState();
  persistState();
}
