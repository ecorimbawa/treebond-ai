# Gap Analysis & Action Plan — TreeBond AI

Dibandingkan langsung ke `PRD.md` dan `BLUEPRINT-LANDING-PAGE-TREEBOND-AI.md` terhadap kondisi kode saat ini (2026-10-03), setelah integrasi smart contract (wagmi/viem, confirm-then-verify, role guard) selesai di semua 4 contract.

**Framing: ini MVP.** Prioritas = aplikasi jadi dan user flow jalan mulus tanpa dead-end. Security hardening sengaja ditaruh di bagian paling bawah — dicatat biar nggak lupa, bukan buat dikerjakan sekarang. Referensi section PRD ditulis sebagai `§N` di tiap item.

---

## Audit Verifier (2026-10-04)

- [x] ~~**Queue selalu kosong.**~~ **FIXED.** Ke-7 evidence dari seed data awal semuanya udah berstatus approved/rejected — nggak ada satupun yang `pending`, jadi `/verifier` selalu nunjukin "No evidence pending review" walau kodenya benar. `scripts/seed-pending-evidence.mjs` (baru) nambahin 2 evidence `pending` ke tree yang belum pernah disentuh.
- [x] ~~**`/verifier/[verificationId]` nggak ada auth check sama sekali.**~~ **FIXED.** Siapapun yang tau/nebak ID evidence bisa liat detail evidence + AI analysis tanpa login, apalagi tanpa jadi verifier (tombol approve/reject tetap aman karena API-nya sudah ter-gate, tapi halaman VIEW-nya kebuka ke siapa aja). Ditambahkan redirect check yang sama kayak `/admin`.
- [x] ~~Halaman queue (`/verifier`) juga nggak redirect non-verifier, cuma diem-diem nunjukin list kosong.~~ **FIXED** — sekarang konsisten redirect ke `/login` kayak halaman lain.
- [x] Nambahin link "← Back to Queue" di halaman review (sebelumnya cuma bisa balik lewat RoleHeader, nggak ada inline link kayak halaman lain).

---

## Priority 1 — Supaya app ini bisa benar-benar dipakai & didemo

Tanpa ini, flow nggak bisa jalan sama sekali (bukan cuma "kurang mulus" — beneran mentok).

- [x] ~~**Tidak ada jalan untuk bikin operator/verifier/admin pertama kali.**~~ **FIXED (2026-10-03).** `scripts/seed-demo-data.mjs` sudah bikin user `demo-operator@treebond.seed` (role operator) dan `demo-verifier@treebond.seed` (role verifier); `scripts/seed-admin-user.mjs` (baru) bikin `demo-admin@treebond.seed` (role admin). Semua password `demo-seed-not-a-real-login`. Login sebagai operator/verifier/admin sekarang bisa langsung dicoba.
- [x] ~~**`ADMIN_PRIVATE_KEY` kosong, bikin tombol "Grant On-Chain Role" selalu gagal.**~~ **DIELIMINASI (2026-10-04).** Server-side signing untuk `grantRole()` dihapus total — `GrantRoleForm` sekarang sign langsung dari wallet yang di-connect admin di browser (pola sama kayak Sponsor/Operator), persis kayak semua write action lain di app ini. Nggak ada lagi private key yang perlu disimpan di server untuk fitur ini. `ADMIN_PRIVATE_KEY` dihapus dari `.env.example`/`.env.local`, route `/api/admin/grant-role` dihapus (sudah nggak dipakai). Syaratnya cuma: wallet yang di-connect harus pegang `DEFAULT_ADMIN_ROLE` beneran di TreeRegistry.
- [x] ~~`MONGODB_URI` masih `mongodb://localhost:27017/...`~~ **FIXED** — sudah diisi MongoDB Atlas.
- [x] ~~`ORACLE_PRIVATE_KEY` kosong.~~ **FIXED (2026-10-04).** Diisi dan diverifikasi langsung ke live contract: format valid, address yang diturunkan cocok persis sama `0x71AF...8527F81`, saldo ~0.098 ETH (cukup buat gas), dan wallet ini beneran pegang `ORACLE_ROLE` di `VerificationRegistry` (dicek via `hasRole()` on-chain, bukan asumsi). Tombol "Submit to Blockchain" di Verifier sekarang siap jalan. **Ini tetap server-side (bukan dieliminasi kayak Admin)** karena memang desain PRD §34 — Oracle sengaja jadi identitas sistem terpisah dari verifier manapun, bukan keterbatasan teknis.
- [x] ~~`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` kosong.~~ **FIXED (2026-10-04).** Diisi project ID asli dari WalletConnect Cloud.

**Priority 1 tuntas 100%.**

