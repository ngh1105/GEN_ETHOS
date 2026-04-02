import { describe, expect, it } from "vitest";
import { getReceiptStatusName } from "./transaction-status";

describe("getReceiptStatusName", () => {
  it("prefers camelCase statusName when available", () => {
    expect(getReceiptStatusName({ statusName: "FINALIZED", status: 7 })).toBe("FINALIZED");
  });

  it("supports snake_case status_name returned by SDK receipts", () => {
    expect(getReceiptStatusName({ status_name: "ACCEPTED", status: 5 })).toBe("ACCEPTED");
  });

  it("maps numeric statuses to transaction state names", () => {
    expect(getReceiptStatusName({ status: 5 })).toBe("ACCEPTED");
    expect(getReceiptStatusName({ status: 7n })).toBe("FINALIZED");
  });
});
