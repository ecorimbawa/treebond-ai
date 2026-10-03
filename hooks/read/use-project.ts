import { useReadContract } from "wagmi";
import { treeRegistry } from "@/lib/web3/contracts";

export function useOnChainProject(projectId: bigint) {
  const { data, isLoading } = useReadContract({
    ...treeRegistry,
    functionName: "getProject",
    args: [projectId],
    query: { enabled: projectId > 0n },
  });

  return { project: data, isLoading };
}
