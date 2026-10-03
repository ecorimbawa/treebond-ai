# Guide Frontend Integration

# **Panduan Integrasi Frontend TreeBond AI (Arbitrum Sepolia)**

Panduan ini untuk **frontend developer** yang mendapatkan kontrak TreeBond AI hanya dalam bentuk:

1. `addresses.json` — daftar alamat kontrak hasil deploy.
2. Folder `abi/` — 4 file ABI JSON (`TreeRegistry.json`, `TreeNFT.json`, `TreeBond.json`, `VerificationRegistry.json`).

Kamu **tidak perlu** akses source Solidity maupun Foundry. Semua yang dibutuhkan untuk integrasi (read/write/event/role/lifecycle) ada di dokumen ini.

Stack frontend mengikuti template workshop sebelumnya:

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Web3 | wagmi v2, viem v2, RainbowKit |
| Data fetching | TanStack Query (dipakai wagmi) |
| Styling | Tailwind CSS v4 (opsional, tidak wajib untuk integrasi) |
| Lint/format | Biome |

Jaringan: **Arbitrum Sepolia**

| Item | Nilai |
| --- | --- |
| Chain ID | `421614` |
| RPC resmi | `https://sepolia-rollup.arbitrum.io/rpc` |
| Explorer | `https://sepolia.arbiscan.io` |
| Gas token | SepoliaETH (testnet, klaim via [https://faucets.chain.link/arbitrum-sepolia](https://faucets.chain.link/arbitrum-sepolia)) |

Arsitektur interaksi:

```
React Component -> custom hook -> wagmi -> viem -> wallet -> Arbitrum Sepolia
```

> Koordinasi dengan tim smart contract/backend untuk: alamat resmi terbaru, pemberian role (`OPERATOR_ROLE`, `VERIFIER_ROLE`, `ORACLE_ROLE`), dan endpoint oracle bila kamu tidak mengerjakan backend-nya.
> 

---

## **0. Contoh artefak yang kamu terima**

**`addresses.json`** (contoh — selalu pakai file terbaru dari tim):

```json
{
  "TreeBond": "0x57A60e3693f2846f4e7c9B0109c4EFE07135204f",
  "TreeNFT": "0xEE073d076cdB6Da047fAd2CD62e4d6EF0120F71f",
  "TreeRegistry": "0x80Bf32F0cD043Df3F191fc2c712e5Ab76Bf7B38A",
  "VerificationRegistry": "0x5894358cB440BBf2dC7b723696c648E384EbC3A4",
  "chainId": 421614,
  "deployedAt": 1791006744
}
```

Tempatkan artefak di root project frontend:

```
frontend/
├── contracts/
│   ├── addresses.json
│   └── abi/
│       ├── TreeRegistry.json
│       ├── TreeNFT.json
│       ├── TreeBond.json
│       └── VerificationRegistry.json
```

---

## **1. Setup project frontend**

### **Opsi A — dari template workshop (paling cepat)**

```bash
rsync -a --exclude node_modules --exclude .next --exclude .git \
  /path/ke/template-frontend-build-on-arbitrum/ ./frontend/

cd frontend
npm install
cp .env.example .env.local   # lalu isi sesuai §4
```

> Tanpa `rsync`: `cp -R /path/ke/template-frontend-build-on-arbitrum ./frontend`, lalu hapus `frontend/node_modules`, `frontend/.next`, dan `frontend/.git` (kalau tidak dibutuhkan).
> 

### **Opsi B — dari nol dengan versi yang sama**

```bash
npx create-next-app@16.3.5 frontend --typescript --tailwind --app --src-dir --import-alias "@/*"
cd frontend

npm install wagmi@2.19.5 viem@2.56.8 @rainbow-me/rainbowkit@2.2.11 @tanstack/react-query@5.103.2
npm install -D @biomejs/biome@2.4.2
```

Struktur folder yang dipakai di panduan ini:

```
frontend/
├── contracts/                        # artefak dari tim (JSON)
├── scripts/
│   └── sync-contracts.mjs            # generator ABI + addresses (dibuat di §3)
└── src/
    ├── contracts/
    │   └── addresses.ts              # hasil generate (jangan edit manual)
    ├── lib/web3/
    │   ├── abis/                     # hasil generate (jangan edit manual)
    │   │   ├── TreeRegistry.ts
    │   │   ├── TreeNFT.ts
    │   │   ├── TreeBond.ts
    │   │   └── VerificationRegistry.ts
    │   ├── config.ts                 # wagmi + RainbowKit
    │   ├── contracts.ts              # definisi 4 kontrak
    │   ├── errors.ts                 # decoding custom error
    │   ├── format.ts                 # helper ETH/IPFS/timestamp
    │   └── gas.ts                    # helper gas fee
    ├── hooks/
    │   ├── index.ts
    │   ├── read/                     # useTree, useTreePrice, ...
    │   └── write/                    # useSponsorTree, useCreateProject, ...
    ├── app/
    │   └── api/oracle/               # Route Handler oracle (server-side)
    └── providers/
        └── web3-provider.tsx
```

---

## **2. Spesifikasi kontrak (dibaca dari ABI)**

### **2.1 Tanggung jawab kontrak**

| Kontrak | Fungsi |
| --- | --- |
| `TreeRegistry` | Project, tree, status lifecycle, metadata CID |
| `TreeNFT` | ERC-721 kepemilikan tree — `tokenId` = `treeId`, `tokenURI` = `ipfs://<metadataCID>` |
| `TreeBond` | Sponsorship dengan native ETH, platform fee, payout operator (pull pattern) |
| `VerificationRegistry` | Rekaman verifikasi on-chain (hash + CID + skor) oleh oracle |

### **2.2 Role (AccessControl)**

| Kontrak | Role | Boleh melakukan |
| --- | --- | --- |
| `TreeRegistry` | `OPERATOR_ROLE` | `createProject`, `setProjectActive`, `registerTree`, `updateTreeMetadata` |
| `TreeRegistry` | `VERIFIER_ROLE` | `updateTreeStatus` |
| `TreeRegistry` | `SPONSOR_ROLE` | `markSponsored` (dipegang `TreeBond`) |
| `TreeBond` | `OPERATOR_ROLE` | `setTreePrice`, `setDefaultTreePrice` |
| `TreeBond` | `DEFAULT_ADMIN_ROLE` | `setTreasury`, `setPlatformFeeBps` |
| `TreeNFT` | `MINTER_ROLE` | `mint` (dipegang `TreeBond`) |
| `VerificationRegistry` | `ORACLE_ROLE` | `submitVerification` |
| Semua | `PAUSER_ROLE` | `pause`/`unpause` |

Cek role dari frontend dengan `hasRole(role, address)`; hash role dihitung `keccak256(toHex("OPERATOR_ROLE"))`, dst. UI hanya menampilkan menu sesuai role; kontrak tetap menolak transaksi tanpa role (`AccessControlUnauthorizedAccount`).

### **2.3 Lifecycle `TreeStatus`**

Enum di ABI bernilai angka 0–12:

| Nilai | Nama | Arti |
| --- | --- | --- |
| 0 | `DRAFT` | Tidak pernah di-set kontrak |
| 1 | `REGISTERED` | Baru diregistrasi |
| 2 | `PENDING_VERIFICATION` | Menunggu verifikasi |
| 3 | `VERIFIED` | Terverifikasi |
| 4 | `AVAILABLE` | Siap disponsori |
| 5 | `SPONSORED` | Sudah disponsori (NFT di-mint) |
| 6 | `MONITORING` | Dipantau |
| 7 | `MATURE` | Matang |
| 8 | `REJECTED` | Ditolak |
| 9 | `DEAD` | Mati |
| 10 | `REMOVED` | Dihapus |
| 11 | `REPLACED` | Diganti |
| 12 | `DISPUTED` | Sengketa |

Transisi yang diizinkan kontrak:

```
1 -> 2
2 -> 3 | 8
3 -> 4
4 -> 5
5 -> 6
6 -> 7 | 9
7 -> 9
9 -> 11
semua status 1..11 -> 12 (DISPUTED)
```

Transisi ilegal akan revert `InvalidTreeStatus(from, to)`.

### **2.4 Struct hasil read**

`getTree(treeId)`:

| Field | Tipe Solidity | Tipe TS (viem) |
| --- | --- | --- |
| `id`, `projectId` | `uint256` | `bigint` |
| `treeCode`, `metadataCID` | `string` | `string` |
| `latitude`, `longitude` | `int64` | `bigint` |
| `plantedAt` | `uint64` | `bigint` (Unix detik) |
| `status` | `enum` | `number` |

`getProject(projectId)`:

| Field | Tipe Solidity | Tipe TS |
| --- | --- | --- |
| `id`, `createdAt` | `uint256` / `uint64` | `bigint` |
| `code`, `name`, `metadataCID` | `string` | `string` |
| `operator` | `address` | `0x${string}` |
| `active` | `bool` | `boolean` |

`getLatestVerification(treeId)` / `getVerification(treeId, index)`:

| Field | Tipe Solidity | Tipe TS |
| --- | --- | --- |
| `id`, `treeId`, `timestamp` | `uint256` | `bigint` |
| `healthScore`, `growthScore`, `anomalyRisk` | `uint16` (0–100) | `number` |
| `verifier` | `address` | `0x${string}` |
| `evidenceHash` | `bytes32` | `0x${string}` |
| `evidenceCID` | `string` | `string` |

> **Skala koordinat.** Kontrak menyimpan `int64` apa adanya. Sepakati konvensi dengan tim backend, misalnya microdegrees (derajat × 1e6): `-7.123` → `-7123000n`, dan pakai konsisten saat menulis/membaca.
> 

### **2.5 Fungsi write (butuh transaksi)**

| Kontrak | Fungsi | Argumen | Keterangan |
| --- | --- | --- | --- |
| `TreeBond` | `sponsorTree` | `treeId` | **`payable`** — kirim `value` persis `getTreePrice(treeId)` |
| `TreeBond` | `withdraw` / `withdrawTo(to)` | — / `to` | Tarik `pendingWithdrawals` milik pengirim |
| `TreeBond` | `setTreePrice` | `treeId, price` | `OPERATOR_ROLE` |
| `TreeBond` | `setDefaultTreePrice` | `price` | `OPERATOR_ROLE` |
| `TreeRegistry` | `createProject` | `code, name, metadataCID, operator` | `OPERATOR_ROLE` |
| `TreeRegistry` | `setProjectActive` | `projectId, active` | `OPERATOR_ROLE` |
| `TreeRegistry` | `registerTree` | `projectId, treeCode, metadataCID, latitude, longitude, plantedAt` | `OPERATOR_ROLE` |
| `TreeRegistry` | `updateTreeStatus` | `treeId, newStatus` | `OPERATOR_ROLE`/`VERIFIER_ROLE` |
| `TreeRegistry` | `updateTreeMetadata` | `treeId, metadataCID` | `OPERATOR_ROLE` |
| `VerificationRegistry` | `submitVerification` | `treeId, healthScore, growthScore, anomalyRisk, evidenceHash, evidenceCID, verifier` | `ORACLE_ROLE` (server-side) |

### **2.6 Fungsi read penting**

| Kontrak | Fungsi |
| --- | --- |
| `TreeRegistry` | `getTree`, `getProject`, `treeExists`, `projectExists`, `treeStatus`, `treeMetadataURI`, `treeCount`, `projectCount`, `hasRole` |
| `TreeNFT` | `ownerOf`, `balanceOf`, `tokenURI`, `minted` |
| `TreeBond` | `getTreePrice`, `treePrice`, `defaultTreePrice`, `platformFeeBps`, `treasury`, `pendingWithdrawals`, `paused` |
| `VerificationRegistry` | `getVerification`, `getLatestVerification`, `getVerifications` (limit maks 50), `verificationCount`, `totalVerificationCount`, `isEvidenceHashUsed` |

### **2.7 Event (untuk indexer/refresh UI)**

| Kontrak | Event | Args |
| --- | --- | --- |
| `TreeRegistry` | `ProjectCreated` | `projectId (indexed)`, `operator (indexed)`, `code` |
| `TreeRegistry` | `TreeRegistered` | `treeId (indexed)`, `projectId (indexed)` |
| `TreeRegistry` | `TreeStatusChanged` | `treeId (indexed)`, `status` |
| `TreeRegistry` | `TreeMetadataUpdated` | `treeId (indexed)`, `metadataCID` |
| `TreeNFT` | `TreeMinted` | `treeId (indexed)`, `tokenId (indexed)`, `owner` |
| `TreeNFT` | `Transfer` (ERC-721) | `from (indexed)`, `to (indexed)`, `tokenId (indexed)` |
| `TreeBond` | `TreeSponsored` | `treeId (indexed)`, `sponsor (indexed)` |
| `TreeBond` | `TreePayment` | `treeId (indexed)`, `sponsor (indexed)`, `amountPaid`, `platformFee`, `operatorPayout` |
| `TreeBond` | `Withdrawal` | `account (indexed)`, `to (indexed)`, `amount` |
| `VerificationRegistry` | `VerificationSubmitted` | `treeId (indexed)`, `timestamp`, `evidenceHash` |
| `VerificationRegistry` | `VerificationRecorded` | `verificationId (indexed)`, `treeId (indexed)`, `verifier (indexed)`, `healthScore`, `growthScore`, `anomalyRisk`, `evidenceHash`, `evidenceCID` |

---

## **3. Generate ABI + addresses bertipe (`as const`)**

Buat script berikut — hanya butuh Node.js, tanpa dependensi tambahan. Script membaca `contracts/addresses.json` + `contracts/abi/*.json`, lalu menulis file TypeScript bertipe ketat.

**`scripts/sync-contracts.mjs`**

```jsx
#!/usr/bin/env node
// scripts/sync-contracts.mjs
// Membaca contracts/addresses.json + contracts/abi/*.json (dari tim smart contract),
// lalu menghasilkan src/contracts/addresses.ts dan src/lib/web3/abis/*.ts (as const).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const CONTRACTS_DIR = process.env.CONTRACTS_DIR
  ? join(ROOT, process.env.CONTRACTS_DIR)
  : join(ROOT, "contracts");

const ABI_OUT_DIR = join(ROOT, "src/lib/web3/abis");
const ADDRESSES_OUT = join(ROOT, "src/contracts/addresses.ts");

const EXPECTED_CHAIN_ID = 421614;

const deployment = JSON.parse(
  readFileSync(join(CONTRACTS_DIR, "addresses.json"), "utf8"),
);

if (deployment.chainId !== EXPECTED_CHAIN_ID) {
  console.warn(
    `WARNING: chainId di addresses.json = ${deployment.chainId}, ` +
      `bukan ${EXPECTED_CHAIN_ID} (Arbitrum Sepolia). Pastikan artefak yang kamu terima benar.`,
  );
}

const ABIS = [
  ["TreeRegistry", "TreeRegistryAbi"],
  ["TreeNFT", "TreeNFTAbi"],
  ["TreeBond", "TreeBondAbi"],
  ["VerificationRegistry", "VerificationRegistryAbi"],
];

mkdirSync(ABI_OUT_DIR, { recursive: true });
mkdirSync(dirname(ADDRESSES_OUT), { recursive: true });

for (const [name, constName] of ABIS) {
  const abi = JSON.parse(
    readFileSync(join(CONTRACTS_DIR, "abi", `${name}.json`), "utf8"),
  );
  writeFileSync(
    join(ABI_OUT_DIR, `${name}.ts`),
    `export const ${constName} = ${JSON.stringify(abi)} as const;\n`,
  );
}

const addresses = `// Auto-generated dari contracts/addresses.json. Jangan edit manual.
// Jalankan ulang setelah menerima artefak baru: node scripts/sync-contracts.mjs
export const CHAIN_ID = ${deployment.chainId} as const;

export const CONTRACTS = {
  treeRegistry: "${deployment.TreeRegistry}",
  treeNFT: "${deployment.TreeNFT}",
  treeBond: "${deployment.TreeBond}",
  verificationRegistry: "${deployment.VerificationRegistry}",
} as const;
`;

writeFileSync(ADDRESSES_OUT, addresses);

console.log(`OK: ${ABIS.length} ABI -> ${ABI_OUT_DIR}`);
console.log(`OK: addresses -> ${ADDRESSES_OUT}`);
console.log(`Chain ID: ${deployment.chainId}`);
```

Jalankan dari root project frontend:

```bash
node scripts/sync-contracts.mjs
```

Output yang diharapkan:

```
OK: 4 ABI -> .../src/lib/web3/abis
OK: addresses -> .../src/contracts/addresses.ts
Chain ID: 421614
```

> Script menulis ABI sebagai `.ts` dengan `as const` (satu baris) agar wagmi/viem bisa meng-infer nama fungsi dan tipe argumen secara ketat. Jangan mengedit file hasil generate.
> 
> 
> **Cek `CHAIN_ID`.** Kalau nilainya bukan `421614`, berarti `addresses.json` yang kamu terima bukan dari deploy Arbitrum Sepolia (mungkin dari jaringan lokal). Minta artefak yang benar ke tim.
> 
> Setiap kali tim men-deploy ulang (alamat berubah), kamu hanya perlu mengganti isi `contracts/` lalu menjalankan `node scripts/sync-contracts.mjs` lagi.
> 

---

## **4. Environment variables**

**`.env.local`**

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs

# HANYA untuk server (Route Handler oracle). Jangan pernah pakai prefix NEXT_PUBLIC_.
ORACLE_PRIVATE_KEY=0x...
```

| Variable | Dipakai di | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Client | Project ID dari [https://cloud.walletconnect.com](https://cloud.walletconnect.com/) (RainbowKit) |
| `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL` | Client/Server | RPC Arbitrum Sepolia |
| `NEXT_PUBLIC_IPFS_GATEWAY` | Client | Gateway untuk mengubah `ipfs://` menjadi URL HTTP |
| `ORACLE_PRIVATE_KEY` | **Server only** | Private key oracle untuk `submitVerification`; biasanya dipegang tim backend |

Alamat kontrak tidak ditaruh di `.env` — sudah tersedia di `src/contracts/addresses.ts` hasil generate (satu sumber kebenaran, ikut berubah saat redeploy).

> **Peringatan.** `ORACLE_PRIVATE_KEY` hanya boleh dibaca di server. Jangan pernah menamainya `NEXT_PUBLIC_ORACLE_PRIVATE_KEY`, jangan memasukkannya ke komponen client, dan jangan meng-import Route Handler oracle dari file client.
> 

---

## **5. Konfigurasi wagmi + RainbowKit**

**`src/lib/web3/config.ts`**

```tsx
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "TreeBond AI",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(
      process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL,
      { batch: true },
    ),
  },
  ssr: true,
});
```

**`src/providers/web3-provider.tsx`** (kalau memakai template, file ini sudah ada):

```tsx
"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/web3/config";

const theme = lightTheme({ borderRadius: "large", fontStack: "system" });

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

Pasang di layout yang memuat halaman ber-wallet, lalu gunakan `<ConnectButton />` dari `@rainbow-me/rainbowkit` di komponen client.

---

## **6. Definisi kontrak terpusat**

**`src/lib/web3/contracts.ts`**

```tsx
import { arbitrumSepolia } from "wagmi/chains";
import { CONTRACTS } from "@/contracts/addresses";
import { TreeBondAbi } from "@/lib/web3/abis/TreeBond";
import { TreeNFTAbi } from "@/lib/web3/abis/TreeNFT";
import { TreeRegistryAbi } from "@/lib/web3/abis/TreeRegistry";
import { VerificationRegistryAbi } from "@/lib/web3/abis/VerificationRegistry";

export const treeRegistry = {
  address: CONTRACTS.treeRegistry,
  abi: TreeRegistryAbi,
  chainId: arbitrumSepolia.id,
} as const;

export const treeNFT = {
  address: CONTRACTS.treeNFT,
  abi: TreeNFTAbi,
  chainId: arbitrumSepolia.id,
} as const;

export const treeBond = {
  address: CONTRACTS.treeBond,
  abi: TreeBondAbi,
  chainId: arbitrumSepolia.id,
} as const;

export const verificationRegistry = {
  address: CONTRACTS.verificationRegistry,
  abi: VerificationRegistryAbi,
  chainId: arbitrumSepolia.id,
} as const;
```

---

## **7. Helper tipe: status tree**

**`src/lib/tree-status.ts`**

```tsx
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
} as const;

export type TreeStatus = (typeof TREE_STATUS)[keyof typeof TREE_STATUS];

export const TREE_STATUS_LABEL: Record<TreeStatus, string> = {
  0: "Draft",
  1: "Terdaftar",
  2: "Menunggu Verifikasi",
  3: "Terverifikasi",
  4: "Tersedia",
  5: "Disponsori",
  6: "Pemantauan",
  7: "Matang",
  8: "Ditolak",
  9: "Mati",
  10: "Dihapus",
  11: "Diganti",
  12: "Disengketakan",
};

// Transisi yang diizinkan kontrak.
// Selain daftar ini, semua status 1..11 juga bisa pindah ke DISPUTED (12).
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
```

---

## **8. Read hooks**

Pola: file di `src/hooks/read/`, hook mengembalikan data yang sudah diberi default, lalu di-export ulang dari `src/hooks/index.ts`.

### **8.1 `src/hooks/read/use-tree.ts`**

```tsx
import { useReadContract } from "wagmi";
import { treeRegistry } from "@/lib/web3/contracts";

export function useTree(treeId: bigint) {
  const { data, isLoading, isError, refetch } = useReadContract({
    ...treeRegistry,
    functionName: "getTree",
    args: [treeId],
    query: { enabled: treeId > 0n },
  });

  return { tree: data, isLoading, isError, refetch };
}
```

### **8.2 `src/hooks/read/use-project.ts`**

```tsx
import { useReadContract } from "wagmi";
import { treeRegistry } from "@/lib/web3/contracts";

export function useProject(projectId: bigint) {
  const { data, isLoading } = useReadContract({
    ...treeRegistry,
    functionName: "getProject",
    args: [projectId],
    query: { enabled: projectId > 0n },
  });

  return { project: data, isLoading };
}
```

### **8.3 `src/hooks/read/use-tree-counts.ts`**

```tsx
import { useReadContract } from "wagmi";
import { treeRegistry } from "@/lib/web3/contracts";

export function useTreeCounts() {
  const { data: treeCount } = useReadContract({
    ...treeRegistry,
    functionName: "treeCount",
  });

  const { data: projectCount } = useReadContract({
    ...treeRegistry,
    functionName: "projectCount",
  });

  return { treeCount: treeCount ?? 0n, projectCount: projectCount ?? 0n };
}
```

### **8.4 `src/hooks/read/use-tree-price.ts`**

```tsx
import { useReadContract } from "wagmi";
import { treeBond } from "@/lib/web3/contracts";

export function useTreePrice(treeId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    ...treeBond,
    functionName: "getTreePrice",
    args: [treeId],
    query: { enabled: treeId > 0n },
  });

  return { price: data ?? 0n, isLoading, refetch };
}
```

`getTreePrice` mengembalikan harga per-tree; jika `treePrice[treeId]` nol, kontrak memakai `defaultTreePrice`. Nilai inilah yang harus dikirim **persis** ke `sponsorTree`.

### **8.5 `src/hooks/read/use-latest-verification.ts`**

```tsx
import { useReadContract } from "wagmi";
import { verificationRegistry } from "@/lib/web3/contracts";

