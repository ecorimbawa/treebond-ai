#!/usr/bin/env node
// One-off seed for previewing /explore, /trees/[treeId], /projects/[projectId]
// with real MongoDB data instead of empty states. Safe to re-run: it checks
// for existing seed projects by slug and skips if already present.
//
// Usage: node scripts/seed-demo-data.mjs

import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const uriMatch = envFile.match(/^MONGODB_URI=(.+)$/m);
if (!uriMatch) throw new Error("MONGODB_URI not found in .env.local");
const MONGODB_URI = uriMatch[1].trim();

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: ["sponsor", "operator", "verifier", "admin"],
      default: "sponsor",
    },
  },
  { timestamps: true },
);
const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    country: String,
    province: String,
    regency: String,
    village: String,
    latitude: Number,
    longitude: Number,
    areaHectares: Number,
    targetTreeCount: Number,
    status: { type: String, default: "active" },
    coverImageCid: { type: String, default: null },
    onChainProjectId: { type: Number, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
const TreeSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    treeCode: { type: String, unique: true },
    species: String,
    latitude: Number,
    longitude: Number,
    plantedAt: Date,
    initialHeightCm: Number,
    currentHeightCm: Number,
    status: { type: String, default: "DRAFT" },
    tokenId: { type: Number, default: null },
    contractAddress: { type: String, default: null },
    metadataCid: { type: String, default: null },
    ownerWallet: { type: String, default: null, lowercase: true },
  },
  { timestamps: true },
);
const TreeEvidenceSchema = new mongoose.Schema(
  {
    treeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tree",
      required: true,
    },
    type: String,
    imageCid: String,
    metadataCid: { type: String, default: null },
    latitude: Number,
    longitude: Number,
    capturedAt: Date,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: { type: String, default: "pending" },
  },
  { timestamps: true },
);
const AiAnalysisSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TreeEvidence",
      required: true,
    },
    treeDetected: Boolean,
    treeConfidence: Number,
    healthScore: Number,
    growthScore: Number,
    anomalyRisk: String,
    anomalyRiskScore: Number,
    diseaseDetected: Boolean,
    explanation: String,
    modelName: String,
    modelVersion: String,
  },
  { timestamps: true },
);
const VerificationSchema = new mongoose.Schema(
  {
    treeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tree",
      required: true,
    },
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TreeEvidence",
      required: true,
    },
    aiAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiAnalysis",
      required: true,
    },
    verifierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: { type: String, default: "PENDING" },
    verificationScore: Number,
    decision: String,
    reason: String,
    txHash: { type: String, default: null },
    blockNumber: { type: Number, default: null },
    onChainTimestamp: { type: Date, default: null },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
