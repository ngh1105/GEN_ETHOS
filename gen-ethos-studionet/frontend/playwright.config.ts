import { defineConfig } from "@playwright/test";

const mockContractAddress = "0x0000000000000000000000000000000000000001";
const mockRpc = "https://zksync-os-testnet-genlayer.zksync.dev";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3005",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- -p 3005",
    url: "http://localhost:3005",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_USE_MOCK_DATA: "true",
      NEXT_PUBLIC_CONTRACT_ADDRESS: mockContractAddress,
      NEXT_PUBLIC_GENLAYER_RPC: mockRpc,
    },
  },
});
