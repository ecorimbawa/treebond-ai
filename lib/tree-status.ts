import type { TreeStatus as MongoTreeStatus } from "@/models/Tree";

// Numeric enum as stored on-chain (ITreeRegistry.TreeStatus). Mongo's `Tree.status`
// string union already uses these exact names, so this file is the only bridge needed.
export const TREE_STATUS = {
  DRAFT: 0,
  REGISTERED: 1,
  PENDING_VERIFICATION: 2,
  VERIFIED: 3,
  AVAILABLE: 4,
  SPONSORED: 5,
  MONITORING: 6,
  MATURE: 7,
  REJECTED: 8,
  DEAD: 9,
  REMOVED: 10,
  REPLACED: 11,
  DISPUTED: 12,
} as const satisfies Record<MongoTreeStatus, number>;

export type TreeStatusNumber = (typeof TREE_STATUS)[keyof typeof TREE_STATUS];

const NUMBER_TO_STATUS = Object.fromEntries(
  Object.entries(TREE_STATUS).map(([name, value]) => [value, name]),
) as Record<TreeStatusNumber, MongoTreeStatus>;

export function treeStatusToNumber(status: MongoTreeStatus): TreeStatusNumber {
  return TREE_STATUS[status];
}

export function numberToTreeStatus(value: number): MongoTreeStatus {
  const status = NUMBER_TO_STATUS[value as TreeStatusNumber];
  if (!status) throw new Error(`Unknown on-chain tree status: ${value}`);
  return status;
}

export const TREE_STATUS_LABEL: Record<MongoTreeStatus, string> = {
  DRAFT: "Draft",
  REGISTERED: "Registered",
  PENDING_VERIFICATION: "Pending Verification",
  VERIFIED: "Verified",
  AVAILABLE: "Available",
  SPONSORED: "Sponsored",
  MONITORING: "Monitoring",
  MATURE: "Mature",
  REJECTED: "Rejected",
  DEAD: "Dead",
  REMOVED: "Removed",
  REPLACED: "Replaced",
  DISPUTED: "Disputed",
};

// Allowed contract transitions (numeric). Every status 1-11 can also move to
// DISPUTED (12), which is intentionally left out of this map and checked separately.
export const TREE_TRANSITIONS: Record<number, number[]> = {
  1: [2],
  2: [3, 8],
  3: [4],
  4: [5],
  5: [6],
  6: [7, 9],
  7: [9],
  9: [11],
};

export function isTransitionAllowed(from: number, to: number): boolean {
  if (to === TREE_STATUS.DISPUTED) return from >= 1 && from <= 11;
  return TREE_TRANSITIONS[from]?.includes(to) ?? false;
}
