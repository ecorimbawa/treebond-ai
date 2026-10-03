import { useReadContract } from "wagmi";
import { verificationRegistry } from "@/lib/web3/contracts";

export function useLatestVerification(treeId: bigint) {
  const { data, isLoading, isError } = useReadContract({
    ...verificationRegistry,
    functionName: "getLatestVerification",
    args: [treeId],
    // retry: false because the contract reverts NoVerificationFound when none exists yet
    query: { enabled: treeId > 0n, retry: false },
  });

  return { verification: data, isLoading, notFound: isError };
}
