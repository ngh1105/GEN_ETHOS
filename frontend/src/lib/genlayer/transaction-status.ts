import { transactionsStatusNumberToName } from "genlayer-js/types";

type ReceiptLike = {
  status?: unknown;
  statusName?: unknown;
  status_name?: unknown;
};

const statusMap = transactionsStatusNumberToName as Record<string, string>;

export function getReceiptStatusName(receipt: ReceiptLike): string {
  if (typeof receipt.statusName === "string" && receipt.statusName.length > 0) {
    return receipt.statusName;
  }

  if (typeof receipt.status_name === "string" && receipt.status_name.length > 0) {
    return receipt.status_name;
  }

  if (typeof receipt.status === "number") {
    return statusMap[String(receipt.status)] ?? String(receipt.status);
  }

  if (typeof receipt.status === "bigint") {
    return statusMap[receipt.status.toString()] ?? receipt.status.toString();
  }

  return typeof receipt.status === "string"
    ? receipt.status
    : String(receipt.status ?? "UNKNOWN");
}
