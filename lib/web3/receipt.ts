import "server-only";

import { TransactionReceiptNotFoundError } from "viem";
import { serverClient } from "@/lib/web3/server-client";

/**
 * Fetches a receipt, tolerating the gap between "the user's wallet saw it" and
 * "our RPC node saw it".
 *
 * This matters more than it looks: the browser only POSTs a txHash here after
 * its own `waitForTransactionReceipt` resolved, so the transaction is already
 * mined and the gas already spent. A single lookup that happens to land on a
 * node lagging a block answered "not confirmed yet" and the UI gave up —
 * leaving a real on-chain project or tree that Mongo never recorded, with no
 * way to recover it from the app.
 */
export async function getReceiptWithRetry(
  hash: `0x${string}`,
  { attempts = 5, delayMs = 1200 } = {},
) {
  let lastNotFound: unknown = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await serverClient.getTransactionReceipt({ hash });
    } catch (error) {
      if (!(error instanceof TransactionReceiptNotFoundError)) throw error;
      lastNotFound = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastNotFound;
}
