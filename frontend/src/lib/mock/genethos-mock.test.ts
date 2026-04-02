import { describe, expect, it } from "vitest";
import { MOCK_WALLET_ADDRESS } from "./genethos-mock";
import {
  mockDepositEscrow,
  mockGetCompanyProfile,
  mockRegisterCompany,
  mockRequestAudit,
  mockWithdrawCompliantUnlock,
  resetMockState,
} from "./genethos-mock";

describe("mock contract financial flow", () => {
  it("registers, deposits, applies verdicts, and withdraws unlocked balance", async () => {
    resetMockState();

    await mockRegisterCompany(
      {
        company_id: "FIN_TEST",
        target_reduction_percentage: "20",
      },
      MOCK_WALLET_ADDRESS
    );
    await mockDepositEscrow(
      {
        company_id: "FIN_TEST",
        amount: BigInt(100),
      },
      MOCK_WALLET_ADDRESS
    );

    const compliantResult = await mockRequestAudit(
      {
        company_id: "FIN_TEST",
        official_report_url: "https://example.com/report",
        iot_sensor_url: "https://example.com/iot",
        ngo_watchdog_url: "",
      },
      MOCK_WALLET_ADDRESS
    );
    expect(compliantResult.verdict).toBe("COMPLIANT");

    const afterCompliant = await mockGetCompanyProfile("FIN_TEST");
    expect(afterCompliant.escrow_balance).toBe(90);
    expect(afterCompliant.withdrawable_amount).toBe(10);
    expect(afterCompliant.ethos_score).toBe(110);

    const violationResult = await mockRequestAudit(
      {
        company_id: "FIN_TEST",
        official_report_url: "https://example.com/report",
        iot_sensor_url: "https://example.com/violation-proof",
        ngo_watchdog_url: "",
      },
      MOCK_WALLET_ADDRESS
    );
    expect(violationResult.verdict).toBe("VIOLATION");

    const afterViolation = await mockGetCompanyProfile("FIN_TEST");
    expect(afterViolation.escrow_balance).toBe(63);
    expect(afterViolation.ethos_score).toBe(80);
    expect(afterViolation.withdrawable_amount).toBe(10);

    await mockWithdrawCompliantUnlock("FIN_TEST", BigInt(4), MOCK_WALLET_ADDRESS);
    const afterWithdraw = await mockGetCompanyProfile("FIN_TEST");
    expect(afterWithdraw.withdrawable_amount).toBe(6);
  });
});