export function useLatestVerification(treeId: bigint) {
  const { data, isLoading, isError } = useReadContract({
    ...verificationRegistry,
    functionName: "getLatestVerification",
    args: [treeId],
    // retry: false karena kontrak revert NoVerificationFound jika belum ada
    query: { enabled: treeId > 0n, retry: false },
  });

  return { verification: data, isLoading, notFound: isError };
}
```

### **8.6 `src/hooks/read/use-tree-owner.ts`**

```tsx
import { useReadContract } from "wagmi";
import { treeNFT } from "@/lib/web3/contracts";

export function useTreeOwner(treeId: bigint) {
  const { data, isLoading } = useReadContract({
    ...treeNFT,
    functionName: "ownerOf",
    args: [treeId],
    query: { enabled: treeId > 0n },
  });

  return { owner: data, isLoading };
}
```

`tokenURI(tokenId)` mengembalikan `ipfs://<metadataCID>`, tetapi revert jika token belum di-mint — selalu bungkus dengan `enabled` yang sesuai.

### **8.7 `src/hooks/read/use-has-role.ts`**

```tsx
import { keccak256, toHex } from "viem";
import { useReadContract } from "wagmi";
import { treeRegistry } from "@/lib/web3/contracts";

export const OPERATOR_ROLE = keccak256(toHex("OPERATOR_ROLE"));
export const VERIFIER_ROLE = keccak256(toHex("VERIFIER_ROLE"));

export function useHasOperatorRole(account?: `0x${string}`) {
  const { data } = useReadContract({
    ...treeRegistry,
    functionName: "hasRole",
    args: account ? [OPERATOR_ROLE, account] : undefined,
    query: { enabled: Boolean(account) },
  });

  return data ?? false;
}
```