- [x] ~~**Tree stuck di REGISTERED selamanya, nggak bisa jadi AVAILABLE.**~~ **FIXED (2026-10-03).** Transisi on-chain `REGISTERED → PENDING_VERIFICATION → VERIFIED → AVAILABLE` wajib lewat `updateTreeStatus()`, tapi nggak ada UI manapun yang manggil itu. Dibereskan dengan `components/operator/OperatorToolsPanel.tsx` di Tree Passport, kelihatan cuma buat wallet yang pegang `OPERATOR_ROLE`. Jalan pintas demo (skip gerbang approval Verifier di on-chain tree status), bukan wiring penuh sesuai PRD.
- [x] ~~**Halaman upload evidence operator (`/operator/trees/[treeId]/evidence/new`) nggak ada link-nya dari manapun.**~~ **FIXED (2026-10-03).** Sama kayak bug `/projects/[projectId]` sebelumnya — halamannya jalan, cuma nggak ada jalur klik. Ditambahkan ke `OperatorToolsPanel` (link "Upload Monitoring Evidence", selalu kelihatan buat operator terlepas dari status tree).
- [x] ~~**`/operator/projects` nggak ada link ke halaman detail project publik.**~~ **FIXED (2026-10-03).** Operator sekarang nggak punya jalan balik ke daftar tree existing di project mereka. Nama project di list sekarang link ke `/projects/[projectId]`.
- [x] ~~**Landing page nggak ada link ke `/login` sama sekali, DAN login selalu redirect ke `/dashboard` apapun role-nya.**~~ **FIXED (2026-10-04).** Dua masalah ketemu bareng pas nelusurin jalur landing page → Admin: (1) landing page (`app/(public)/page.tsx`) nggak punya link "Log In" di manapun — cuma Explore page yang punya; (2) lebih parah, `app/(auth)/login/page.tsx` hardcode `router.push("/dashboard")` abis login sukses, **berlaku untuk semua role**, jadi operator/verifier/admin yang baru login tetap didorong ke halaman Sponsor yang nggak relevan buat mereka. Dibereskan dengan baca `session.user.role` lewat `getSession()` abis sign-in, redirect ke home masing-masing role (`/operator`, `/verifier`, `/admin`, fallback `/dashboard` buat sponsor).

---

## Priority 2 — Demo narrative check (§97), supaya "jalan tanpa putus"

Saya telusuri ulang persis alur demo di PRD langkah-demi-langkah untuk cek ada dead-end atau tidak:

| Langkah §97 | Status | Catatan |
| --- | --- | --- |
| 1:00 Browse | ✅ jalan | `/explore` |
| 1:30 Sponsor | ✅ jalan | Tree Passport + connect wallet + sponsor button |
| 2:00 Passport (ownership) | ✅ jalan | Chain panel baca `ownerOf` langsung dari kontrak |
| 2:30 Monitoring (upload foto) | ✅ jalan | Form manual-entry di `/operator/trees/[treeId]/evidence/new` |
| 3:00 AI (Health/Growth/Anomaly) | ⚠️ sebagian | Chain panel publik cuma nampilin Health+Growth dari verifikasi yang **sudah ON_CHAIN** — anomaly risk tidak pernah ditampilkan ke publik di manapun |
| 3:30 Verifier approve | ✅ jalan | `/verifier/[verificationId]` |
| 4:00 "Show transaction" | ⚠️ kurang | Tidak ada link block explorer (Arbiscan) di Tree Passport publik — txHash cuma kelihatan di halaman internal verifier |
| 4:30 Final passport | ✅ jalan | Semua section (Physical/AI/Verification/Blockchain) sudah ada di satu halaman |

Dua item ⚠️ di atas murni **tampilan**, bukan logic yang rusak — datanya sudah ada di database/chain, cuma belum dirender. Kalau mau demo keliatan lengkap persis sesuai narasi PRD:

- [ ] Tambahkan anomaly risk ke `TreePassportChainPanel` (atau tampilkan AI score dari evidence Mongo yang belum on-chain, biar sponsor tetap lihat progress walau verifier belum submit ke chain)
- [ ] Tambahkan link "View Transaction" (`https://sepolia.arbiscan.io/tx/...`) di Tree Passport publik, bukan cuma di halaman verifier

---

## Priority 3 — Fitur yang sengaja ditunda saat integrasi smart contract

Tidak bikin flow putus, tapi secara PRD memang belum ada. Dikerjakan kalau scope-nya memang sudah mau diperluas:

- [ ] **IPFS pinning (§26-30)** — `imageCid`/`metadataCid` masih string form manual, bukan upload asli.
- [ ] **AI Verification asli (§31-34)** — skor diisi manual oleh operator (`AiAnalysis.modelName: "manual-entry"`), bukan dari model vision beneran.
- [ ] **Wallet linking (§17-18)** — model `Wallet` ada tapi nol pemakaian. Dashboard sponsor scope by wallet yang *sedang connect*, bukan wallet yang di-link ke akun.

---

## Priority 4 — Nice-to-have, tidak mendesak untuk MVP

- [ ] GPS distance-check (§36) — belum ada logic radius-match antara GPS registrasi vs GPS evidence.
- [ ] Verification scoring formula (§35) masih simplifikasi (`avg(health, growth)`), bukan 5 faktor lengkap dari PRD.
- [ ] Filter Explore belum lengkap (§13) — baru status + search, belum ada filter lokasi/project/sort by age/health/price.
- [ ] Notification system (§71) — model ada, nol pemakaian.
- [ ] Dispute handling (§6.4) — status `DISPUTED` ada di enum, tidak ada UI/logic.
- [ ] Map visualization (§14, §83) — lat/long cuma angka plain text.
- [ ] Analytics tracking (§76) — metrik seperti `verification_success_rate` belum dihitung di manapun.

---

## Nanti saja — security hardening (bukan prioritas MVP, tapi dicatat biar tidak lupa)

Ditemukan saat audit, **sengaja ditunda** sesuai arahan: fokus MVP dulu, ini dibereskan belakangan sebelum ada user/dana asli yang bukan tim sendiri.

- [ ] `PATCH /api/trees/[id]` tidak ada auth check + terima body bebas — bisa override field apapun tanpa lewat confirm-then-verify. Saat ini juga tidak dipanggil UI manapun.
- [ ] `POST /api/trees` (create draft) tidak ada role check.

---

## Di luar scope repo ini

- **Solidity source / Foundry tests (§93)** — repo ini tidak punya file `.sol`. Ke-4 contract sudah di-deploy & verified eksternal (`docs/Log-Deploy-ABI-....md`), source-nya hidup di tempat lain.
