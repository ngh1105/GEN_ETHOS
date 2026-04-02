import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { testnetBradbury } from "genlayer-js/chains";

// GenLayer Bradbury Testnet - use the public Bradbury RPC
export const genlayerTestnet = {
  ...testnetBradbury,
  name: "GenLayer Bradbury Testnet",
  defaultConsensusMaxRotations: 3,
  defaultNumberOfInitialValidators: 5,
  rpcUrls: {
    default: {
      http: ["https://rpc-bradbury.genlayer.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Explorer",
      url: "https://explorer-bradbury.genlayer.com",
    },
  },
} as const;

export const wagmiConfig = getDefaultConfig({
  appName: "GEN-ETHOS",
  projectId: "4b97d2ccbd2e3df2f2ce16962acfd7db",
  chains: [genlayerTestnet],
  ssr: true,
});