Export semua di `src/hooks/index.ts`:

```tsx
export { useLatestVerification } from "./read/use-latest-verification";
export { useHasOperatorRole, OPERATOR_ROLE, VERIFIER_ROLE } from "./read/use-has-role";
export { useProject } from "./read/use-project";
export { useTreeCounts } from "./read/use-tree-counts";
export { useTreeOwner } from "./read/use-tree-owner";
export { useTreePrice } from "./read/use-tree-price";
export { useTree } from "./read/use-tree";
```

---

## **9. Write hooks**

Pola:

1. `useWriteContract()` → `writeContractAsync` (memicu konfirmasi wallet).
2. `waitForTransactionReceipt` sampai transaksi masuk block.
3. Cek `receipt.status === "reverted"`.
4. `queryClient.invalidateQueries()` agar data read ter-refresh.
5. State `isPending` (menunggu signature) dan `isConfirming` (menunggu konfirmasi on-chain).

### **9.1 `src/lib/web3/gas.ts`**

```tsx
import type { Config } from "wagmi";
import { estimateFeesPerGas } from "wagmi/actions";
import { arbitrumSepolia } from "wagmi/chains";

export async function getGasFees(
  config: Config,
  chainId: number = arbitrumSepolia.id,) {
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(
    config,
    { chainId },
  );

  // buffer 2x agar tidak "underpriced" saat base fee naik
  return { maxFeePerGas: maxFeePerGas * 2n, maxPriorityFeePerGas };
}
```

