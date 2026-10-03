import { useReadContract } from "wagmi";
import { treeRegistry } from "@/lib/web3/contracts";

export function useTreeCounts() {
  const { data: treeCount } = useReadContract({
    ...treeRegistry,
    functionName: "treeCount",
  });

  const { data: projectCount } = useReadContract({
    ...treeRegistry,
    functionName: "projectCount",
  });

  return { treeCount: treeCount ?? 0n, projectCount: projectCount ?? 0n };
}
