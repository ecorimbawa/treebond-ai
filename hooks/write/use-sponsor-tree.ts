"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { treeBond } from "@/lib/web3/contracts";
import { getGasFees } from "@/lib/web3/gas";

export function useSponsorTree() {
  const config = useConfig();
  const queryClient = useQueryClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [isConfirming, setIsConfirming] = useState(false);

  const sponsorTree = async (tokenId: bigint, price: bigint) => {
    const fees = await getGasFees(config);

    const hash = await writeContractAsync({
      ...treeBond,
      ...fees,
      functionName: "sponsorTree",
      args: [tokenId],
      // must match getTreePrice(tokenId) exactly; anything else reverts IncorrectPayment
      value: price,
    });

    setIsConfirming(true);
    try {
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted on-chain.");
      }
      await queryClient.invalidateQueries();
      return hash;
    } finally {
      setIsConfirming(false);
    }
  };

  return { sponsorTree, isPending, isConfirming };
}
