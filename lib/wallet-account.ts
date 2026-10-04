// @/lib/wallet-account.ts
import "server-only";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { CHAIN_ID } from "@/contracts/generated/addresses";
import { connectDB } from "@/lib/db/connection";
import { type IUser, User, Wallet } from "@/models";

/** Synthetic address for wallet-first accounts — see User.placeholderEmail. */
export function placeholderEmailFor(address: string) {
  return `${address.toLowerCase()}@wallet.treebond.local`;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Resolves a verified wallet address to the account it belongs to, creating a
 * sponsor account on first sight. Self-registration is sponsor-only, same rule
 * as POST /api/auth/register — an operator or admin who signs in with a wallet
 * already linked to their account keeps their own role, they just can't earn
 * one by connecting a new wallet.
 */
export async function findOrCreateWalletUser(address: `0x${string}`) {
  await connectDB();
  const normalized = address.toLowerCase();

  const existingLink = await Wallet.findOne({ address: normalized });
  if (existingLink) {
    const user = await User.findById(existingLink.userId);
    if (user) return user as IUser & { _id: { toString(): string } };
    // Orphaned link (user deleted from /admin/users): drop it and fall
    // through to creating a fresh sponsor account for this wallet.
    await Wallet.deleteOne({ _id: existingLink._id });
  }

  // Password is unguessable rather than absent: `password` is required by the
  // schema, and a random hash means the email provider can never authenticate
  // this account until the owner sets a real one from /dashboard/settings.
  const user = await User.create({
    email: placeholderEmailFor(normalized),
    password: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
    fullName: `Sponsor ${shortAddress(address)}`,
    role: "sponsor",
    placeholderEmail: true,
  });

  await Wallet.create({
    userId: user._id,
    address: normalized,
    chainId: CHAIN_ID,
    isPrimary: true,
    verifiedAt: new Date(),
  });

  return user as IUser & { _id: { toString(): string } };
}

/**
 * Every address this account has proven control of. The sponsor dashboard
 * scopes by this list rather than by whichever wallet happens to be connected,
 * so a sponsor with two wallets sees one portfolio.
 */
export async function linkedAddressesFor(userId: string) {
  await connectDB();
  const wallets = await Wallet.find({ userId }).sort({
    isPrimary: -1,
    createdAt: 1,
  });
  return wallets.map((w) => w.address.toLowerCase());
}
