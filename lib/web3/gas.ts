import type { Config } from "wagmi";
import { estimateFeesPerGas } from "wagmi/actions";
import { arbitrumSepolia } from "wagmi/chains";

export async function getGasFees(
  config: Config,
  chainId: number = arbitrumSepolia.id,
) {
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    config,
    { chainId },
  );

  // 2x buffer so the tx doesn't go "underpriced" if base fee rises before it lands
  return { maxFeePerGas: maxFeePerGas * 2n, maxPriorityFeePerGas };
}