### **9.2 `src/hooks/write/use-sponsor-tree.ts` (paling penting)**

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { treeBond } from "@/lib/web3/contracts";
import { getGasFees } from "@/lib/web3/gas";

export function useSponsorTree() {
  const config = useConfig();
  const queryClient = useQueryClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [isConfirming, setIsConfirming] = useState(false);

  const sponsorTree = async (treeId: bigint, price: bigint) => {
    const fees = await getGasFees(config);

    const hash = await writeContractAsync({
      ...treeBond,
      ...fees,
      functionName: "sponsorTree",
      args: [treeId],
      // WAJIB persis sama dengan getTreePrice(treeId); lebih/kurang akan revert
      value: price,
    });

    setIsConfirming(true);
    try {
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted on-chain.");
      }
      await queryClient.invalidateQueries();
      return hash;
    } finally {
      setIsConfirming(false);
    }
  };

  return { sponsorTree, isPending, isConfirming };
}
```

Alur UI: user klik **Sponsor** → validasi `status === AVAILABLE` dan `price > 0` → `sponsorTree(treeId, price)` → wallet konfirmasi → tunggu receipt → invalidate query → `ownerOf(treeId)` berubah menjadi alamat sponsor.

### **9.3 `src/hooks/write/use-create-project.ts` (OPERATOR_ROLE)**

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { treeRegistry } from "@/lib/web3/contracts";
import { getGasFees } from "@/lib/web3/gas";

export function useCreateProject() {
  const config = useConfig();
  const queryClient = useQueryClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [isConfirming, setIsConfirming] = useState(false);

  const createProject = async (
    code: string,
    name: string,
    metadataCID: string,
    operator: `0x${string}`,) => {
    const fees = await getGasFees(config);

    const hash = await writeContractAsync({
      ...treeRegistry,
      ...fees,
      functionName: "createProject",
      args: [code, name, metadataCID, operator],
    });

    setIsConfirming(true);
    try {
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted on-chain.");
      }
      await queryClient.invalidateQueries();
      return hash;
    } finally {
      setIsConfirming(false);
    }
  };

  return { createProject, isPending, isConfirming };
}
```

