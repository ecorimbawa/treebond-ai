// @/lib/siwe.ts
// Sign-In with Ethereum (EIP-4361) plumbing shared by the auth provider and
// the wallet-linking routes. Both flows prove the same thing — "this browser
// controls this address right now" — so they share one nonce cookie, one
// statement format and one verification path.
import "server-only";

import { cookies } from "next/headers";
import {
  generateSiweNonce,
  parseSiweMessage,
  verifySiweMessage,
} from "viem/siwe";
import { CHAIN_ID } from "@/contracts/generated/addresses";
import { serverClient } from "@/lib/web3/server-client";

export const NONCE_COOKIE = "treebond.siwe-nonce";
const NONCE_TTL_SECONDS = 10 * 60;

/**
 * Issues a nonce and stores it in an httpOnly cookie. Keeping it in a cookie
 * instead of a table means no shared store is needed and a replayed signature
 * can't be reused from a different browser.
 */
export async function issueNonce() {
  const nonce = generateSiweNonce();
  const store = await cookies();
  store.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: NONCE_TTL_SECONDS,
  });
  return nonce;
}

type VerifyResult =
  | { ok: true; address: `0x${string}` }
  | { ok: false; error: string };

/**
 * Verifies a SIWE signature against the nonce this browser was issued, then
 * burns the nonce so the same signature can't be replayed. Returns the
 * recovered address lowercased by the caller — never trusts an address the
 * client claims separately from the signed message.
 */
export async function verifySignIn({
  message,
  signature,
}: {
  message: string;
  signature: string;
}): Promise<VerifyResult> {
  const store = await cookies();
  const expectedNonce = store.get(NONCE_COOKIE)?.value;
  if (!expectedNonce) {
    return { ok: false, error: "Sign-in request expired — please try again." };
  }

  let parsed: ReturnType<typeof parseSiweMessage>;
  try {
    parsed = parseSiweMessage(message);
  } catch {
    return { ok: false, error: "Malformed sign-in message." };
  }

  if (!parsed.address) {
    return { ok: false, error: "Sign-in message has no address." };
  }
  // The chain is pinned because every contract this app talks to only exists
  // on Arbitrum Sepolia; a signature scoped to another chain shouldn't grant
  // a session here.
  if (parsed.chainId !== CHAIN_ID) {
    return { ok: false, error: "Wrong network — switch to Arbitrum Sepolia." };
  }

  let valid = false;
  try {
    valid = await verifySiweMessage(serverClient, {
      message,
      signature: signature as `0x${string}`,
      nonce: expectedNonce,
    });
  } catch {
    return { ok: false, error: "Could not verify that signature." };
  }

  // Burn the nonce whether or not the signature checked out, so a failed
  // attempt can't be retried against the same challenge.
  try {
    store.delete(NONCE_COOKIE);
  } catch {
    // Some runtimes disallow cookie writes here; the short TTL still bounds it.
  }

  if (!valid) {
    return { ok: false, error: "Signature did not match that wallet." };
  }

  return { ok: true, address: parsed.address };
}
