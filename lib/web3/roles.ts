import { keccak256, toHex } from "viem";

export const OPERATOR_ROLE = keccak256(toHex("OPERATOR_ROLE"));
export const VERIFIER_ROLE = keccak256(toHex("VERIFIER_ROLE"));
export const ORACLE_ROLE = keccak256(toHex("ORACLE_ROLE"));
