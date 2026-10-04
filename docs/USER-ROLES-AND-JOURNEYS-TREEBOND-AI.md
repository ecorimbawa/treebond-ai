# User Roles & Journeys — TreeBond AI

Dokumen ini menjelaskan role yang **benar-benar ada di implementasi saat ini** (bukan cuma aspirasi PRD), beserta journey aktual tiap role berdasarkan route dan kode yang sudah dibangun. Referensi `PRD.md §7-10` untuk journey yang dicita-citakan.

---

## Ringkasan — total 6 "role" dari PRD, tapi cuma 4 yang benar-benar login role

| # | Role | Tipe | Perlu login? | Di-gate oleh |
| --- | --- | --- | --- | --- |
| 1 | **Visitor** | Bukan role DB | Tidak | — |
| 2 | **Sponsor** | `User.role` di MongoDB | Tidak sebenarnya* | — (lihat catatan di bawah) |
| 3 | **Operator** | `User.role` di MongoDB | Ya | `proxy.ts` + `session.user.role` tiap API route |
| 4 | **Verifier** | `User.role` di MongoDB | Ya | sama |
| 5 | **Admin** | `User.role` di MongoDB | Ya | sama |
| 6 | **Oracle** | Private key di server (`ORACLE_PRIVATE_KEY`), **bukan** akun yang login | — | `ORACLE_ROLE` on-chain di `VerificationRegistry` |

*Sponsor ditandai bintang karena ini nuansa penting — dijelaskan di bagian 2.

---

## 1. Visitor (belum login, belum connect wallet)

Siapapun yang buka aplikasi tanpa akun maupun wallet.

```
/ (landing)
  ↓
/explore — browse semua tree publik, filter status, search ID/species
  ↓
/trees/[treeId] — Tree Passport lengkap: data fisik, lokasi, riwayat
                  evidence, riwayat verifikasi, panel on-chain (baca
                  langsung dari kontrak: status, harga, owner,
                  verifikasi terakhir)
  ↓
/projects/[projectId] — detail project + daftar tree di dalamnya
```

Visitor **sudah bisa connect wallet** di sini (tombol Connect di chain panel Tree Passport) dan bahkan langsung sponsor tree tanpa bikin akun sama sekali — lihat catatan di role Sponsor.

Kalau mau bikin akun: `/login` atau `/create-account`.

---

## 2. Sponsor

### Cara jadi Sponsor
Self-register lewat `/create-account` → `POST /api/auth/register` → otomatis `role: "sponsor"` (`app/api/auth/register/route.ts:45`). Ini satu-satunya role yang bisa didapat sendiri tanpa provisioning manual.

### Journey (PRD §8)
```
Explore Trees → Select Tree → View Tree Passport
  ↓
Connect Wallet (RainbowKit, di chain panel)
  ↓
Sponsor Tree — klik tombol, wallet sendiri yang sign & kirim
               transaksi sponsorTree() langsung ke blockchain
  ↓
Tunggu konfirmasi → browser POST txHash ke
  /api/trees/[id]/sponsor → server verifikasi independen ke chain
  ↓
Tree berubah status jadi SPONSORED, ownerWallet ter-update
  ↓
/dashboard — lihat semua tree yang dimiliki wallet ini
```

### ⚠️ Catatan penting
**Login sebagai Sponsor saat ini tidak menggerbang apapun.** `/dashboard` (`app/(sponsor)/dashboard/page.tsx`) murni berdasarkan **wallet yang sedang connect** (`useAccount()` dari wagmi) dan fetch `/api/trees?ownerWallet=<address>` — tidak ada pengecekan session/login sama sekali. `/dashboard` juga tidak ada di daftar proteksi `proxy.ts`.

Artinya: Visitor yang belum pernah daftar akun pun bisa connect wallet, sponsor tree, dan buka `/dashboard` untuk lihat tree miliknya — persis sama seperti user yang sudah login sebagai Sponsor. Akun Sponsor saat ini baru berguna untuk hal yang belum dibangun (wallet-linking §18, notifikasi §71).

---

## 3. Operator

