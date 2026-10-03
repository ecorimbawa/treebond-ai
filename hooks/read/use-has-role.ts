import { useReadContract } from "wagmi";
import { treeRegistry, verificationRegistry } from "@/lib/web3/contracts";
import { OPERATOR_ROLE, ORACLE_ROLE, VERIFIER_ROLE } from "@/lib/web3/roles";

export { OPERATOR_ROLE, ORACLE_ROLE, VERIFIER_ROLE };

export function useHasOperatorRole(account?: `0x${string}`) {
  const { data } = useReadContract({
    ...treeRegistry,
    functionName: "hasRole",
    args: account ? [OPERATOR_ROLE, account] : undefined,
    query: { enabled: Boolean(account) },
  });

  return data ?? false;
}

export function useHasVerifierRole(account?: `0x${string}`) {
  const { data } = useReadContract({
    ...treeRegistry,
    functionName: "hasRole",
    args: account ? [VERIFIER_ROLE, account] : undefined,
    query: { enabled: Boolean(account) },
  });

  return data ?? false;
}

export function useHasOracleRole(account?: `0x${string}`) {
  const { data } = useReadContract({
    ...verificationRegistry,
    functionName: "hasRole",
    args: account ? [ORACLE_ROLE, account] : undefined,
    query: { enabled: Boolean(account) },
  });

  return data ?? false;
}
