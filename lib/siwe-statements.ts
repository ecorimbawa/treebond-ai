// The human-readable line a sponsor actually reads in their wallet popup.
// Lives outside lib/siwe.ts because that module is server-only, while the
// message itself is always built in the browser.
export const SIWE_STATEMENT = {
  signIn:
    "Sign in to TreeBond AI. This does not cost gas and never moves funds.",
  link: "Link this wallet to your TreeBond AI account. This does not cost gas and never moves funds.",
} as const;