### Cara jadi Operator
**Tidak ada self-service.** Harus di-set manual `role: "operator"` di MongoDB (lihat `docs/GAP-ANALYSIS-TREEBOND-AI.md` Priority 1). Supaya transaksinya benar-benar berhasil on-chain, wallet operator **juga** harus punya `OPERATOR_ROLE` di kontrak `TreeRegistry` — ini langkah terpisah, diberikan lewat form admin "Grant On-Chain Role" (`/admin`).

### Journey (PRD §9)
```
Login (/login)
  ↓
/operator — dashboard: jumlah project, tree, pending verification,
            healthy, dead (agregat dari MongoDB)
  ↓
/operator/projects — daftar project yang dia buat
  ↓
/operator/projects/new — form create project:
    1. Simpan draft ke MongoDB
    2. Wallet sendiri sign & kirim createProject() ke TreeRegistry
    3. Browser POST txHash ke /api/projects/[id]/chain-link
       → server verifikasi event ProjectCreated, simpan onChainProjectId
  ↓
/operator/projects/[projectId]/trees/new — form register tree:
    1. Simpan draft ke MongoDB (status DRAFT)
    2. Wallet sendiri sign & kirim registerTree() ke TreeRegistry
    3. Browser POST txHash ke /api/trees/[id]/register-chain
       → server verifikasi event TreeRegistered, simpan tokenId,
         status jadi REGISTERED
  ↓
/operator/trees/[treeId]/evidence/new — upload evidence monitoring:
    Form manual-entry (foto CID sebagai string, skor AI diisi
    manual — belum ada AI/IPFS asli, lihat gap analysis P3) →
    masuk ke antrian verifier
```

---

## 4. Verifier

### Cara jadi Verifier
`node scripts/seed-demo-data.mjs` bikin `demo-verifier@treebond.seed` / `demo-seed-not-a-real-login`. Sejak Admin Feature Plan P1 selesai, bisa juga lewat `/admin/users` (admin ubah role user jadi verifier langsung di UI). Belum perlu `VERIFIER_ROLE` on-chain untuk apapun yang verifier lakukan saat ini — approve/reject murni Mongo, dan submit ke chain tetap tugas Oracle (lihat catatan di bagian Oracle).

### Journey (PRD §10)
```
Login (/login) — otomatis diarahkan ke /verifier setelah sukses
  ↓
/verifier — antrian: semua TreeEvidence berstatus "pending",
            lengkap dengan info tree-nya
  ↓
Klik "Review" → /verifier/[verificationId]
  (ada link "← Back to Queue")
  ↓
Lihat evidence (tipe, foto CID, GPS, waktu) + hasil AI
  (health/growth/anomaly score, model name, explanation)
  ↓
Approve / Reject (wajib isi alasan)
    → POST /api/verifications/[id]/approve atau /reject
    → Membuat dokumen Verification baru di MongoDB
      (status APPROVED atau REJECTED)
  ↓
Kalau APPROVED → muncul form "Submit to Blockchain":
    isi alamat wallet verifier (buat dicatat di kontrak,
    bukan yang kirim transaksi — lihat bagian Oracle)
    → POST /api/oracle/submit-verification
    → SERVER (bukan wallet verifier) yang sign & kirim
      submitVerification() pakai ORACLE_PRIVATE_KEY
    → Verification.status jadi ON_CHAIN
```

⚠️ Submit to Blockchain cuma berhasil kalau tree yang di-review **sudah punya `tokenId` asli** (diregister Operator on-chain) — kalau belum, Oracle route nolak dengan "Tree is not registered on-chain yet".

⚠️ **Kedua halaman Verifier sekarang redirect tegas** ke `/login` kalau yang akses bukan sesi verifier (2026-10-04 — sebelumnya halaman review bisa diakses siapa aja yang tau ID evidence-nya, tanpa login sama sekali; cuma tombol approve/reject yang ter-proteksi, bukan tampilan datanya).

---

## 5. Admin

