import { describe, expect, it } from "vitest";
import {
  applyAuditVerdictToFinance,
  applyCompliantWithdrawToFinance,
  type FinanceState,
} from "./finance-rules";

describe("contract-equivalent financial rules", () => {
  const baseState: FinanceState = {
    escrowBalance: 100,
    ethosScore: 100,
    ownerDeposit: 100,
    withdrawableAmount: 0,
  };

  it("applies COMPLIANT reward: unlock 10%, +10 score (cap 1000)", () => {
    const impact = applyAuditVerdictToFinance(
      { ...baseState, ethosScore: 995, withdrawableAmount: 4 },
      "COMPLIANT"
    );
    expect(impact.scoreChange).toBe("+10");
    expect(impact.slashAmount).toBe(0);
    expect(impact.unlockAmount).toBe(10);
    expect(impact.next).toEqual({
      escrowBalance: 90,
      ethosScore: 1000,
      ownerDeposit: 100,
      withdrawableAmount: 14,
    });
  });

  it("applies MINOR_VIOLATION slash: 10%, -10 score, owner deposit reduction", () => {
    const impact = applyAuditVerdictToFinance(
      { ...baseState, ethosScore: 7, ownerDeposit: 8 },
      "MINOR_VIOLATION"
    );
    expect(impact.scoreChange).toBe("-10");
    expect(impact.slashAmount).toBe(10);
    expect(impact.next).toEqual({
      escrowBalance: 90,
      ethosScore: 0,
      ownerDeposit: 0,
      withdrawableAmount: 0,
    });
  });

  it("applies VIOLATION slash: 30%, -30 score, owner deposit floor at zero", () => {
    const impact = applyAuditVerdictToFinance(
      { ...baseState, escrowBalance: 90, ownerDeposit: 20, ethosScore: 25 },
      "VIOLATION"
    );
    expect(impact.scoreChange).toBe("-30");
    expect(impact.slashAmount).toBe(27);
    expect(impact.next).toEqual({
      escrowBalance: 63,
      ethosScore: 0,
      ownerDeposit: 0,
      withdrawableAmount: 0,
    });
  });

  it("keeps balances unchanged for INCONCLUSIVE", () => {
    const impact = applyAuditVerdictToFinance(baseState, "INCONCLUSIVE");
    expect(impact.scoreChange).toBe("0");
    expect(impact.slashAmount).toBe(0);
    expect(impact.unlockAmount).toBe(0);
    expect(impact.next).toEqual(baseState);
  });

  it("applies compliant withdraw and enforces contract-style constraints", () => {
    const updated = applyCompliantWithdrawToFinance(
      { ...baseState, escrowBalance: 70, ownerDeposit: 80, withdrawableAmount: 20 },
      12
    );
    expect(updated).toEqual({
      escrowBalance: 70,
      ethosScore: 100,
      ownerDeposit: 68,
      withdrawableAmount: 8,
    });
  });

  it("rejects invalid withdraw amounts", () => {
    expect(() => applyCompliantWithdrawToFinance(baseState, 0)).toThrow(
      "Amount must be greater than zero"
    );
    expect(() =>
      applyCompliantWithdrawToFinance(
        { ...baseState, ownerDeposit: 100, withdrawableAmount: 10 },
        12
      )
    ).toThrow("Withdraw amount exceeds unlocked balance");
    expect(() =>
      applyCompliantWithdrawToFinance(
        { ...baseState, ownerDeposit: 5, withdrawableAmount: 10 },
        8
      )
    ).toThrow("Withdraw amount exceeds your deposited balance");
  });
});
