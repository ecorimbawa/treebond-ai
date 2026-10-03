#!/usr/bin/env node
// Reads contracts/addresses.json + contracts/abi/*.json (from the smart contract team),
// and generates contracts/generated/addresses.ts + lib/web3/abis/*.ts (as const).
// Re-run this after every redeploy: node scripts/sync-contracts.mjs

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const CONTRACTS_DIR = process.env.CONTRACTS_DIR
  ? join(ROOT, process.env.CONTRACTS_DIR)
  : join(ROOT, "contracts");

const ABI_OUT_DIR = join(ROOT, "lib/web3/abis");
const ADDRESSES_OUT = join(ROOT, "contracts/generated/addresses.ts");

const EXPECTED_CHAIN_ID = 421614;

const deployment = JSON.parse(
  readFileSync(join(CONTRACTS_DIR, "addresses.json"), "utf8"),
);

if (deployment.chainId !== EXPECTED_CHAIN_ID) {
  console.warn(
    `WARNING: chainId in addresses.json = ${deployment.chainId}, ` +
      `not ${EXPECTED_CHAIN_ID} (Arbitrum Sepolia). Confirm this is the right artifact.`,
  );
}

const ABIS = [
  ["TreeRegistry", "TreeRegistryAbi"],
  ["TreeNFT", "TreeNFTAbi"],
  ["TreeBond", "TreeBondAbi"],
  ["VerificationRegistry", "VerificationRegistryAbi"],
];

mkdirSync(ABI_OUT_DIR, { recursive: true });
mkdirSync(dirname(ADDRESSES_OUT), { recursive: true });

for (const [name, constName] of ABIS) {
  const abi = JSON.parse(
    readFileSync(join(CONTRACTS_DIR, "abi", `${name}.json`), "utf8"),
  );
  writeFileSync(
    join(ABI_OUT_DIR, `${name}.ts`),
    `export const ${constName} = ${JSON.stringify(abi)} as const;\n`,
  );
}

const addresses = `// Auto-generated from contracts/addresses.json. Do not edit manually.
// Re-run after every redeploy: node scripts/sync-contracts.mjs
export const CHAIN_ID = ${deployment.chainId} as const;

export const CONTRACTS = {
  treeRegistry: "${deployment.TreeRegistry}",
  treeNFT: "${deployment.TreeNFT}",
  treeBond: "${deployment.TreeBond}",
  verificationRegistry: "${deployment.VerificationRegistry}",
} as const;
`;

writeFileSync(ADDRESSES_OUT, addresses);

console.log(`OK: ${ABIS.length} ABIs -> ${ABI_OUT_DIR}`);
console.log(`OK: addresses -> ${ADDRESSES_OUT}`);
console.log(`Chain ID: ${deployment.chainId}`);
