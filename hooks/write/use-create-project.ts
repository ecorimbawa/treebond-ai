"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { treeRegistry } from "@/lib/web3/contracts";

export function useCreateProject() {
  const config = useConfig();
  const queryClient = useQueryClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [isConfirming, setIsConfirming] = useState(false);

  const createProject = async (
    code: string,
    name: string,
    metadataCID: string,
    operator: `0x${string}`,
  ) => {
    // No maxFeePerGas override: the wallet estimates. An explicit value here
    // was being rendered by MetaMask as if it were gwei rather than wei,
    // quoting ~56,000 ETH for a transaction that actually costs a fraction of
    // a cent, which left the confirm button permanently disabled.
    const hash = await writeContractAsync({
      ...treeRegistry,
      functionName: "createProject",
      args: [code, name, metadataCID, operator],
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

  return { createProject, isPending, isConfirming };
}
