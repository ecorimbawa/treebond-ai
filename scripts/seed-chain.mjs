#!/usr/bin/env node
// One-off: pushes one project + one tree onto TreeRegistry and walks it up to
// AVAILABLE, so there is something a sponsor can actually buy. Without this
// the chain is empty, every Tree Passport reads "not registered on-chain yet"
// and the Sponsor button never renders.
//
// Signs with ORACLE_PRIVATE_KEY, which on this deployment is also the deployer
// and holds OPERATOR_ROLE + VERIFIER_ROLE. That is a seeding shortcut, NOT how
// the app works: operators and verifiers sign from their own wallets in the
// browser (see hooks/write/*). Nothing here is wired into runtime code.
//
// Safe to re-run: it reuses an existing on-chain project/tree when the Mongo
// record already carries its id, and skips status steps already past.
//
// Usage: node scripts/seed-chain.mjs [TREE-CODE]

import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEventLogs,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { CHAIN_ID, CONTRACTS } from "../contracts/generated/addresses.ts";
import { TreeRegistryAbi } from "../lib/web3/abis/TreeRegistry.ts";

const TREE_CODE = process.argv[2] ?? "TREE-JTG-000001";

// Mirrors lib/web3/format.ts — the contract stores int64 microdegrees.
const toMicrodegrees = (deg) => BigInt(Math.round(deg * 1e6));

// Mirrors lib/tree-status.ts.
const STATUS = {
  REGISTERED: 1,
  PENDING_VERIFICATION: 2,
  VERIFIED: 3,
  AVAILABLE: 4,
};

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

// TreeRegistry.registerTree rejects an empty metadataCID with EmptyString().
// IPFS pinning is still deferred (operators type the CID by hand — see
// RegisterTreeForm), so a tree with no CID yet gets a placeholder that is
// obviously a placeholder, and it's written back to Mongo so both sides agree.
const cidFor = (treeCode) => `placeholder-${treeCode.toLowerCase()}`;

async function send(functionName, args, label) {
  process.stdout.write(`  ${label} … `);
  try {
    const hash = await walletClient.writeContract({
      ...registry,
      functionName,
      args,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error(`reverted on-chain (${hash})`);
    }
    console.log(`ok  ${hash}`);
    return receipt;
  } catch (error) {
    const reason =
      error.cause?.data?.errorName ?? error.shortMessage ?? error.message;
    console.log(`FAILED — ${reason}`);
    throw new Error(`${functionName}: ${reason}`, { cause: error });
  }
}

await mongoose.connect(pick("MONGODB_URI"));
const db = mongoose.connection.db;

const tree = await db.collection("trees").findOne({ treeCode: TREE_CODE });
if (!tree) throw new Error(`No Mongo tree with code ${TREE_CODE}`);
const project = await db
  .collection("projects")
  .findOne({ _id: tree.projectId });
if (!project) throw new Error(`Tree ${TREE_CODE} has no project`);

console.log(`signer:  ${account.address}`);
console.log(`project: ${project.name} (${project.slug})`);
console.log(`tree:    ${TREE_CODE} ${tree.species}\n`);

// 1. Project ------------------------------------------------------------
let onChainProjectId = project.onChainProjectId ?? null;
if (onChainProjectId == null) {
  console.log("1. createProject");
  const receipt = await send(
    "createProject",
    [project.slug, project.name, project.coverImageCid ?? "", account.address],
    "tx",
  );
  const [event] = parseEventLogs({
    abi: TreeRegistryAbi,
    eventName: "ProjectCreated",
    logs: receipt.logs,
  });
  onChainProjectId = Number(event.args.projectId);
  await db
    .collection("projects")
    .updateOne({ _id: project._id }, { $set: { onChainProjectId } });
  console.log(`  → projectId ${onChainProjectId}, synced to Mongo\n`);
} else {
  console.log(`1. createProject — already on-chain as #${onChainProjectId}\n`);
}

// 2. Tree ---------------------------------------------------------------
let tokenId = tree.tokenId ?? null;
if (tokenId == null) {
  console.log("2. registerTree");
  const metadataCid = tree.metadataCid || cidFor(tree.treeCode);
  const receipt = await send(
    "registerTree",
    [
      BigInt(onChainProjectId),
      tree.treeCode,
      metadataCid,
      toMicrodegrees(tree.latitude),
      toMicrodegrees(tree.longitude),
      BigInt(Math.floor(new Date(tree.plantedAt).getTime() / 1000)),
    ],
    "tx",
  );
  const [event] = parseEventLogs({
    abi: TreeRegistryAbi,
    eventName: "TreeRegistered",
    logs: receipt.logs,
  });
  tokenId = Number(event.args.treeId);
  await db.collection("trees").updateOne(
    { _id: tree._id },
    {
      $set: {
        tokenId,
        metadataCid,
        contractAddress: CONTRACTS.treeNFT.toLowerCase(),
        status: "REGISTERED",
      },
    },
  );
  console.log(`  → treeId/tokenId ${tokenId}, synced to Mongo\n`);
} else {
  console.log(`2. registerTree — already on-chain as #${tokenId}\n`);
}

// 3. Status walk --------------------------------------------------------
// The contract only allows 1→2→3→4 one hop at a time; jumping reverts with
// InvalidTreeStatus.
console.log("3. updateTreeStatus → AVAILABLE");
let current = Number(
  await publicClient.readContract({
    ...registry,
    functionName: "treeStatus",
    args: [BigInt(tokenId)],
  }),
);
for (const next of [
  STATUS.PENDING_VERIFICATION,
  STATUS.VERIFIED,
  STATUS.AVAILABLE,
]) {
  if (current >= next) continue;
  await send(
    "updateTreeStatus",
    [BigInt(tokenId), next],
    `${current} → ${next}`,
  );
  current = next;
}
await db
  .collection("trees")
  .updateOne({ _id: tree._id }, { $set: { status: "AVAILABLE" } });

// 4. Report -------------------------------------------------------------
const [onChainStatus, price] = await Promise.all([
  publicClient.readContract({
    ...registry,
    functionName: "treeStatus",
    args: [BigInt(tokenId)],
  }),
  publicClient.readContract({
    address: CONTRACTS.treeBond,
    abi: [
      {
        type: "function",
        name: "getTreePrice",
        stateMutability: "view",
        inputs: [{ name: "treeId", type: "uint256" }],
        outputs: [{ type: "uint256" }],
      },
    ],
    functionName: "getTreePrice",
    args: [BigInt(tokenId)],
  }),
]);

console.log(`\nDone — chain ${CHAIN_ID}`);
console.log(`  tokenId      ${tokenId}`);
console.log(`  status       ${onChainStatus} (4 = AVAILABLE)`);
console.log(`  price        ${price} wei`);
console.log(`  sponsor at   /trees/${tree._id}`);

await mongoose.disconnect();