`code` dan `name` tidak boleh kosong, `operator` tidak boleh `address(0)`.

### **9.4 `src/hooks/write/use-register-tree.ts` (OPERATOR_ROLE)**

```tsx
const hash = await writeContractAsync({
  ...treeRegistry,
  ...fees,
  functionName: "registerTree",
  args: [
    projectId,        // bigint
    treeCode,         // string, mis. "TREE-JTG-000192"
    metadataCID,      // string, CID IPFS
    latitude,         // bigint microdegrees, mis. -7123000n
    longitude,        // bigint microdegrees, mis. 110456000n
    plantedAt,        // bigint Unix detik, mis. BigInt(Math.floor(Date.now() / 1000))
  ],
});
```

Project harus ada dan `active`; `treeCode`/`metadataCID` tidak boleh kosong. Setelah sukses, tree berstatus `REGISTERED` (1).

### **9.5 `src/hooks/write/use-update-tree-status.ts` (OPERATOR/VERIFIER)**

```tsx
const hash = await writeContractAsync({
  ...treeRegistry,
  ...fees,
  functionName: "updateTreeStatus",
  args: [treeId, status], // status: nomor enum, mis. TREE_STATUS.PENDING_VERIFICATION
});
```

Tampilkan aksi berdasarkan `TREE_TRANSITIONS` (§7) agar tidak revert `InvalidTreeStatus`.

