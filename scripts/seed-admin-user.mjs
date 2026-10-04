#!/usr/bin/env node
// One-off: creates a login-ready admin account so /admin (and its "Grant
// On-Chain Role" form) is actually reachable without hand-editing MongoDB.
// Separate from seed-demo-data.mjs so re-running it never touches tree/project
// seed data — it only checks for its own email.
//
// Usage: node scripts/seed-admin-user.mjs

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
const User = mongoose.model("User", UserSchema);

const EMAIL = "demo-admin@treebond.seed";
const PASSWORD = "demo-seed-not-a-real-login";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const existing = await User.findOne({ email: EMAIL });
  if (existing) {
    console.log(`Admin user already exists (${EMAIL}) — nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  await User.create({
    email: EMAIL,
    password: await bcrypt.hash(PASSWORD, 10),
    fullName: "Demo Admin",
    role: "admin",
  });

  console.log("Admin user created. Login at /login with:");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
  console.log(
    "\nFrom here, everything else (new operators/verifiers/admins) can go",
    "through /admin/users — this script only exists to bootstrap the first one.",
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
