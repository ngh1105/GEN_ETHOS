"use client";

import { Wallet, Globe, List } from "@phosphor-icons/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

type Eip1193Request = {
  method: string;
  params?: unknown[];
};

type Eip1193Provider = {
  request: (request: Eip1193Request) => Promise<unknown>;
};

type WindowWithEthereum = Window & {
  ethereum?: Eip1193Provider;
};

function getEthereumProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  return (window as WindowWithEthereum).ethereum ?? null;
}

function getErrorCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "number" ? code : undefined;
}

export function Header() {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-black bg-white px-10 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] transition-colors duration-300 dark:border-white dark:bg-[#050505] dark:shadow-[0px_4px_0px_0px_rgba(255,255,255,1)]">
      <div className="flex flex-1 items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="-ml-2 border-2 border-transparent p-2 text-black transition-colors hover:border-black dark:text-white dark:hover:border-white"
          aria-label="Toggle Menu"
        >
          <List className="h-6 w-6" weight="bold" />
        </button>

        <div className="hidden items-center gap-2 border-2 border-black bg-[#CCFF00] px-3 py-1.5 dark:border-white sm:flex">
          <Globe className="h-3.5 w-3.5 animate-pulse text-black" weight="bold" />
          <span className="pt-0.5 font-mono text-[10px] font-black uppercase tracking-[0.15em] text-black">
            GENLAYER STUDIO NETWORK
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="flex h-11 items-center justify-center gap-2 border-2 border-black bg-[#CCFF00] px-8 text-sm font-black uppercase transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#a0d900] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 dark:border-white dark:shadow-[4px_4px_0px_0px_#CCFF00] dark:hover:shadow-[2px_2px_0px_0px_#CCFF00]"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={async () => {
                          const provider = getEthereumProvider();
                          if (!provider) {
                            toast.error("MetaMask not found.");
                            return;
                          }

                          const chainId = `0x${(61999).toString(16)}`;

                          try {
                            await provider.request({
                              method: "wallet_switchEthereumChain",
                              params: [{ chainId }],
                            });
                          } catch (switchError: unknown) {
                            if (getErrorCode(switchError) === 4902) {
                              try {
                                await provider.request({
                                  method: "wallet_addEthereumChain",
                                  params: [
                                    {
                                      chainId,
                                      chainName: "GenLayer Studio Network",
                                      nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
                                      rpcUrls: ["https://studio.genlayer.com/api"],
                                      blockExplorerUrls: ["https://zksync-os-testnet-genlayer.explorer.zksync.dev"],
                                    },
                                  ],
                                });
                              } catch (addError: unknown) {
                                if (process.env.NODE_ENV === "development") {
                                  console.error("[DEV] Add network error:", addError);
                                }
                                toast.error(
                                  "Could not add the Studio network automatically. Please add it manually in wallet."
                                );
                              }
                            } else {
                              if (process.env.NODE_ENV === "development") {
                                console.error("[DEV] Switch network error:", switchError);
                              }
                              toast.error(
                                "Failed to switch network. Please try again or switch manually in wallet."
                              );
                            }
                          }
                        }}
                        type="button"
                        className="h-11 border-2 border-black bg-red-500 px-6 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:bg-red-600 active:translate-y-1 dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                      >
                        Wrong Network (Click Here)
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        className="hidden h-11 items-center gap-2 border-2 border-black bg-white px-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[1px] dark:border-white dark:bg-[#050505] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] sm:flex"
                      >
                        <Globe className="h-3.5 w-3.5 text-black dark:text-white" weight="bold" />
                        <span className="pt-0.5 font-mono text-[10px] font-black uppercase tracking-[0.15em] text-black dark:text-white">
                          {chain.name}
                        </span>
                      </button>

                      <button
                        onClick={openAccountModal}
                        className="flex h-11 items-center gap-2 border-2 border-black bg-[#CCFF00] px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:border-white dark:shadow-[4px_4px_0px_0px_#CCFF00]"
                      >
                        <Wallet className="h-4 w-4 text-black" weight="bold" />
                        <span className="pt-0.5 font-mono text-xs font-black tracking-tight text-black">
                          {account.displayName}
                        </span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