### **9.6 `src/hooks/write/use-withdraw.ts` (treasury/operator)**

```tsx
const hash = await writeContractAsync({
  ...treeBond,
  ...fees,
  functionName: "withdraw", // atau "withdrawTo" dengan args [to]
});
```

Pembayaran memakai pull pattern: platform fee masuk ke `pendingWithdrawals[treasury]` dan bagian operator masuk ke `pendingWithdrawals[operator]`. Jika nol, kontrak revert `NothingToWithdraw`.

### **9.7 Chain guard**

`writeContractAsync` gagal jika wallet tidak di Arbitrum Sepolia. Simpan sebagai `src/hooks/use-ensure-chain.ts`:

```tsx
"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

export function useEnsureArbitrumSepolia() {
  const { chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const wrongChain = chainId !== undefined && chainId !== arbitrumSepolia.id;
  const switchToArbitrumSepolia = () => switchChain({ chainId: arbitrumSepolia.id });

  return { wrongChain, switchToArbitrumSepolia, isSwitching: isPending };
}
```

Export hook-hook write di `src/hooks/index.ts`:

```tsx
export { useCreateProject } from "./write/use-create-project";
export { useRegisterTree } from "./write/use-register-tree";
export { useSponsorTree } from "./write/use-sponsor-tree";
export { useUpdateTreeStatus } from "./write/use-update-tree-status";
export { useWithdraw } from "./write/use-withdraw";
```

---

## **10. Error handling**

Custom error Solidity dibungkus viem dalam `BaseError`; ambil `ContractFunctionRevertedError` untuk mendapatkan `errorName`.

**`src/lib/web3/errors.ts`**

```tsx
import {
  BaseError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
} from "viem";

const REVERT_MESSAGE: Record<string, string> = {
  ZeroAddress: "Alamat tidak boleh kosong.",
  EmptyString: "Field wajib tidak boleh kosong.",
  ProjectNotFound: "Project tidak ditemukan.",
  ProjectNotActive: "Project sedang tidak aktif.",
  TreeNotFound: "Tree tidak ditemukan.",
  InvalidTreeStatus: "Transisi status tidak diizinkan.",
  TreeNotAvailable: "Tree belum berstatus AVAILABLE, tidak bisa disponsori.",
  PriceNotSet: "Harga sponsorship belum di-set.",
  IncorrectPayment: "Nilai pembayaran tidak persis sama dengan harga tree.",
  InvalidPlatformFee: "Platform fee melebihi batas 20%.",
  NothingToWithdraw: "Tidak ada saldo yang bisa ditarik.",
  TransferFailed: "Transfer ETH gagal.",
  AlreadyMinted: "NFT untuk tree ini sudah pernah di-mint.",
  InvalidScore: "Skor harus 0–100.",
  InvalidEvidenceHash: "Evidence hash tidak valid.",
  DuplicateEvidence: "Evidence hash ini sudah pernah disubmit untuk tree ini.",
  VerificationNotFound: "Data verifikasi tidak ditemukan.",
  NoVerificationFound: "Belum ada verifikasi untuk tree ini.",
  LimitTooHigh: "Limit pagination maksimal 50.",
  AccessControlUnauthorizedAccount: "Wallet ini tidak punya role yang dibutuhkan.",
};

export function getContractErrorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName ?? "";
      return REVERT_MESSAGE[name] ?? revert.shortMessage;
    }

    const rejected = error.walk((e) => e instanceof UserRejectedRequestError);
    if (rejected) return "Transaksi dibatalkan di wallet.";

    return error.shortMessage;
  }

  return error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal.";
}
```

Pemakaian:

```tsx
try {
  await sponsorTree(treeId, price);
} catch (error) {
  setMessage(getContractErrorMessage(error));
}
```

---

## **11. Events**

### **11.1 Watch event di client**

```tsx
"use client";

import { useWatchContractEvent } from "wagmi";
import { treeBond } from "@/lib/web3/contracts";

export function useTreeSponsoredEvents() {
  useWatchContractEvent({
    ...treeBond,
    eventName: "TreeSponsored",
    onLogs(logs) {
      for (const log of logs) {
        const { treeId, sponsor } = log.args;
        if (treeId === undefined || sponsor === undefined) continue;
        console.log("TreeSponsored", treeId, sponsor);
      }
    },
  });
}
```

