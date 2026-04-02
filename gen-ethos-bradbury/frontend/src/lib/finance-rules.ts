export type FinanceVerdict =
  | "COMPLIANT"
  | "MINOR_VIOLATION"
  | "VIOLATION"
  | "INCONCLUSIVE";

export type FinanceState = {
  escrowBalance: number;
  ethosScore: number;
  ownerDeposit: number;
  withdrawableAmount: number;
};

export type FinanceImpact = {
  next: FinanceState;
  scoreChange: string;
  slashAmount: number;
  unlockAmount: number;
};

function clampMin(value: number, min = 0): number {
  return value < min ? min : value;
}

export function applyAuditVerdictToFinance(
  state: FinanceState,
  verdict: FinanceVerdict
): FinanceImpact {
  const escrow = clampMin(Math.floor(state.escrowBalance));
  const score = clampMin(Math.floor(state.ethosScore));
  const ownerDeposit = clampMin(Math.floor(state.ownerDeposit));
  const withdrawable = clampMin(Math.floor(state.withdrawableAmount));

  if (verdict === "COMPLIANT") {
    const unlock = Math.floor((escrow * 10) / 100);
    return {
      next: {
        escrowBalance: escrow - unlock,
        ethosScore: Math.min(1000, score + 10),
        ownerDeposit,
        withdrawableAmount: withdrawable + unlock,
      },
      scoreChange: "+10",
      slashAmount: 0,
      unlockAmount: unlock,
    };
  }

  if (verdict === "MINOR_VIOLATION") {
    const slash = Math.floor((escrow * 10) / 100);
    return {
      next: {
        escrowBalance: escrow - slash,
        ethosScore: Math.max(0, score - 10),
        ownerDeposit: Math.max(0, ownerDeposit - slash),
        withdrawableAmount: withdrawable,
      },
      scoreChange: "-10",
      slashAmount: slash,
      unlockAmount: 0,
    };
  }

  if (verdict === "VIOLATION") {
    const slash = Math.floor((escrow * 30) / 100);
    return {
      next: {
        escrowBalance: escrow - slash,
        ethosScore: Math.max(0, score - 30),
        ownerDeposit: Math.max(0, ownerDeposit - slash),
        withdrawableAmount: withdrawable,
      },
      scoreChange: "-30",
      slashAmount: slash,
      unlockAmount: 0,
    };
  }

  return {
    next: {
      escrowBalance: escrow,
      ethosScore: score,
      ownerDeposit,
      withdrawableAmount: withdrawable,
    },
    scoreChange: "0",
    slashAmount: 0,
    unlockAmount: 0,
  };
}

export function applyCompliantWithdrawToFinance(
  state: FinanceState,
  amount: number
): FinanceState {
  const withdrawAmount = Math.floor(amount);
  if (withdrawAmount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const withdrawable = clampMin(Math.floor(state.withdrawableAmount));
  if (withdrawAmount > withdrawable) {
    throw new Error("Withdraw amount exceeds unlocked balance");
  }

  const ownerDeposit = clampMin(Math.floor(state.ownerDeposit));
  if (withdrawAmount > ownerDeposit) {
    throw new Error("Withdraw amount exceeds your deposited balance");
  }

  return {
    escrowBalance: clampMin(Math.floor(state.escrowBalance)),
    ethosScore: clampMin(Math.floor(state.ethosScore)),
    ownerDeposit: ownerDeposit - withdrawAmount,
    withdrawableAmount: withdrawable - withdrawAmount,
  };
}
