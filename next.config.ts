import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  turbopack: {
    // @wagmi/connectors' baseAccount connector (bundled inside RainbowKit's
    // dist regardless of the `wallets` list in lib/web3/config.ts, which only
    // lists MetaMask/WalletConnect/injected) pulls in @coinbase/cdp-sdk, which
    // statically imports a dozen @x402/* payment-protocol subpaths that
    // aren't installed. We never use the Base Account connector, so stub the
    // whole package instead of chasing each broken subpath individually.
    resolveAlias: {
      "@base-org/account": "./lib/web3/empty-module.js",
    },
  },
};

export default nextConfig;
