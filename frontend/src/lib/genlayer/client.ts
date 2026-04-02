import { createClient } from "genlayer-js";
import { genlayerTestnet } from "@/lib/wagmi";

const rpcEndpoint =
  process.env.NEXT_PUBLIC_GENLAYER_RPC || "https://rpc-bradbury.genlayer.com";
const mockModeEnabled = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const contractAddressEnv = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
if (!mockModeEnabled && !contractAddressEnv) {
  throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is required.");
}

if (contractAddressEnv && !/^0x[a-fA-F0-9]{40}$/.test(contractAddressEnv)) {
  throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is invalid. Expected a 0x-prefixed 40-byte hex address.");
}

export const client = createClient({
  chain: genlayerTestnet,
  endpoint: rpcEndpoint,
});

export const CONTRACT_ADDRESS = (contractAddressEnv ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;
