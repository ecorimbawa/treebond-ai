#!/usr/bin/env node
// One-off: applies real demo content on top of the seeded/generated tree
// data — a species-matched cover photo for every tree, plus corrected
// location/planting data for the two trees currently AVAILABLE on-chain.
//
// Photo storage: Tree.metadataCid, reusing the exact field
// RegisterTreeForm's ImageUploadField already writes a real upload into —
// nothing currently reads this field as authoritative on-chain data for
// display (the chain panel reads token/status/price/owner straight from the
// contract), so repurposing it as "the display photo" doesn't conflict with
// anything. For already-registered trees this only updates Mongo's copy —
// the CID actually written to TreeRegistry at registerTree() time doesn't
// change, which is fine since nothing renders that on-chain value either.
//
// Gateway choice: the public ipfs.io gateway was returning 429 (rate
// limited) for all three CIDs when this was written, so this stores the
// full Pinata dedicated-gateway URL directly rather than an `ipfs://` URI —
// confirmed 200 + image/jpeg on all three before writing anything.
//
// Usage: node scripts/apply-tree-updates.mjs

import { readFileSync } from "node:fs";
import mongoose from "mongoose";

const GATEWAY = "https://salmon-rational-tortoise-368.mypinata.cloud/ipfs";
const PHOTO_BY_SPECIES = {
  Sengon: `${GATEWAY}/bafybeibtq4uwrduwjg3pe6c5m5u6ikoajndqr6p4qikqgemenmafijeczu`,
  Mahogany: `${GATEWAY}/bafybeia6fjzrh7phxyelk3aviyhs5ph4yuxnr4xbbcm6c3ioqfmbo5kp3y`,
  Teak: `${GATEWAY}/bafybeibcsslhx3f2qz5rknsytvlgw5vkkm2v4c5erzdhbrsgysdqgrry2y`,
};

// Only the two rows from the user's 10-tree list that are currently
// AVAILABLE on-chain — the other 8 are already SPONSORED/MONITORING/MATURE/
// DEAD and weren't touched, since overwriting a sponsored tree's recorded
// location/planting data would misrepresent an asset someone already owns.
const FIELD_CORRECTIONS = [
  {
    treeCode: "TREE-JTG-000006",
    latitude: -7.8462,
    longitude: 110.9173,
    plantedAt: new Date("2026-01-27"),
    initialHeightCm: 103,
  },
  {
    treeCode: "TREE-JTM-000001",
    latitude: -7.9186,
    longitude: 112.1482,
    plantedAt: new Date("2026-03-05"),
    initialHeightCm: 91,
  },
];

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const uri = env.match(/^MONGODB_URI=(.+)$/m)[1].trim();

await mongoose.connect(uri);
const trees = mongoose.connection.db.collection("trees");

console.log("1. Cover photo by species (all trees)");
for (const [species, url] of Object.entries(PHOTO_BY_SPECIES)) {
  const res = await trees.updateMany(
    { species },
    { $set: { metadataCid: url } },
  );
  console.log(
    `   ${species.padEnd(10)} matched=${res.matchedCount} modified=${res.modifiedCount}`,
  );
}

console.log("\n2. Field corrections (AVAILABLE trees only)");
for (const { treeCode, ...fields } of FIELD_CORRECTIONS) {
  const before = await trees.findOne({ treeCode });
  if (!before) {
    console.log(`   ${treeCode} — not found, skipped`);
    continue;
  }
  await trees.updateOne({ treeCode }, { $set: fields });
  const grew = before.currentHeightCm - fields.initialHeightCm;
  console.log(
    `   ${treeCode} — initialHeightCm ${before.initialHeightCm} → ${fields.initialHeightCm}` +
      (grew < 0
        ? `  ⚠ currentHeightCm is still ${before.currentHeightCm} — this tree now reads as having SHRUNK ${-grew}cm`
        : ``),
  );
}

await mongoose.disconnect();
console.log("\nDone.");
