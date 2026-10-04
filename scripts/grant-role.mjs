#!/usr/bin/env node
// Grants (or revokes) an on-chain role on TreeRegistry from the deployer key.
//
// The in-app Grant Role form at /admin does the same thing signed from the
// admin's own wallet, which is the right production shape. This exists for
// when that path is blocked — a wallet that can't render the fee correctly,
// or no DEFAULT_ADMIN_ROLE account loaded in the browser.
//
// Usage:
//   node scripts/grant-role.mjs <address> [OPERATOR_ROLE|VERIFIER_ROLE] [revoke]

import { readFileSync } from "node:fs";
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { CONTRACTS } from "../contracts/generated/addresses.ts";
import { TreeRegistryAbi } from "../lib/web3/abis/TreeRegistry.ts";

const [target, roleName = "OPERATOR_ROLE", action = "grant"] =
  process.argv.slice(2);

if (!target || !/^0x[a-fA-F0-9]{40}$/.test(target)) {
  console.error("Usage: node scripts/grant-role.mjs <0xaddress> [ROLE] [revoke]");
  process.exit(1);
}

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const pick = (k) => env.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();

const account = privateKeyToAccount(pick("ORACLE_PRIVATE_KEY"));
const transport = http(pick("NEXT_PUBLIC_RPC_URL"));
const publicClient = createPublicClient({ chain: arbitrumSepolia, transport });
const walletClient = createWalletClient({
  account,
  chain: arbitrumSepolia,
  transport,
});
const registry = { address: CONTRACTS.treeRegistry, abi: TreeRegistryAbi };
const role = keccak256(toHex(roleName));

const DEFAULT_ADMIN_ROLE = `0x${"0".repeat(64)}`;
const canGrant = await publicClient.readContract({
  ...registry,
  functionName: "hasRole",
  args: [DEFAULT_ADMIN_ROLE, account.address],
});
if (!canGrant) {
  console.error(`${account.address} does not hold DEFAULT_ADMIN_ROLE`);
  process.exit(1);
}

const already = await publicClient.readContract({
  ...registry,
  functionName: "hasRole",
  args: [role, target],
});
if (action === "grant" && already) {
  console.log(`${target} already has ${roleName} — nothing to do.`);
  process.exit(0);
}
if (action !== "grant" && !already) {
  console.log(`${target} does not have ${roleName} — nothing to do.`);
  process.exit(0);
}

console.log(`${action === "grant" ? "Granting" : "Revoking"} ${roleName}`);
console.log(`  target ${target}`);
console.log(`  signer ${account.address}`);

// No explicit fee overrides: viem estimates, which is what every working
// transaction in scripts/ has done. See lib/web3/gas.ts history.
const hash = await walletClient.writeContract({
  ...registry,
  functionName: action === "grant" ? "grantRole" : "revokeRole",
  args: [role, target],
});
const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success") {
  console.error(`Reverted: ${hash}`);
  process.exit(1);
}

const now = await publicClient.readContract({
  ...registry,
  functionName: "hasRole",
  args: [role, target],
});
console.log(`\ndone — hasRole(${roleName}) = ${now}`);
console.log(`  tx   ${hash}`);
console.log(`  gas  ${receipt.gasUsed} units`);
