# Gap Analysis & Action Plan — TreeBond AI

Dibandingkan langsung ke `PRD.md` dan `BLUEPRINT-LANDING-PAGE-TREEBOND-AI.md` terhadap kondisi kode saat ini (2026-10-03), setelah integrasi smart contract (wagmi/viem, confirm-then-verify, role guard) selesai di semua 4 contract.

**Framing: ini MVP.** Prioritas = aplikasi jadi dan user flow jalan mulus tanpa dead-end. Security hardening sengaja ditaruh di bagian paling bawah — dicatat biar nggak lupa, bukan buat dikerjakan sekarang. Referensi section PRD ditulis sebagai `§N` di tiap item.

---

## Priority 1 — Supaya app ini bisa benar-benar dipakai & didemo

Tanpa ini, flow nggak bisa jalan sama sekali (bukan cuma "kurang mulus" — beneran mentok).

- [ ] **Tidak ada jalan untuk bikin operator/verifier/admin pertama kali.** `POST /api/auth/register` selalu bikin `role: "sponsor"` (§47, memang disengaja), tapi tidak ada script buat promote user pertama jadi operator/verifier/admin. Tanpa ini, demo narrative §97 mentok di langkah pertama — nggak ada operator yang bisa bikin project/tree, nggak ada verifier yang bisa approve. **Ini blocker #1.**
- [ ] `MONGODB_URI` masih `mongodb://localhost:27017/...` — kalau mau demo/deploy di luar laptop sendiri (Vercel dll), butuh MongoDB Atlas atau provider cloud lain.
- [ ] `ORACLE_PRIVATE_KEY` kosong — tanpa ini, tombol "Submit to Blockchain" di verifier selalu gagal.
- [ ] `ADMIN_PRIVATE_KEY` kosong — tanpa ini, tombol "Grant On-Chain Role" di admin selalu gagal (yang juga berarti operator/verifier baru nggak bisa benar-benar transaksi on-chain walau sudah di-promote di Mongo).
- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` kosong — tidak fatal (ada fallback demo ID dari RainbowKit), tapi isi kalau mau demo rapi.

**Rekomendasi konkret:** saya bisa buatkan `scripts/promote-user.mjs` (jalanin sekali lewat `node`, langsung update MongoDB) buat beresin poin pertama. Mau?

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
