#!/usr/bin/env node
// Read-only health check: does this app actually talk to the deployed
// contracts? Calls every read path the UI depends on, through the same ABIs
// and addresses the app imports — so a mismatch here is a real mismatch,
// not a parallel reimplementation that happens to agree.
//
// Sends no transactions. Usage: node scripts/verify-chain.mjs

import { readFileSync } from "node:fs";
import { createPublicClient, formatEther, http, keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { CHAIN_ID, CONTRACTS } from "../contracts/generated/addresses.ts";
import { TreeBondAbi } from "../lib/web3/abis/TreeBond.ts";
import { TreeNFTAbi } from "../lib/web3/abis/TreeNFT.ts";
import { TreeRegistryAbi } from "../lib/web3/abis/TreeRegistry.ts";
import { VerificationRegistryAbi } from "../lib/web3/abis/VerificationRegistry.ts";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const pick = (key) => env.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(pick("NEXT_PUBLIC_RPC_URL")),
});

const ok = (s) => `\x1b[32m✓\x1b[0m ${s}`;
const bad = (s) => `\x1b[31m✗\x1b[0m ${s}`;
const warn = (s) => `\x1b[33m!\x1b[0m ${s}`;
const head = (s) => `\n\x1b[1m${s}\x1b[0m`;

const role = (name) => keccak256(toHex(name));
const DEFAULT_ADMIN_ROLE = `0x${"0".repeat(64)}`;

const failures = [];

console.log(head("1. Network"));
const chainId = await client.getChainId();
console.log(
  chainId === CHAIN_ID
    ? ok(`RPC reachable, chain ${chainId} (Arbitrum Sepolia)`)
    : bad(`RPC is on chain ${chainId}, app expects ${CHAIN_ID}`),
);
if (chainId !== CHAIN_ID) failures.push("wrong chain");
console.log(`  block: ${await client.getBlockNumber()}`);

console.log(head("2. Contracts deployed at the addresses the app uses"));
for (const [name, address] of Object.entries(CONTRACTS)) {
  const code = await client.getCode({ address });
  const deployed = code && code !== "0x";
  console.log(
    deployed
      ? ok(`${name.padEnd(21)} ${address} (${(code.length - 2) / 2} bytes)`)
      : bad(`${name.padEnd(21)} ${address} — NO CONTRACT`),
  );
  if (!deployed) failures.push(`${name} not deployed`);
}

console.log(head("3. Reads through the app's own ABIs"));
const reads = [
  [
    "TreeRegistry.treeCount",
    {
      address: CONTRACTS.treeRegistry,
      abi: TreeRegistryAbi,
      functionName: "treeCount",
    },
  ],
  [
    "TreeRegistry.projectCount",
    {
      address: CONTRACTS.treeRegistry,
      abi: TreeRegistryAbi,
      functionName: "projectCount",
    },
  ],
  [
    "TreeBond.defaultTreePrice",
    {
      address: CONTRACTS.treeBond,
      abi: TreeBondAbi,
      functionName: "defaultTreePrice",
    },
  ],
  [
    "TreeBond.platformFeeBps",
    {
      address: CONTRACTS.treeBond,
      abi: TreeBondAbi,
      functionName: "platformFeeBps",
    },
  ],
  [
    "TreeBond.treasury",
    { address: CONTRACTS.treeBond, abi: TreeBondAbi, functionName: "treasury" },
  ],
  [
    "TreeBond.paused",
    { address: CONTRACTS.treeBond, abi: TreeBondAbi, functionName: "paused" },
  ],
  [
    "TreeNFT.name",
    { address: CONTRACTS.treeNFT, abi: TreeNFTAbi, functionName: "name" },
  ],
  [
    "VerificationRegistry.totalVerificationCount",
    {
      address: CONTRACTS.verificationRegistry,
      abi: VerificationRegistryAbi,
      functionName: "totalVerificationCount",
    },
  ],
];
const values = {};
for (const [label, call] of reads) {
  try {
    const value = await client.readContract(call);
    values[label] = value;
    const shown =
      label === "TreeBond.defaultTreePrice"
        ? `${value} wei (${formatEther(value)} ETH)`
        : String(value);
    console.log(ok(`${label.padEnd(38)} → ${shown}`));
  } catch (error) {
    console.log(
      bad(`${label.padEnd(38)} → ${error.shortMessage ?? error.message}`),
    );
    failures.push(`${label} failed — ABI/address mismatch`);
  }
}

