"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

export function useEnsureArbitrumSepolia() {
  const { chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const wrongChain = chainId !== undefined && chainId !== arbitrumSepolia.id;
  const switchToArbitrumSepolia = () =>
    switchChain({ chainId: arbitrumSepolia.id });

  return { wrongChain, switchToArbitrumSepolia, isSwitching: isPending };
}
