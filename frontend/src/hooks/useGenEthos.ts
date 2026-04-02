"use client";

import { useMemo } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "genlayer-js";
import type { Account } from "viem";
import { executeAuditRequestFlow } from "@/lib/audit-flow";
import { getReceiptStatusName } from "@/lib/genlayer/transaction-status";
import {
  buildAuditPageFromProfile,
  parseCompanyAuditPageResponse,
  parseCompanyProfileResponse,
} from "@/lib/company-profile";
import { client, CONTRACT_ADDRESS } from "@/lib/genlayer/client";
import {
  isMockDataEnabled,
  mockDepositEscrow,
  mockGetCompanyAuditPage,
  mockGetCompanyProfile,
  mockGetPlatformStats,
  mockRegisterCompany,
  mockRequestAudit,
  MOCK_WALLET_ADDRESS,
} from "@/lib/mock/genethos-mock";
import { genlayerTestnet } from "@/lib/wagmi";
import type {
  CompanyAuditPage,
  PlatformStats,
  CompanyProfile,
  AuditRequest,
  RegisterCompanyRequest,
  DepositEscrowRequest,
} from "@/types";

type WalletAddress = `0x${string}`;
type TransactionHash = Parameters<typeof client.waitForTransactionReceipt>[0]["hash"];
const DEFAULT_AUDIT_PAGE_SIZE = 20;
const PAGED_AUDIT_FN_NAME = "get_company_audit_page";

type EthereumRequest = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

type EthereumProvider = {
  request: (request: EthereumRequest) => Promise<unknown>;
};

type WindowWithEthereum = Window & {
  ethereum?: EthereumProvider;
};

function getBrowserProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return (window as WindowWithEthereum).ethereum ?? null;
}

function toAccount(address: WalletAddress): Account {
  return { address } as unknown as Account;
}

function shouldFallbackAuditPageRequest(error: unknown): boolean {
  const message = String(error ?? "").toLowerCase();
  return (
    message.includes(PAGED_AUDIT_FN_NAME) ||
    message.includes("function not found") ||
    message.includes("unknown function") ||
    message.includes("does not exist") ||
    message.includes("abi")
  );
}

function useDynamicClient() {
  return useMemo(() => {
    const provider = getBrowserProvider();
    if (!provider) return client;

    return createClient({
      chain: genlayerTestnet,
      endpoint: process.env.NEXT_PUBLIC_GENLAYER_RPC || "https://rpc-bradbury.genlayer.com",
      provider,
    });
  }, []);
}

async function getCurrentAddress(): Promise<WalletAddress> {
  if (isMockDataEnabled()) {
    return MOCK_WALLET_ADDRESS;
  }

  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error("MetaMask is required to use this feature.");
  }

  const accountsResult = await provider.request({ method: "eth_accounts" });
  if (!Array.isArray(accountsResult) || accountsResult.length === 0) {
    throw new Error("Please connect your wallet before sending a transaction.");
  }

  const address = String(accountsResult[0]);
  if (!address.startsWith("0x")) {
    throw new Error("Provider returned an invalid wallet address.");
  }

  return address as WalletAddress;
}

export function usePlatformStats() {
  return useQuery<PlatformStats>({
    queryKey: ["platformStats"],
    queryFn: async () => {
      if (isMockDataEnabled()) {
        return mockGetPlatformStats();
      }

      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_platform_stats",
        args: [],
      });
      return result as unknown as PlatformStats;
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}

export function useCompanyProfile(companyId: string | null) {
  return useQuery<CompanyProfile>({
    queryKey: ["companyProfile", companyId],
    queryFn: async () => {
      if (!companyId) {
        throw new Error("Missing company id");
      }

      if (isMockDataEnabled()) {
        return mockGetCompanyProfile(companyId);
      }

      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_company_profile",
        args: [companyId],
      });

      return parseCompanyProfileResponse(result);
    },
    enabled: !!companyId,
    staleTime: 10_000,
    retry: 1,
  });
}

