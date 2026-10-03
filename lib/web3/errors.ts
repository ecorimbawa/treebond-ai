import {
  BaseError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
} from "viem";

const REVERT_MESSAGE: Record<string, string> = {
  ZeroAddress: "Address cannot be empty.",
  EmptyString: "Required field cannot be empty.",
  ProjectNotFound: "Project not found.",
  ProjectNotActive: "Project is not active.",
  TreeNotFound: "Tree not found.",
  InvalidTreeStatus: "That status transition is not allowed.",
  TreeNotAvailable: "Tree is not AVAILABLE yet and cannot be sponsored.",
  PriceNotSet: "Sponsorship price has not been set.",
  IncorrectPayment: "Payment amount does not exactly match the tree price.",
  InvalidPlatformFee: "Platform fee exceeds the 20% cap.",
  NothingToWithdraw: "There is no balance to withdraw.",
  TransferFailed: "ETH transfer failed.",
  AlreadyMinted: "This tree's NFT has already been minted.",
  InvalidScore: "Score must be between 0 and 100.",
  InvalidEvidenceHash: "Evidence hash is invalid.",
  DuplicateEvidence: "This evidence hash was already submitted for this tree.",
  VerificationNotFound: "Verification record not found.",
  NoVerificationFound: "This tree has no verification yet.",
  LimitTooHigh: "Pagination limit is capped at 50.",
  AccessControlUnauthorizedAccount:
    "This wallet does not hold the required role.",
};

export function getContractErrorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    const revert = error.walk(
      (e) => e instanceof ContractFunctionRevertedError,
    );
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName ?? "";
      return REVERT_MESSAGE[name] ?? revert.shortMessage;
    }

    const rejected = error.walk((e) => e instanceof UserRejectedRequestError);
    if (rejected) return "Transaction was rejected in the wallet.";

    return error.shortMessage;
  }

  return error instanceof Error ? error.message : "An unknown error occurred.";
}
