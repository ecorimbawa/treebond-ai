/**
 * Fallback for metadataCID/imageCid fields when a real upload hasn't
 * happened — IPFS_API_KEY/SECRET isn't set yet, Pinata rejected the upload,
 * or the operator chose to skip it. Keeps the on-chain field non-empty (an
 * empty string reverts TreeRegistry with EmptyString()) without making real
 * IPFS upload a hard requirement for flows that worked before it existed.
 */
export function placeholderCid(seed: string) {
  const slug = seed
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `placeholder-${slug || "untitled"}`;
}