console.log(head("4. Server-held oracle key"));
let oracle = null;
const pk = pick("ORACLE_PRIVATE_KEY");
if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) {
  console.log(bad("ORACLE_PRIVATE_KEY missing or malformed"));
  failures.push("no oracle key");
} else {
  oracle = privateKeyToAccount(pk).address;
  const balance = await client.getBalance({ address: oracle });
  console.log(ok(`derives to ${oracle}`));
  console.log(
    balance > 0n
      ? ok(`balance ${formatEther(balance)} ETH`)
      : warn(`balance 0 ETH — cannot send any transaction`),
  );
  if (balance === 0n) failures.push("oracle wallet has no gas");
}

console.log(head("5. On-chain roles"));
const roleChecks = [
  [
    "TreeRegistry",
    CONTRACTS.treeRegistry,
    TreeRegistryAbi,
    "DEFAULT_ADMIN_ROLE",
    DEFAULT_ADMIN_ROLE,
    oracle,
  ],
  [
    "TreeRegistry",
    CONTRACTS.treeRegistry,
    TreeRegistryAbi,
    "OPERATOR_ROLE",
    role("OPERATOR_ROLE"),
    oracle,
  ],
  [
    "TreeRegistry",
    CONTRACTS.treeRegistry,
    TreeRegistryAbi,
    "VERIFIER_ROLE",
    role("VERIFIER_ROLE"),
    oracle,
  ],
  [
    "TreeRegistry",
    CONTRACTS.treeRegistry,
    TreeRegistryAbi,
    "SPONSOR_ROLE (TreeBond)",
    role("SPONSOR_ROLE"),
    CONTRACTS.treeBond,
  ],
  [
    "TreeNFT",
    CONTRACTS.treeNFT,
    TreeNFTAbi,
    "MINTER_ROLE (TreeBond)",
    role("MINTER_ROLE"),
    CONTRACTS.treeBond,
  ],
  [
    "VerificationRegistry",
    CONTRACTS.verificationRegistry,
    VerificationRegistryAbi,
    "ORACLE_ROLE",
    role("ORACLE_ROLE"),
    oracle,
  ],
];
for (const [contract, address, abi, label, hash, holder] of roleChecks) {
  if (!holder) continue;
  try {
    const has = await client.readContract({
      address,
      abi,
      functionName: "hasRole",
      args: [hash, holder],
    });
    const who = holder === oracle ? "oracle wallet" : `${holder.slice(0, 8)}…`;
    console.log(
      has
        ? ok(`${contract}.${label.padEnd(24)} held by ${who}`)
        : warn(`${contract}.${label.padEnd(24)} NOT held by ${who}`),
    );
    // Wiring the contracts grant each other is mandatory; sponsoring reverts
    // without them no matter who signs.
    if (!has && label.includes("TreeBond")) {
      failures.push(`${contract}.${label} missing — sponsorTree would revert`);
    }
  } catch (error) {
    console.log(
      bad(`${contract}.${label} → ${error.shortMessage ?? error.message}`),
    );
  }
}

console.log(head("Verdict"));
const treeCount = values["TreeRegistry.treeCount"];
if (failures.length === 0) {
  console.log(
    ok("App ↔ contract wiring is correct. Reads and ABIs all match."),
  );
} else {
  for (const f of failures) console.log(bad(f));
}
if (treeCount === 0n) {
  console.log(
    warn(
      "Chain has 0 trees — nothing is sponsorable yet. Needs: createProject → registerTree → status 1→2→3→4 (AVAILABLE).",
    ),
  );
}
process.exit(failures.length === 0 ? 0 : 1);
