import { useReadContract } from "wagmi";
import { treeNFT } from "@/lib/web3/contracts";

export function useTreeOwner(tokenId: bigint) {
  const { data, isLoading } = useReadContract({
    ...treeNFT,
    functionName: "ownerOf",
    args: [tokenId],
    // reverts (ERC721NonexistentToken) until the tree is sponsored/minted
    query: { enabled: tokenId > 0n, retry: false },
  });

  return { owner: data, isLoading };
}
