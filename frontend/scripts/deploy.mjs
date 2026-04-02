import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { privateKeyToAccount } from "viem/accounts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");
const CONTRACT_PATH = path.resolve(FRONTEND_DIR, "..", "contracts", "gen_ethos.py");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(FRONTEND_DIR, ".env.local"));
loadEnvFile(path.join(FRONTEND_DIR, ".env"));

const PRIVATE_KEY = process.env.GENLAYER_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC || "http://34.91.102.53:9151";

if (!PRIVATE_KEY) {
  throw new Error(
    "Missing GENLAYER_PRIVATE_KEY. Set it in the shell or frontend/.env.local before deploying."
  );
}

const customChain = {
  ...testnetBradbury,
  rpcUrls: {
    ...testnetBradbury.rpcUrls,
    default: { http: [RPC_URL] },
  },
};

function resolveContractAddress(receipt) {
  return (
    receipt?.contract_address ||
    receipt?.contractAddress ||
    receipt?.address ||
    receipt?.recipient ||
    receipt?.transactionData?.contractAddress ||
    receipt?.transactionData?.contract_address ||
    null
  );
}

async function main() {
  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const client = createClient({
      chain: customChain,
      endpoint: RPC_URL,
      account,
    });

    console.log("Reading contract from:", CONTRACT_PATH);
    const code = fs.readFileSync(CONTRACT_PATH, "utf8");
    console.log("Contract size:", code.length, "chars");

    console.log("Account address:", account.address);
    console.log("Deploying to:", RPC_URL, "(Bradbury Testnet)");

    console.log("Initiating deployment transaction...");
    const txHash = await client.deployContract({
      code,
      args: [],
    });

    console.log("\nTransaction Hash:", txHash);
    console.log("Waiting for network consensus and receipt...");

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 120,
      retryDelay: 2000,
    });

    console.log("\nDeployment SUCCESS!");
    const contractAddress = resolveContractAddress(receipt);
    console.log("Contract Address:", contractAddress);

    console.log("\n================================================");
    console.log("Action Required: Update .env.local with:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("================================================\n");
  } catch (err) {
    console.error("\nDeployment failed:");
    console.error(err);
    process.exitCode = 1;
  }
}

main();
