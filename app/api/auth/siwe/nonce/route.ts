import { NextResponse } from "next/server";
import { issueNonce } from "@/lib/siwe";

// One nonce per sign-in or wallet-link attempt. Must not be cached — a reused
// nonce is exactly what the cookie check is there to prevent.
export const dynamic = "force-dynamic";

export async function GET() {
  const nonce = await issueNonce();
  return NextResponse.json({ success: true, data: { nonce } }, { status: 200 });
}
