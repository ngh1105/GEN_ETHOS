import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { studionet } from "genlayer-js/chains";

// GenLayer Studio Network backup configuration
export const genlayerStudioNetwork = {
  ...studionet,
  name: "GenLayer Studio Network",
  defaultConsensusMaxRotations: 3,
  defaultNumberOfInitialValidators: 5,
  rpcUrls: {
    default: {
      http: ["https://studio.genlayer.com/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Explorer",
      url: "https://zksync-os-testnet-genlayer.explorer.zksync.dev",
    },
  },
} as const;

export const wagmiConfig = getDefaultConfig({
  appName: "GEN-ETHOS",
  projectId: "4b97d2ccbd2e3df2f2ce16962acfd7db",
  chains: [genlayerStudioNetwork],
  ssr: true,
});
