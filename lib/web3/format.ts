import { formatEther, parseEther } from "viem";

const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://ipfs.io/ipfs";

export function formatEth(wei: bigint, digits = 4): string {
  const value = Number(formatEther(wei));
  return `${value.toFixed(digits)} ETH`;
}

export function ethToWei(eth: string): bigint {
  return parseEther(eth);
}

export function toIpfsUrl(uri: string): string {
  return uri.startsWith("ipfs://")
    ? `${IPFS_GATEWAY}/${uri.slice("ipfs://".length)}`
    : uri;
}

export function formatTimestamp(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleString();
}

// The contract stores lat/lng as int64 microdegrees (degrees * 1e6).
export function toMicrodegrees(degrees: number): bigint {
  return BigInt(Math.round(degrees * 1e6));
}

export function fromMicrodegrees(value: bigint): number {
  return Number(value) / 1e6;
}