### **11.2 Backfill log untuk indexer/Supabase**

Di server (Route Handler, cron, atau script), pakai viem `getContractEvents`:

```tsx
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { CONTRACTS } from "@/contracts/addresses";
import { TreeBondAbi } from "@/lib/web3/abis/TreeBond";

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL),
});

const logs = await client.getContractEvents({
  address: CONTRACTS.treeBond,
  abi: TreeBondAbi,
  eventName: "TreeSponsored",
  fromBlock: 0n,
  toBlock: "latest",
});

// simpan logs (treeId, sponsor, txHash, blockNumber) ke database/indexer
```

Setelah `write` sukses, `queryClient.invalidateQueries()` sudah cukup untuk UI; indexer berjalan terpisah.

---

## **12. Helper format & tampilan**

**`src/lib/web3/format.ts`**

```tsx
import { formatEther, parseEther } from "viem";

const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://ipfs.io/ipfs";

export function formatEth(wei: bigint, digits = 4): string {
  const value = Number(formatEther(wei));
  return `${value.toFixed(digits)} ETH`;
}

export function ethToWei(eth: string): bigint {
  return parseEther(eth);
}

export function toIpfsUrl(uri: string): string {
  return uri.startsWith("ipfs://")
    ? `${IPFS_GATEWAY}/${uri.slice("ipfs://".length)}`
    : uri;
}

export function formatTimestamp(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleString("id-ID");
}

// microdegrees -> derajat (sesuai konvensi §2.4)
export function fromMicrodegrees(value: bigint): number {
  return Number(value) / 1e6;
}
```

Yang sering keliru:

- Semua harga on-chain dalam **wei** (`bigint`). Tampilkan dengan `formatEth`, konversi input user dengan `parseEther`. Jangan pakai `Number` untuk perhitungan wei.
- **`bigint` tidak bisa di-serialize** dari Server Component ke Client Component. Konversi ke `string` dulu, atau fetch di client memakai hooks.
- `tokenURI`/`treeMetadataURI` mengembalikan `ipfs://<CID>`; ubah dengan `toIpfsUrl`.
- Timestamp on-chain adalah detik Unix; `Date` JS memakai milidetik.

---

## **13. Cek role di UI**

Hanya tampilkan menu operator/verifier jika wallet punya role-nya. Kontrak tetap penegak otoritas.

| Kontrak | Role |
| --- | --- |
| `TreeRegistry` | `OPERATOR_ROLE`, `VERIFIER_ROLE`, `PAUSER_ROLE`, `SPONSOR_ROLE` |
| `TreeBond` | `OPERATOR_ROLE`, `PAUSER_ROLE` |
| `TreeNFT` | `MINTER_ROLE`, `PAUSER_ROLE` |
| `VerificationRegistry` | `ORACLE_ROLE`, `PAUSER_ROLE` |

```tsx
import { keccak256, toHex } from "viem";
import { useReadContract } from "wagmi";
import { treeRegistry } from "@/lib/web3/contracts";

const roleHash = (role: string) => keccak256(toHex(role));

export function useIsVerifier(account?: `0x${string}`) {
  const { data } = useReadContract({
    ...treeRegistry,
    functionName: "hasRole",
    args: account ? [roleHash("VERIFIER_ROLE"), account] : undefined,
    query: { enabled: Boolean(account) },
  });

  return data ?? false;
}
```

Jika wallet belum punya role, minta tim smart contract memanggil `grantRole` (hanya admin kontrak yang bisa).

---

## **14. Backend oracle (server-side)**

`submitVerification` hanya bisa dipanggil `ORACLE_ROLE`. Kalau kamu tidak mengerjakan backend, lewati bagian ini dan minta tim backend menyediakan endpoint. Kalau mengerjakan, private key oracle **tidak boleh** ada di browser.

Install dependensi tambahan:

```bash
npm install zod server-only
```

**`src/app/api/oracle/submit-verification/route.ts`**

```tsx
import "server-only";

import { NextResponse } from "next/server";
import {
  createWalletClient,
  http,
  keccak256,
  toHex,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { z } from "zod";
import { verificationRegistry } from "@/lib/web3/contracts";

export const runtime = "nodejs";

const bodySchema = z.object({
  treeId: z.coerce.bigint().positive(),
  evidenceCID: z.string().min(1),
  capturedAt: z.string().datetime(),
  latitude: z.number(),
  longitude: z.number(),
  aiAnalysisId: z.string().min(1),
  healthScore: z.number().int().min(0).max(100),
  growthScore: z.number().int().min(0).max(100),
  anomalyRisk: z.number().int().min(0).max(100),
  verifier: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

// Canonical evidence: urutan key HARUS konsisten dengan verifier/backend,
// karena hash = keccak256 dari string JSON ini.
function buildCanonicalEvidence(input: z.infer<typeof bodySchema>) {
  return {
    treeId: input.treeId.toString(),
    evidenceCID: input.evidenceCID,
    capturedAt: input.capturedAt,
    latitude: input.latitude,
    longitude: input.longitude,
    aiAnalysisId: input.aiAnalysisId,
    verificationVersion: 1,
  };
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload tidak valid", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const canonical = JSON.stringify(buildCanonicalEvidence(input));
  const evidenceHash = keccak256(toHex(canonical));

  const privateKey = process.env.ORACLE_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      { error: "ORACLE_PRIVATE_KEY belum di-set di server" },
      { status: 500 },
    );
  }

  const account = privateKeyToAccount(privateKey as Hex);
  const wallet = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL),
  });

  try {
    const hash = await wallet.writeContract({
      ...verificationRegistry,
      functionName: "submitVerification",
      args: [
        input.treeId,
        input.healthScore,
        input.growthScore,
        input.anomalyRisk,
        evidenceHash,
        input.evidenceCID,
        input.verifier as `0x${string}`,
      ],
      account,
    });

    return NextResponse.json({ hash, evidenceHash });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Oracle gagal submit verifikasi",
      },
      { status: 500 },
    );
  }
}
```