const Project = mongoose.model("Project", ProjectSchema);
const Tree = mongoose.model("Tree", TreeSchema);
const TreeEvidence = mongoose.model("TreeEvidence", TreeEvidenceSchema);
const AiAnalysis = mongoose.model("AiAnalysis", AiAnalysisSchema);
const Verification = mongoose.model("Verification", VerificationSchema);

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to", mongoose.connection.name);

  const existing = await Project.findOne({
    slug: "central-java-reforestation-001",
  });
  if (existing) {
    console.log(
      "Seed data already present (found central-java-reforestation-001) — skipping.",
    );
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash("demo-seed-not-a-real-login", 10);
  const operator = await User.create({
    email: "demo-operator@treebond.seed",
    password: passwordHash,
    fullName: "Budi Santoso",
    role: "operator",
  });
  const verifier = await User.create({
    email: "demo-verifier@treebond.seed",
    password: passwordHash,
    fullName: "Siti Rahma",
    role: "verifier",
  });
  console.log("Seeded 2 reference users (not meant for login).");

  const projectCJ = await Project.create({
    name: "Central Java Reforestation #001",
    slug: "central-java-reforestation-001",
    description:
      "Community-led reforestation across degraded hillside plots in Wonosobo, Central Java — mixed Sengon and Mahogany planting for soil stabilization and future timber revenue.",
    country: "Indonesia",
    province: "Jawa Tengah",
    regency: "Wonosobo",
    village: "Kalikajar",
    latitude: -7.3695,
    longitude: 109.9024,
    areaHectares: 5,
    targetTreeCount: 5000,
    status: "active",
    createdBy: operator._id,
  });

  const projectEJ = await Project.create({
    name: "Teak Highlands — East Java",
    slug: "teak-highlands-east-java",
    description:
      "Long-rotation teak (Jati) plantation on smallholder land in Bojonegoro, East Java, monitored jointly with the local farmer cooperative.",
    country: "Indonesia",
    province: "Jawa Timur",
    regency: "Bojonegoro",
    village: "Ngasem",
    latitude: -7.15,
    longitude: 111.8818,
    areaHectares: 3.2,
    targetTreeCount: 1200,
    status: "active",
    createdBy: operator._id,
  });
  console.log("Seeded 2 projects.");

  const trees = await Tree.insertMany([
    {
      projectId: projectCJ._id,
      treeCode: "TREE-JTG-000001",
      species: "Sengon",
      latitude: -7.3701,
      longitude: 109.903,
      plantedAt: monthsAgo(8),
      initialHeightCm: 40,
      currentHeightCm: 180,
      status: "AVAILABLE",
    },
    {
      projectId: projectCJ._id,
      treeCode: "TREE-JTG-000002",
      species: "Sengon",
      latitude: -7.3688,
      longitude: 109.9041,
      plantedAt: monthsAgo(7),
      initialHeightCm: 38,
      currentHeightCm: 165,
      status: "AVAILABLE",
    },
    {
      projectId: projectCJ._id,
      treeCode: "TREE-JTG-000003",
      species: "Mahogany",
      latitude: -7.371,
      longitude: 109.9015,
      plantedAt: monthsAgo(10),
      initialHeightCm: 45,
      currentHeightCm: 210,
      status: "SPONSORED",
      ownerWallet: "0x1111111111111111111111111111111111aaaa",
    },
    {
      projectId: projectCJ._id,
      treeCode: "TREE-JTG-000004",
      species: "Mahogany",
      latitude: -7.3693,
      longitude: 109.9052,
      plantedAt: monthsAgo(11),
      initialHeightCm: 42,
      currentHeightCm: 225,
      status: "MONITORING",
    },
    {
      projectId: projectCJ._id,
      treeCode: "TREE-JTG-000005",
      species: "Sengon",
      latitude: -7.3685,
      longitude: 109.9008,
      plantedAt: monthsAgo(6),
      initialHeightCm: 35,
      currentHeightCm: 150,
      status: "VERIFIED",
    },
    {
      projectId: projectCJ._id,
      treeCode: "TREE-JTG-000006",
      species: "Teak",
      latitude: -7.372,
      longitude: 109.906,
      plantedAt: monthsAgo(2),
      initialHeightCm: 25,
      currentHeightCm: 55,
      status: "REGISTERED",
    },
    {
      projectId: projectCJ._id,
      treeCode: "TREE-JTG-000007",
      species: "Mahogany",
      latitude: -7.3678,
      longitude: 109.9035,
      plantedAt: monthsAgo(14),
      initialHeightCm: 48,
      currentHeightCm: 290,
      status: "MATURE",
    },
    {
      projectId: projectEJ._id,
      treeCode: "TREE-JTM-000001",
      species: "Teak",
      latitude: -7.1508,
      longitude: 111.8825,
      plantedAt: monthsAgo(5),
      initialHeightCm: 30,
      currentHeightCm: 95,
      status: "AVAILABLE",
    },
    {
      projectId: projectEJ._id,
      treeCode: "TREE-JTM-000002",
      species: "Teak",
      latitude: -7.1492,
      longitude: 111.8803,
      plantedAt: monthsAgo(9),
      initialHeightCm: 33,
      currentHeightCm: 140,
      status: "SPONSORED",
      ownerWallet: "0x2222222222222222222222222222222222bbbb",
    },
    {
      projectId: projectEJ._id,
      treeCode: "TREE-JTM-000003",
      species: "Teak",
      latitude: -7.1515,
      longitude: 111.884,
      plantedAt: monthsAgo(12),
      initialHeightCm: 31,
      currentHeightCm: 110,
      status: "DEAD",
    },
  ]);
  console.log(`Seeded ${trees.length} trees.`);

  const byCode = Object.fromEntries(trees.map((t) => [t.treeCode, t]));

  async function addEvidenceChain(tree, entries) {
    for (const entry of entries) {
      const evidence = await TreeEvidence.create({
        treeId: tree._id,
        type: entry.type,
        imageCid: entry.imageCid,
        latitude: tree.latitude,
        longitude: tree.longitude,
        capturedAt: entry.capturedAt,
        submittedBy: operator._id,
        status: entry.evidenceStatus,
      });
      const ai = await AiAnalysis.create({
        evidenceId: evidence._id,
        treeDetected: true,
        treeConfidence: entry.treeConfidence,
        healthScore: entry.healthScore,
        growthScore: entry.growthScore,
        anomalyRisk: entry.anomalyRisk,
        anomalyRiskScore: entry.anomalyRiskScore,
        diseaseDetected: false,
        explanation: entry.explanation,
        modelName: "demo-seed-data",
        modelVersion: "v0",
      });
      if (entry.verification) {
        await Verification.create({
          treeId: tree._id,
          evidenceId: evidence._id,
          aiAnalysisId: ai._id,
          verifierId: verifier._id,
          status: entry.verification.status,
          verificationScore: Math.round(
            (entry.healthScore + entry.growthScore) / 2,
          ),
          decision: entry.verification.decision,
          reason: entry.verification.reason,
        });
      }
    }
  }

  await addEvidenceChain(byCode["TREE-JTG-000005"], [
    {
      type: "INITIAL_PLANTING",
      imageCid: "demo-seed-cid-jtg5-planting",
      capturedAt: monthsAgo(6),
      evidenceStatus: "approved",
      treeConfidence: 0.97,
      healthScore: 92,
      growthScore: 85,
      anomalyRisk: "LOW",
      anomalyRiskScore: 8,
      explanation:
        "Sapling planted and confirmed at registered coordinates, visibly healthy.",
      verification: {
        status: "APPROVED",
        decision: "approved",
        reason: "Tree confirmed healthy, GPS matches registration.",
      },
    },
  ]);

  await addEvidenceChain(byCode["TREE-JTG-000004"], [
    {
      type: "INITIAL_PLANTING",
      imageCid: "demo-seed-cid-jtg4-planting",
      capturedAt: monthsAgo(11),
      evidenceStatus: "approved",
      treeConfidence: 0.98,
      healthScore: 90,
      growthScore: 80,
      anomalyRisk: "LOW",
      anomalyRiskScore: 6,
      explanation: "Initial planting evidence consistent with project records.",
      verification: {
        status: "APPROVED",
        decision: "approved",
        reason: "Initial planting verified.",
      },
    },
    {
      type: "MONITORING",
      imageCid: "demo-seed-cid-jtg4-monitoring",
      capturedAt: monthsAgo(3),
      evidenceStatus: "approved",
      treeConfidence: 0.95,
      healthScore: 88,
      growthScore: 91,
      anomalyRisk: "LOW",
      anomalyRiskScore: 10,
      explanation: "Strong growth since last check, foliage dense and uniform.",
      verification: {
        status: "APPROVED",
        decision: "approved",
        reason: "Growth trajectory consistent with species baseline.",
      },
    },
  ]);

  await addEvidenceChain(byCode["TREE-JTG-000007"], [
    {
      type: "INITIAL_PLANTING",
      imageCid: "demo-seed-cid-jtg7-planting",
      capturedAt: monthsAgo(14),
      evidenceStatus: "approved",
      treeConfidence: 0.99,
      healthScore: 94,
      growthScore: 88,
      anomalyRisk: "LOW",
      anomalyRiskScore: 4,
      explanation: "Healthy sapling, no visible stress.",
      verification: {
        status: "APPROVED",
        decision: "approved",
        reason: "Baseline planting confirmed.",
      },
    },
    {
      type: "HEALTH_CHECK",
      imageCid: "demo-seed-cid-jtg7-healthcheck",
      capturedAt: monthsAgo(1),
      evidenceStatus: "approved",
      treeConfidence: 0.99,
      healthScore: 97,
      growthScore: 95,
      anomalyRisk: "LOW",
      anomalyRiskScore: 2,
      explanation:
        "Mature canopy, excellent trunk development, no disease markers.",
      verification: {
        status: "APPROVED",
        decision: "approved",
        reason: "Tree has reached maturity benchmarks for species and age.",
      },
    },
  ]);

  await addEvidenceChain(byCode["TREE-JTM-000002"], [
    {
      type: "INITIAL_PLANTING",
      imageCid: "demo-seed-cid-jtm2-planting",
      capturedAt: monthsAgo(9),
      evidenceStatus: "approved",
      treeConfidence: 0.96,
      healthScore: 89,
      growthScore: 82,
      anomalyRisk: "LOW",
      anomalyRiskScore: 9,
      explanation: "Planting confirmed, healthy start.",
      verification: {
        status: "APPROVED",
        decision: "approved",
        reason: "Initial planting verified.",
      },
    },
    {
      type: "MONITORING",
      imageCid: "demo-seed-cid-jtm2-monitoring-blurry",
      capturedAt: monthsAgo(2),
      evidenceStatus: "rejected",
      treeConfidence: 0.41,
      healthScore: 60,
      growthScore: 55,
      anomalyRisk: "MEDIUM",
      anomalyRiskScore: 48,
      explanation:
        "Image too blurry and GPS reading drifted ~80m from registered location; resubmission requested.",
      verification: {
        status: "REJECTED",
        decision: "rejected",
        reason:
          "GPS mismatch exceeds tolerance and photo quality insufficient for scoring.",
      },
    },
  ]);

  console.log("Seeded evidence/AI analysis/verification chains for 4 trees.");
  console.log("\nDone. Preview URLs (replace with your dev/deploy host):");
  console.log("  /explore");
  for (const t of trees) console.log(`  /trees/${t._id}  (${t.treeCode})`);
  console.log(`  /projects/${projectCJ._id}  (${projectCJ.name})`);
  console.log(`  /projects/${projectEJ._id}  (${projectEJ.name})`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
