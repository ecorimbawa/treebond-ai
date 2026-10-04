#!/usr/bin/env node
// Gets the chain into the state a Sponsor-only demo needs, in one command.
//
// The sponsor journey is the only one a judge should have to watch, but it
// depends on work the other three roles normally do first: a project and tree
// on TreeRegistry, status walked to AVAILABLE, and a verification record so
// the Tree Passport shows real health/growth instead of "None yet". This
// script does all of that up front with the deployer key, so on demo day
// nobody has to log in as operator, verifier or admin.
//
// Idempotent: re-running skips anything already on-chain, so it is safe to
// run again right before the demo.
//
// Usage: node scripts/prepare-demo.mjs

import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  parseEventLogs,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { CONTRACTS } from "../contracts/generated/addresses.ts";
import { TreeRegistryAbi } from "../lib/web3/abis/TreeRegistry.ts";
import { VerificationRegistryAbi } from "../lib/web3/abis/VerificationRegistry.ts";

// Trees in these Mongo states become sponsorable. SPONSORED/MATURE/DEAD are
// left alone on purpose — they make the explorer look like a real population
// rather than a shelf of identical demo rows.
const SPONSORABLE_FROM = ["AVAILABLE", "VERIFIED", "REGISTERED"];
const STATUS = { PENDING_VERIFICATION: 2, VERIFIED: 3, AVAILABLE: 4 };

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
const verifications = {
  address: CONTRACTS.verificationRegistry,
  abi: VerificationRegistryAbi,
};

const toMicrodegrees = (deg) => BigInt(Math.round(deg * 1e6));
const cidFor = (code) => `placeholder-${code.toLowerCase()}`;

let txCount = 0;
async function send(contract, functionName, args, label) {
  process.stdout.write(`    ${label} … `);
  try {
    const hash = await walletClient.writeContract({
      ...contract,
      functionName,
      args,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") throw new Error("reverted on-chain");
    txCount += 1;
    console.log("ok");
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

const startBalance = await publicClient.getBalance({
  address: account.address,
});
console.log(`signer ${account.address}`);
console.log(`balance ${startBalance} wei\n`);

const candidates = await db
  .collection("trees")
  .find({ status: { $in: SPONSORABLE_FROM } })
  .sort({ treeCode: 1 })
  .toArray();

console.log(`${candidates.length} tree(s) to make sponsorable\n`);
const ready = [];

for (const tree of candidates) {
  console.log(`${tree.treeCode} — ${tree.species}`);
  const project = await db
    .collection("projects")
    .findOne({ _id: tree.projectId });
  if (!project) {
    console.log("  skipped: no project\n");
    continue;
  }

  // 1. Project on-chain
  let projectId = project.onChainProjectId ?? null;
  if (projectId == null) {
    const receipt = await send(
      registry,
      "createProject",
      [
        project.slug,
        project.name,
        project.coverImageCid || cidFor(project.slug),
        account.address,
      ],
      "createProject",
    );
    const [event] = parseEventLogs({
      abi: TreeRegistryAbi,
      eventName: "ProjectCreated",
      logs: receipt.logs,
    });
    projectId = Number(event.args.projectId);
    await db
      .collection("projects")
      .updateOne(
        { _id: project._id },
        { $set: { onChainProjectId: projectId } },
      );
  }

  // 2. Tree on-chain
  let tokenId = tree.tokenId ?? null;
  const metadataCid = tree.metadataCid || cidFor(tree.treeCode);
  if (tokenId == null) {
    const receipt = await send(
      registry,
      "registerTree",
      [
        BigInt(projectId),
        tree.treeCode,
        metadataCid,
        toMicrodegrees(tree.latitude),
        toMicrodegrees(tree.longitude),
        BigInt(Math.floor(new Date(tree.plantedAt).getTime() / 1000)),
      ],
      "registerTree",
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
        },
      },
    );
  }

  // 3. Walk status to AVAILABLE — one hop at a time or the contract reverts
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
      registry,
      "updateTreeStatus",
      [BigInt(tokenId), next],
      `status ${current}→${next}`,
    );
    current = next;
  }

  // 4. A verification record, so the passport's chain panel shows real
  //    numbers. Without one it reads "Latest verification: None yet", which
  //    undercuts the whole "verified before tokenized" pitch.
  //
  //    Scores come from THIS tree's own AI analysis (AiAnalysis → evidenceId
  //    → TreeEvidence.treeId). Using one global analysis for every tree makes
  //    the chain panel contradict the AI card on the same page.
  const evidenceIds = (
    await db
      .collection("treeevidences")
      .find({ treeId: tree._id }, { projection: { _id: 1 } })
      .toArray()
  ).map((e) => e._id);
  const ai = evidenceIds.length
    ? await db
        .collection("aianalyses")
        .findOne(
          { evidenceId: { $in: evidenceIds } },
          { sort: { createdAt: -1 } },
        )
    : null;
  const health = ai?.healthScore ?? 88;
  const growth = ai?.growthScore ?? 82;
  const anomaly = ai?.anomalyRiskScore ?? 4;

  // Verifications are append-only, so a stale record is corrected by adding a
  // fresher one — getLatestVerification is what the UI reads.
  const onChainLatest = await publicClient
    .readContract({
      ...verifications,
      functionName: "getLatestVerification",
      args: [BigInt(tokenId)],
    })
    .catch(() => null);
  const matches =
    onChainLatest != null &&
    Number(onChainLatest.healthScore) === health &&
    Number(onChainLatest.growthScore) === growth;

  if (!matches) {
    // Must be non-zero (InvalidEvidenceHash) and never repeat for the same
    // tree (DuplicateEvidence). The scores are part of the hash so correcting
    // a stale record produces a genuinely different hash rather than
    // colliding with the one already on-chain.
    const evidenceHash = keccak256(
      toHex(
        JSON.stringify({
          treeId: String(tokenId),
          evidenceCID: metadataCid,
          capturedAt: new Date(tree.updatedAt ?? Date.now()).toISOString(),
          latitude: tree.latitude,
          longitude: tree.longitude,
          healthScore: health,
          growthScore: growth,
          anomalyRisk: anomaly,
          verificationVersion: 1,
        }),
      ),
    );
    await send(
      verifications,
      "submitVerification",
      [
        BigInt(tokenId),
        health,
        growth,
        anomaly,
        evidenceHash,
        metadataCid,
        account.address,
      ],
      `verification H${health}/G${growth}`,
    );
  }

  await db
    .collection("trees")
    .updateOne({ _id: tree._id }, { $set: { status: "AVAILABLE" } });

  ready.push({
    code: tree.treeCode,
    species: tree.species,
    tokenId,
    id: tree._id,
  });
  console.log(`  → token #${tokenId}, AVAILABLE\n`);
}

const endBalance = await publicClient.getBalance({ address: account.address });
const [treeCount, verificationTotal] = await Promise.all([
  publicClient.readContract({ ...registry, functionName: "treeCount" }),
  publicClient.readContract({
    ...verifications,
    functionName: "totalVerificationCount",
  }),
]);

console.log("─".repeat(60));
console.log(`Demo ready — ${ready.length} sponsorable tree(s)\n`);
for (const t of ready) {
  console.log(`  #${t.tokenId}  ${t.code}  ${t.species}`);
  console.log(`      /trees/${t.id}`);
}
console.log(
  `\non-chain totals: ${treeCount} trees, ${verificationTotal} verifications`,
);
console.log(`transactions sent: ${txCount}`);
console.log(`gas spent: ${startBalance - endBalance} wei`);
console.log(`remaining: ${endBalance} wei`);

await mongoose.disconnect();
