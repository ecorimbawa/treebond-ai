# Admin Feature Plan — TreeBond AI

Admin bukan "core" produk (itu tetap loop Sponsor → Operator → Verifier, sesuai tesis PRD "Register → Verify → Tokenize → Sponsor → Monitor"), tapi dia **gerbang fondasi** — operator/verifier nggak bisa transaksi on-chain apapun sebelum Admin grant role. Dokumen ini daftar fitur Admin yang PRD sebut (§6.4, §7, §55, §75) tapi belum kebangun, diurutkan dari yang paling nutup gap operasional nyata.

Kondisi awal (sebelum dokumen ini dieksekusi): `/admin` cuma py 2 hal — lihat 8 angka statistik (read-only), dan form Grant Role (`OPERATOR_ROLE`/`VERIFIER_ROLE` di TreeRegistry, client-side signing). Semua di bawah ini belum ada.

**Update:** P1, P2, dan P3 udah dieksekusi semua (lihat checkbox di masing-masing section). Sisa cuma Priority 4.

---

## Priority 1 — User Management

**Kenapa ini paling atas:** ini bug operasional yang udah kejadian BERKALI-KALI di sepanjang development — setiap butuh operator/verifier/admin baru, jawabannya selalu "jalanin script seed manual". Admin UI yang ada sekarang cuma urus setengah masalah (role on-chain lewat Grant Role), setengahnya lagi (role di MongoDB) masih harus edit database langsung.

- [x] `GET /api/admin/users` — list semua user (admin-gated), include email/fullName/role/createdAt, dengan pagination
- [x] `PATCH /api/admin/users/[id]/role` — admin-gated, update `User.role` di MongoDB. **Ini murni sisi Mongo**, terpisah dari Grant Role yang sudah ada (yang urus sisi on-chain) — melengkapi, bukan menggantikan. Ditambah guard: admin nggak bisa ganti role dirinya sendiri (cegah self-lockout)
- [x] UI: halaman baru `/admin/users` — tabel dengan dropdown ganti role per user
- [x] Setelah ini ada, `scripts/seed-admin-user.mjs` dan role-provisioning manual lainnya jadi cuma perlu buat **admin pertama** — sisanya bisa lewat UI

---

## Priority 2 — Project & Tree Oversight

**Kenapa:** Admin sekarang cuma lihat ANGKA ("10 trees"), nggak bisa lihat 10 tree itu apa aja, punya siapa, status apa. Nggak bisa investigasi apa-apa dari `/admin` kalau ada yang kelihatan aneh di angkanya.

- [x] `GET /api/admin/projects` — list SEMUA project platform-wide (beda dari `/api/projects` yang publik tapi juga beda dari `/operator/projects` yang scoped ke satu operator)
- [x] `GET /api/admin/trees` — list semua tree platform-wide, filter by status/project/operator. Operator di-resolve lewat `Project.createdBy` (Tree sendiri nggak punya field operator) — kalau `projectId` dan `operatorId` dua-duanya dikirim, hasilnya interseksi, bukan union
- [x] UI: halaman terpisah (`/admin/projects`, `/admin/trees`) linking ke halaman publik yang sudah ada (`/projects/[id]`, `/trees/[id]`) buat detail. `/admin/trees` juga punya filter dropdown status/project/operator

---

## Priority 3 — Dispute Handling + Revoke Role

**Kenapa:** dua-duanya eksplisit disebut PRD tapi belum ada sama sekali. Prioritas lebih rendah dari P1/P2 karena butuh volume data dulu (dispute baru relevan kalau udah ada banyak tree/verifikasi jalan).

- [x] Dispute queue: `GET /api/admin/disputes` — tree dengan status `DISPUTED`
- [x] `POST /api/trees/[id]/resolve-dispute` — **ternyata nggak bisa confirm-then-verify seperti route status lain.** Dicek langsung ke kontrak TreeRegistry yang live di Arbitrum Sepolia (query `isTransitionAllowed(12, x)` buat semua `x` 0-11): hasilnya `false` buat semuanya, dan nggak ada fungsi `resolveDispute`/sejenisnya di ABI manapun (TreeRegistry/TreeNFT/TreeBond/VerificationRegistry). Artinya `DISPUTED` emang didesain terminal di level kontrak — nggak ada transaksi yang bisa dikonfirmasi karena nggak ada transaksi yang valid. Diputuskan (dengan user) buat jalan **Mongo-only**: endpoint ini langsung update `Tree.status` di MongoDB tanpa tx on-chain. Konsekuensinya didokumentasikan jelas di UI: status on-chain tree itu tetap nunjukin `DISPUTED` selamanya sampai TreeRegistry di-upgrade dengan fungsi resolusi yang asli
- [x] UI: halaman `/admin/disputes` buat review + resolve (dengan disclaimer Mongo-only di atas)
- [x] Extend `GrantRoleForm` jadi dua tombol (Grant/Revoke) — `revokeRole()` di kontrak sudah ada, hook `useRevokeRole` dibuat (copy pola `useGrantRole`)

---

## Priority 4 — Nanti, butuh sistem lain dulu

- [ ] Grant `ORACLE_ROLE` lewat UI — perlu extend form buat target kontrak `VerificationRegistry` juga (sekarang cuma TreeRegistry). Niche, karena ganti wallet Oracle jarang terjadi
- [ ] Stat "AI analyses" dan "IPFS uploads" (disebut PRD §75) — nggak bisa diisi sampai pipeline AI/IPFS asli ada (lihat `GAP-ANALYSIS-TREEBOND-AI.md` Priority 3, masih sengaja ditunda)

---

## Rekomendasi eksekusi

Kerjain P1 duluan secara utuh sebelum ke P2 — ini satu-satunya item yang BENERAN ngilangin friction operasional yang udah kerasa dari awal project ini. P2/P3 sifatnya "nice to have buat visibility", nggak ada yang ngeblok flow user manapun kalau belum ada.
