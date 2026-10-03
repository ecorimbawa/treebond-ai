import { useReadContract } from "wagmi";
import { treeRegistry } from "@/lib/web3/contracts";

export function useTree(treeId: bigint) {
  const { data, isLoading, isError, refetch } = useReadContract({
    ...treeRegistry,
    functionName: "getTree",
    args: [treeId],
    query: { enabled: treeId > 0n },
  });

  return { tree: data, isLoading, isError, refetch };
}
