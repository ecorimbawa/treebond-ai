import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "TreeBond AI",
  // "YOUR_PROJECT_ID" is RainbowKit's own documented placeholder — it
  // substitutes a shared example project ID for it automatically. An empty
  // string (unset env var) must hit that branch too, hence `||` not `??`.
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL, {
      batch: true,
    }),
  },
  // Explicit wallet list (PRD §16: MetaMask, injected wallets, WalletConnect).
  // RainbowKit's default list also includes Coinbase/Base Account, which drags
  // in @coinbase/cdp-sdk's broken optional x402 dynamic imports at build time.
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, walletConnectWallet, injectedWallet],
    },
  ],
  ssr: true,
});
