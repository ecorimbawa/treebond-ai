import { TREE_STATUS_LABEL } from "@/lib/tree-status";
import type { TreeStatus } from "@/models/Tree";

const statusBucket: Record<TreeStatus, "good" | "warn" | "bad"> = {
  DRAFT: "warn",
  REGISTERED: "good",
  PENDING_VERIFICATION: "warn",
  VERIFIED: "good",
  AVAILABLE: "good",
  SPONSORED: "good",
  MONITORING: "warn",
  MATURE: "good",
  REJECTED: "bad",
  DEAD: "bad",
  REMOVED: "bad",
  REPLACED: "bad",
  DISPUTED: "bad",
};

const bucketStyles = {
  good: "bg-[#DDEEE3] text-[#246B45]",
  warn: "bg-[#FBEFD9] text-[#B7791F]",
  bad: "bg-[#F7E1DE] text-[#B3402F]",
} as const;

export function TreeStatusPill({ status }: { status: TreeStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${bucketStyles[statusBucket[status]]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {TREE_STATUS_LABEL[status].toUpperCase()}
    </span>
  );
}