Memanggil dari komponen client (setelah verifier approve dan evidence di-pin ke IPFS):

```tsx
const response = await fetch("/api/oracle/submit-verification", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    treeId: treeId.toString(),
    evidenceCID,
    capturedAt,
    latitude,
    longitude,
    aiAnalysisId,
    healthScore,
    growthScore,
    anomalyRisk,
    verifier,
  }),
});

const result = (await response.json()) as
  | { hash: `0x${string}`; evidenceHash: `0x${string}` }
  | { error: string };

if ("error" in result) throw new Error(result.error);
```

Catatan: `evidenceHash` yang sama tidak bisa disubmit dua kali untuk tree yang sama (`DuplicateEvidence`). Sepakati field & urutan canonical evidence dengan tim backend/verifier.

---

## **15. Testing & verifikasi**

Statik:

```bash
npx tsc --noEmit     # typecheck (memastikan ABI + argumen cocok)
npm run lint         # biome check (kalau memakai template)
npm run build
npm run dev          # http://localhost:3000
```

Checklist E2E di Arbitrum Sepolia (butuh saldo dari faucet + role dari tim):

1. Connect wallet + pindah ke chain `421614`.
2. `createProject(...)` sebagai operator → `projectId` baru + event `ProjectCreated`.
3. `registerTree(...)` → `treeId` baru, status `REGISTERED` (1).
4. `updateTreeStatus(treeId, ...)` sampai `AVAILABLE` (4).
5. `getTreePrice(treeId)` menampilkan harga; tombol **Sponsor** aktif.
6. `sponsorTree(treeId, price)` dengan `value` persis → status `SPONSORED` (5), `ownerOf(treeId)` menjadi sponsor, event `TreeSponsored` + `TreeMinted`.
7. Submit verifikasi (via endpoint oracle) → `getLatestVerification(treeId)` mengembalikan skor.
8. `pendingWithdrawals(operator)` > 0 → `withdraw()` dari akun operator/treasury.
9. Cek transaksi & event di [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io/).

Cek saldo/kontrak cepat tanpa frontend (butuh Foundry/cast — opsional; ganti alamat dengan `TreeBond` dari `addresses.json` milikmu):

```bash
cast call <TREE_BOND_ADDRESS> \
  "defaultTreePrice()(uint256)" \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc
```

---

## **16. Troubleshooting**

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| `ChainMismatchError` / write gagal | Wallet di chain lain | Pindah ke Arbitrum Sepolia (421614) via `useSwitchChain` atau RainbowKit |
| `IncorrectPayment` saat sponsor | `value` ≠ `getTreePrice` | Baca ulang harga tepat sebelum kirim; `value: price` persis |
| `TreeNotAvailable` | Status belum `AVAILABLE` (4) | Cek `getTree`; tim operator harus update status dulu |
| `AccessControlUnauthorizedAccount` | Wallet tidak punya role | Minta tim smart contract `grantRole`, atau pakai akun yang ber-role |
| `AlreadyMinted` | Tree sudah pernah disponsori | Tampilkan status `SPONSORED`, bukan tombol sponsor |
| `NothingToWithdraw` | `pendingWithdrawals` = 0 | Cek `pendingWithdrawals(address)` dulu |
| `Function not found` / decode aneh | ABI lama setelah redeploy | Ganti `contracts/` dengan artefak baru, jalankan `node scripts/sync-contracts.mjs`, restart dev server |
| `Hydration failed` / error render | `bigint` di-render langsung | Format ke `string`; pastikan pemakai hooks bertanda `"use client"` |
| Data tidak refresh setelah tx | Query cache tidak invalidated | Pastikan hook write memanggil `queryClient.invalidateQueries()` setelah receipt |
| Event tidak muncul | Kontrak/event salah atau tx reverted | Cek `receipt.status` dan signature event di §2.7 |
| `Cannot serialize BigInt` | Kirim `bigint` dari Server Component | Konversi ke `string` sebelum melewati boundary server→client |
| RPC error / rate limit | RPC publik | Ganti `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL` (Alchemy/Infura) |
| `NoVerificationFound` | Tree belum diverifikasi | Tangani `notFound` dari `useLatestVerification` sebagai state wajar |
| `WARNING: chainId ... bukan 421614` | Artefak dari jaringan lokal | Minta `addresses.json` + ABI hasil deploy Arbitrum Sepolia |

---

## **17. Checklist keamanan frontend**

- `ORACLE_PRIVATE_KEY` **hanya** di `.env.local` dan hanya dibaca Route Handler server (`import "server-only"`); tidak pernah `NEXT_PUBLIC_*`.
- Jangan commit `.env.local` dan jangan pernah menaruh private key di repo.
- Semua pengecekan role di UI bersifat kosmetik; kontrak tetap penegak otoritas.
- Kirim `value` sponsoring persis sesuai `getTreePrice` (exact payment).
- Validasi input (zod) sebelum menyentuh IPFS/database/on-chain.
- Setelah menerima artefak baru: jalankan `node scripts/sync-contracts.mjs` dan pastikan `CHAIN_ID = 421614` di `src/contracts/addresses.ts`.
- Jangan memakai private key deployer/admin di frontend. Oracle harus wallet terpisah dengan saldo hanya untuk gas.
- Verifikasi alamat kontrak di [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io/) sebelum dipakai produksi/demo.