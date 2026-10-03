import { arbitrumSepolia } from "wagmi/chains";
import { CONTRACTS } from "@/contracts/generated/addresses";
import { TreeBondAbi } from "@/lib/web3/abis/TreeBond";
import { TreeNFTAbi } from "@/lib/web3/abis/TreeNFT";
import { TreeRegistryAbi } from "@/lib/web3/abis/TreeRegistry";
import { VerificationRegistryAbi } from "@/lib/web3/abis/VerificationRegistry";

export const treeRegistry = {
  address: CONTRACTS.treeRegistry,
  abi: TreeRegistryAbi,
  chainId: arbitrumSepolia.id,
} as const;

export const treeNFT = {
  address: CONTRACTS.treeNFT,
  abi: TreeNFTAbi,
  chainId: arbitrumSepolia.id,
} as const;

export const treeBond = {
  address: CONTRACTS.treeBond,
  abi: TreeBondAbi,
  chainId: arbitrumSepolia.id,
} as const;

export const verificationRegistry = {
  address: CONTRACTS.verificationRegistry,
  abi: VerificationRegistryAbi,
  chainId: arbitrumSepolia.id,
} as const;
