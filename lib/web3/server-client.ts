import "server-only";

import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const serverClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});
