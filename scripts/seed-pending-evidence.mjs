#!/usr/bin/env node
// Adds a couple of "pending" TreeEvidence + AiAnalysis records to existing
// seed trees, so the Verifier queue (/verifier) actually has something to
// review — scripts/seed-demo-data.mjs only ever created pre-resolved
// (approved/rejected) evidence, leaving the queue permanently empty.
// Safe to re-run: skips if its marker evidence already exists.
//
// Usage: node scripts/seed-pending-evidence.mjs

import { readFileSync } from "node:fs";
import mongoose from "mongoose";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const uriMatch = envFile.match(/^MONGODB_URI=(.+)$/m);
if (!uriMatch) throw new Error("MONGODB_URI not found in .env.local");
const MONGODB_URI = uriMatch[1].trim();

const UserSchema = new mongoose.Schema({ email: String }, { strict: false });
const TreeSchema = new mongoose.Schema({ treeCode: String }, { strict: false });
const TreeEvidenceSchema = new mongoose.Schema({}, { strict: false });
const AiAnalysisSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model("User", UserSchema);
const Tree = mongoose.model("Tree", TreeSchema);
const TreeEvidence = mongoose.model("TreeEvidence", TreeEvidenceSchema);
const AiAnalysis = mongoose.model("AiAnalysis", AiAnalysisSchema);

const MARKER_CID = "demo-seed-cid-pending-review-batch1";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const existing = await TreeEvidence.findOne({ imageCid: MARKER_CID });
  if (existing) {
    console.log("Pending evidence already seeded — skipping.");
    await mongoose.disconnect();
    return;
  }

  const operator = await User.findOne({ email: "demo-operator@treebond.seed" });
  if (!operator) {
    throw new Error(
      "demo-operator@treebond.seed not found — run scripts/seed-demo-data.mjs first.",
    );
  }

  const targets = await Tree.find({
    treeCode: { $in: ["TREE-JTG-000001", "TREE-JTM-000001"] },
  });
  if (targets.length === 0) {
    throw new Error(
      "Seed trees not found — run scripts/seed-demo-data.mjs first.",
    );
  }

  for (const tree of targets) {
    const evidence = await TreeEvidence.create({
      treeId: tree._id,
      type: "MONITORING",
      imageCid: `${MARKER_CID}-${tree.treeCode}`,
      latitude: tree.latitude,
      longitude: tree.longitude,
      capturedAt: new Date(),
      submittedBy: operator._id,
      status: "pending",
    });
    await AiAnalysis.create({
      evidenceId: evidence._id,
      treeDetected: true,
      treeConfidence: 0.95,
      healthScore: 88,
      growthScore: 82,
      anomalyRisk: "LOW",
      anomalyRiskScore: 12,
      diseaseDetected: false,
      explanation: "Routine monitoring upload, awaiting verifier review.",
      modelName: "demo-seed-data",
      modelVersion: "v0",
    });
    console.log(`Seeded pending evidence for ${tree.treeCode}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
