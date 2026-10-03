import { useReadContract } from "wagmi";
import { treeBond } from "@/lib/web3/contracts";

export function useTreePrice(treeId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    ...treeBond,
    functionName: "getTreePrice",
    args: [treeId],
    query: { enabled: treeId > 0n },
  });

  return { price: data ?? 0n, isLoading, refetch };
}