export function useCompanyAuditHistory(companyId: string | null, pageSize = DEFAULT_AUDIT_PAGE_SIZE) {
  return useInfiniteQuery<CompanyAuditPage>({
    queryKey: ["companyAuditHistory", companyId, pageSize],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      if (!companyId) {
        throw new Error("Missing company id");
      }

      const offset = typeof pageParam === "number" ? pageParam : Number(pageParam);

      if (isMockDataEnabled()) {
        return mockGetCompanyAuditPage(companyId, offset, pageSize);
      }

      try {
        const result = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: PAGED_AUDIT_FN_NAME,
          args: [companyId, BigInt(offset), BigInt(pageSize)],
        });

        return parseCompanyAuditPageResponse(result);
      } catch (pageError) {
        if (!shouldFallbackAuditPageRequest(pageError)) {
          throw pageError;
        }

        const profileResult = await client.readContract({
          address: CONTRACT_ADDRESS,
          functionName: "get_company_profile",
          args: [companyId],
        });
        const profile = parseCompanyProfileResponse(profileResult);
        return buildAuditPageFromProfile(profile, offset, pageSize);
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_next) return undefined;
      return lastPage.next_offset ?? undefined;
    },
    enabled: !!companyId,
    staleTime: 10_000,
    retry: 1,
  });
}

export function useRegisterCompany() {
  const queryClient = useQueryClient();
  const dynamicClient = useDynamicClient();

  return useMutation({
    mutationFn: async ({ company_id, target_reduction_percentage }: RegisterCompanyRequest) => {
      const currentAddress = await getCurrentAddress();

      if (isMockDataEnabled()) {
        return mockRegisterCompany({ company_id, target_reduction_percentage }, currentAddress);
      }

      const txHash = (await dynamicClient.writeContract({
        account: toAccount(currentAddress),
        address: CONTRACT_ADDRESS,
        functionName: "register_company",
        args: [company_id, target_reduction_percentage],
        value: BigInt(0),
      })) as TransactionHash;

      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
        interval: 1000,
        retries: 60,
      });

      const receiptStatus = getReceiptStatusName(receipt);
      if (receiptStatus !== "ACCEPTED" && receiptStatus !== "FINALIZED") {
        throw new Error(`Registration failed: transaction status is ${receiptStatus}`);
      }

      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformStats"] });
    },
  });
}

export function useDepositEscrow() {
  const queryClient = useQueryClient();
  const dynamicClient = useDynamicClient();

  return useMutation({
    mutationFn: async ({ company_id, amount }: DepositEscrowRequest) => {
      const currentAddress = await getCurrentAddress();

      if (isMockDataEnabled()) {
        return mockDepositEscrow({ company_id, amount }, currentAddress);
      }

      const txHash = (await dynamicClient.writeContract({
        account: toAccount(currentAddress),
        address: CONTRACT_ADDRESS,
        functionName: "deposit_escrow",
        args: [company_id, amount],
        value: BigInt(0),
      })) as TransactionHash;

      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
        interval: 1000,
        retries: 60,
      });

      const receiptStatus = getReceiptStatusName(receipt);
      if (receiptStatus !== "ACCEPTED" && receiptStatus !== "FINALIZED") {
        throw new Error(`Deposit failed: transaction status is ${receiptStatus}`);
      }

      return receipt;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companyProfile", variables.company_id] });
      queryClient.invalidateQueries({ queryKey: ["platformStats"] });
    },
  });
}

export type AuditRequestWithCallback = AuditRequest & {
  onTxHash?: (hash: TransactionHash) => void;
};

export function useRequestAudit() {
  const queryClient = useQueryClient();
  const dynamicClient = useDynamicClient();

  return useMutation({
    mutationFn: async (req: AuditRequestWithCallback) => {
      const currentAddress = await getCurrentAddress();

      if (isMockDataEnabled()) {
        const response = await mockRequestAudit(req, currentAddress);
        req.onTxHash?.(response.hash as TransactionHash);
        return {
          txHash: response.hash,
          receiptStatus: response.status,
          verdict: response.verdict,
          summary: response.summary,
          outcome: response.verdict === "INCONCLUSIVE" ? "INCONCLUSIVE" : "SUCCESS",
        };
      }

      return executeAuditRequestFlow({
        request: req,
        onTxHash: (hash) => req.onTxHash?.(hash as TransactionHash),
        writeAuditTx: async (args) => {
          const txHash = (await dynamicClient.writeContract({
            account: toAccount(currentAddress),
            address: CONTRACT_ADDRESS,
            functionName: "request_audit",
            args,
            value: BigInt(0),
          })) as TransactionHash;
          return txHash;
        },
        waitForReceipt: async (hash) =>
          client.waitForTransactionReceipt({
            hash: hash as TransactionHash,
            interval: 1000,
            retries: 60,
          }),
        readCompanyProfile: async () =>
          client.readContract({
            address: CONTRACT_ADDRESS,
            functionName: "get_company_profile",
            args: [req.company_id],
          }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companyProfile", variables.company_id] });
      queryClient.invalidateQueries({ queryKey: ["companyAuditHistory", variables.company_id] });
      queryClient.invalidateQueries({ queryKey: ["platformStats"] });
    },
  });
}
