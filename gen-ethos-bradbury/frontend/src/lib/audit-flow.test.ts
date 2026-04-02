import { describe, expect, it, vi } from "vitest";
import { executeAuditRequestFlow } from "./audit-flow";

const baseRequest = {
  company_id: "APPLE_INC",
  official_report_url: "https://www.apple.com/environment/",
  iot_sensor_url: "https://example.com/iot",
  ngo_watchdog_url: "https://example.com/ngo",
};

describe("request_audit flow", () => {
  it("returns SUCCESS when tx is accepted and verdict is not INCONCLUSIVE", async () => {
    const onTxHash = vi.fn();
    const result = await executeAuditRequestFlow({
      request: baseRequest,
      writeAuditTx: async () => "0xabc",
      waitForReceipt: async () => ({ status: "ACCEPTED" }),
      readCompanyProfile: async () => ({
        company_id: "APPLE_INC",
        target_reduction: "20",
        ethos_score: 70,
        escrow_balance: 70,
        audit_count: 2,
        latest_verdict: "VIOLATION",
        audit_history: [
          { verdict: "VIOLATION", summary: "mismatch", score_change: "-30", slash_amount: 30 },
        ],
      }),
      onTxHash,
    });

    expect(onTxHash).toHaveBeenCalledWith("0xabc");
    expect(result.outcome).toBe("SUCCESS");
    expect(result.verdict).toBe("VIOLATION");
    expect(result.summary).toBe("mismatch");
  });

  it("throws when tx receipt is not ACCEPTED", async () => {
    await expect(
      executeAuditRequestFlow({
        request: baseRequest,
        writeAuditTx: async () => "0xdead",
        waitForReceipt: async () => ({ status: "FAILED" }),
      })
    ).rejects.toThrow("Audit failed: transaction status is FAILED");
  });

  it("returns INCONCLUSIVE outcome when profile verdict is inconclusive", async () => {
    const result = await executeAuditRequestFlow({
      request: {
        ...baseRequest,
        iot_sensor_url: "",
        ngo_watchdog_url: "",
      },
      writeAuditTx: async () => "0xdef",
      waitForReceipt: async () => ({ status: "ACCEPTED" }),
      readCompanyProfile: async () => ({
        company_id: "APPLE_INC",
        target_reduction: "20",
        ethos_score: 70,
        escrow_balance: 70,
        audit_count: 3,
        latest_verdict: "INCONCLUSIVE",
        audit_history: [
          { verdict: "INCONCLUSIVE", summary: "insufficient sources", score_change: "0" },
        ],
      }),
    });

    expect(result.outcome).toBe("INCONCLUSIVE");
    expect(result.verdict).toBe("INCONCLUSIVE");
    expect(result.summary).toBe("insufficient sources");
  });
});
