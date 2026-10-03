"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import type { TreeStatusNumber } from "@/lib/tree-status";
import { treeRegistry } from "@/lib/web3/contracts";
import { getGasFees } from "@/lib/web3/gas";

export function useUpdateTreeStatus() {
  const config = useConfig();
  const queryClient = useQueryClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [isConfirming, setIsConfirming] = useState(false);

  const updateTreeStatus = async (
    tokenId: bigint,
    newStatus: TreeStatusNumber,
  ) => {
    const fees = await getGasFees(config);

    const hash = await writeContractAsync({
      ...treeRegistry,
      ...fees,
      functionName: "updateTreeStatus",
      args: [tokenId, newStatus],
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

  return { updateTreeStatus, isPending, isConfirming };
}
