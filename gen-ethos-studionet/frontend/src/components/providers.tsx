"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig, genlayerStudioNetwork } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Blockchain data changes slowly - only refetch after 30s
            staleTime: 30_000,
            // Cache data for 5 minutes between page navigations
            gcTime: 5 * 60 * 1000,
            // testnet RPC can be flaky; 2 retries is sufficient
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={genlayerStudioNetwork}
          theme={lightTheme({
            borderRadius: "none",
            accentColor: "#CCFF00",
            accentColorForeground: "#000",
            overlayBlur: "small",
          })}
        >
          {children}
          <Toaster richColors position="bottom-right" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