### Cara jadi Admin
Tidak ada self-service lewat UI, tapi sudah ada jalan keluar: `node scripts/seed-admin-user.mjs` bikin akun `demo-admin@treebond.seed` / `demo-seed-not-a-real-login` langsung di MongoDB (lihat `docs/GAP-ANALYSIS-TREEBOND-AI.md` Priority 1).

### Journey
```
node scripts/seed-admin-user.mjs  (sekali saja)
  ↓
Login (/login) — otomatis diarahkan ke /admin setelah sukses
  ↓
/admin — platform stats: users, projects, trees, sponsored,
         verifications, on-chain verifications, transaksi,
         transaksi gagal (semua agregat dari MongoDB, read-only)
  ↓
Connect wallet sendiri (RainbowKit) — harus wallet yang beneran
pegang DEFAULT_ADMIN_ROLE di TreeRegistry
  ↓
Form "Grant On-Chain Role":
    isi wallet address target + pilih OPERATOR_ROLE atau VERIFIER_ROLE
    → wallet admin SENDIRI yang sign & kirim grantRole() —
      tidak ada server/private key yang terlibat (2026-10-04,
      sebelumnya server-side via ADMIN_PRIVATE_KEY, sudah dieliminasi)
```

⚠️ **Dua hal terpisah yang sering ketuker:** session admin (login MongoDB) cuma buka akses ke halaman `/admin`. Yang menentukan transaksi `grantRole()` berhasil atau revert adalah apakah **wallet yang di-connect** — bukan akun yang login — beneran pegang `DEFAULT_ADMIN_ROLE` di kontrak.

⚠️ Form ini **cuma bisa** grant `OPERATOR_ROLE`/`VERIFIER_ROLE` di kontrak `TreeRegistry`. Kalau butuh grant `ORACLE_ROLE` di `VerificationRegistry` (misal ganti wallet oracle), harus manual lewat script/Etherscan — belum ada UI-nya.

### Yang belum bisa dilakukan Admin
Nggak ada UI buat lihat/kelola daftar user, nggak ada handling dispute (status `DISPUTED` ada di enum Tree tapi nggak ada alur kerja untuk itu).

---

## 6. Oracle — bukan role login, ini identitas sistem

PRD §7 mendaftar Oracle sebagai "role", tapi PRD sendiri tidak pernah memberinya user journey (beda dengan Sponsor/Operator/Verifier yang masing-masing punya journey di §8-10) — karena memang bukan manusia yang login.

**Dalam implementasi:** Oracle = satu private key (`ORACLE_PRIVATE_KEY`) yang hidup di environment variable server, dipegang wallet yang sudah punya `ORACLE_ROLE` di `VerificationRegistry`. Tidak ada halaman `/oracle`, tidak ada akun, tidak ada login.

**Kapan Oracle "beraksi":** otomatis, di dalam `POST /api/oracle/submit-verification` — dipicu saat Verifier klik "Submit to Blockchain" (lihat Journey Verifier di atas). Server yang membangun wallet client dari `ORACLE_PRIVATE_KEY` dan mengirim transaksi, **bukan** wallet milik si Verifier maupun Admin.

---

## Dua lapis role yang perlu diingat

Setiap role selain Visitor sebenarnya punya **dua sistem terpisah** yang harus sama-sama benar:

```
MongoDB User.role                    Kontrak AccessControl
(sponsor/operator/verifier/admin)    (OPERATOR_ROLE/VERIFIER_ROLE di
       │                              TreeRegistry, ORACLE_ROLE di
       │                              VerificationRegistry)
       ▼                                     ▼
 Gerbang UI & API                     Gerbang transaksi on-chain
 ("boleh buka halaman ini,           ("transaksi ini akan revert
  boleh panggil route ini")           kalau wallet-nya nggak
                                       punya role ini")
```

Promote seseorang jadi `operator` di MongoDB **tidak otomatis** memberi wallet-nya `OPERATOR_ROLE` di kontrak — dua-duanya harus dikerjakan terpisah (MongoDB manual, on-chain lewat form Admin). Ini bukan bug, memang desain: role aplikasi dan role kontrak sengaja dipisah ([[treebond-smart-contract-integration]]).
