import { describe, expect, it } from "vitest";
import {
  buildAuditPageFromProfile,
  getLatestVerdict,
  parseCompanyAuditPageResponse,
  parseCompanyProfileResponse,
} from "./company-profile";

describe("company profile parser", () => {
  it("parses valid contract payload", () => {
    const profile = parseCompanyProfileResponse({
      company_id: "APPLE_INC",
      target_reduction: "20",
      owner: "0xf45432d0C8e651EA4F95815388210e4ED4A1F15B",
      ethos_score: 70,
      escrow_balance: 70,
      withdrawable_amount: 0,
      audit_count: 2,
      latest_verdict: "VIOLATION",
      audit_history: [
        { verdict: "INCONCLUSIVE", summary: "not enough data", score_change: "0" },
        { verdict: "VIOLATION", summary: "independent evidence mismatch", score_change: "-30" },
      ],
    });

    expect(profile.company_id).toBe("APPLE_INC");
    expect(profile.audit_history).toHaveLength(2);
    expect(profile.audit_history[1]?.verdict).toBe("VIOLATION");
  });

  it("parses safe bigint and numeric string fields from contract payloads", () => {
    const profile = parseCompanyProfileResponse({
      company_id: "APPLE_INC",
      target_reduction: "20",
      ethos_score: BigInt(70),
      escrow_balance: "150",
      withdrawable_amount: "10",
      audit_count: BigInt(2),
      latest_verdict: "VIOLATION",
      audit_history: [
        {
          verdict: "VIOLATION",
          summary: "independent evidence mismatch",
          score_change: "-30",
          slash_amount: "30",
        },
      ],
    });

    expect(profile.ethos_score).toBe(70);
    expect(profile.escrow_balance).toBe(150);
    expect(profile.withdrawable_amount).toBe(10);
    expect(profile.audit_count).toBe(2);
    expect(profile.audit_history[0]?.slash_amount).toBe(30);
  });

  it("throws on unsafe numeric strings from contract payloads", () => {
    expect(() =>
      parseCompanyProfileResponse({
        company_id: "APPLE_INC",
        target_reduction: "20",
        ethos_score: "9007199254740992",
        escrow_balance: 70,
        audit_count: 0,
        audit_history: [],
      })
    ).toThrow("unsafe numeric string");
  });

  it("throws contract error response", () => {
    expect(() =>
      parseCompanyProfileResponse({
        error: "Company not registered",
      })
    ).toThrow("Company not registered");
  });

  it("derives latest verdict from history when latest_verdict is empty", () => {
    const profile = parseCompanyProfileResponse({
      company_id: "TEST",
      target_reduction: "10",
      ethos_score: 90,
      escrow_balance: 100,
      audit_count: 1,
      latest_verdict: "",
      audit_history: [{ verdict: "INCONCLUSIVE", summary: "waiting data", score_change: "0" }],
    });

    expect(getLatestVerdict(profile)).toBe("INCONCLUSIVE");
  });

  it("parses paginated audit response with has_next/next_offset", () => {
    const page = parseCompanyAuditPageResponse({
      company_id: "APPLE_INC",
      offset: 0,
      limit: 20,
      total: 28,
      has_next: true,
      next_offset: 20,
      items: [{ verdict: "INCONCLUSIVE", summary: "detail", score_change: "0" }],
    });
    expect(page.has_next).toBe(true);
    expect(page.next_offset).toBe(20);
  });

  it("builds fallback audit page from legacy profile payload", () => {
    const profile = parseCompanyProfileResponse({
      company_id: "LEGACY",
      target_reduction: "10",
      ethos_score: 100,
      escrow_balance: 10,
      audit_count: 3,
      audit_history: [
        { verdict: "COMPLIANT", summary: "a", score_change: "+10" },
        { verdict: "VIOLATION", summary: "b", score_change: "-30" },
        { verdict: "INCONCLUSIVE", summary: "c", score_change: "0" },
      ],
    });
    const page = buildAuditPageFromProfile(profile, 0, 2);
    expect(page.items).toHaveLength(2);
    expect(page.has_next).toBe(true);
    expect(page.next_offset).toBe(2);
  });

  it("throws when fallback audit page would truncate history", () => {
    const profile = parseCompanyProfileResponse({
      company_id: "LEGACY",
      target_reduction: "10",
      ethos_score: 100,
      escrow_balance: 10,
      audit_count: 3,
      audit_history: [{ verdict: "INCONCLUSIVE", summary: "latest only", score_change: "0" }],
    });

    expect(() => buildAuditPageFromProfile(profile, 0, 20)).toThrow(
      "Paged audit history is unavailable"
    );
  });
});
