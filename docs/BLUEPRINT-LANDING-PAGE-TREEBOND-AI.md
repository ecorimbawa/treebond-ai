# Blueprint — Landing Page TreeBond AI

Dokumen ini adalah versi **build-ready** dari landing page TreeBond AI: bukan lagi requirement/contoh, tapi copywriting final dan breakdown section yang bisa langsung dipakai untuk implementasi (`app/page.tsx` atau `components/landing/*`).

Sumber kebenaran konsep tetap `PRD.md`. Semua data contoh di dokumen ini (tree ID, skor AI, harga, alamat wallet) konsisten dengan demo dataset di `PRD.md` Section 96, supaya landing page dan halaman lain (`/explore`, `/trees/[id]`) tidak pernah menampilkan data yang berbeda saat demo.

---

## 0. Cara Pakai Dokumen Ini

Setiap section di bawah punya dua bagian:

```
Purpose   → kenapa section ini ada (1 baris)
Layout    → catatan struktur/visual singkat
Copy      → teks final, siap copy-paste ke komponen
```

Teks di dalam blok `Copy` adalah **final string** — boleh langsung dipakai sebagai isi JSX, bukan placeholder.

---

## 1. Information Architecture

```
/ (Landing Page)
├── #top              Navbar + Hero
├── #problem          Problem Statement
├── #how-it-works     How It Works
├── #why-blockchain   Why Blockchain
├── #ai-verification  AI Verification
├── #rwa              Tree RWA Explainer
├── #explore-preview  Featured Trees
├── #provenance       Provenance / Monitoring Timeline
├── #passport         Tree Passport Preview
├── #ecosystem        Who It's For
├── #technology        Network / Infrastructure
├── #faq               FAQ
└── #launch            Final CTA + Footer
```

---

## 2. Design System — Mengikuti `app/page.tsx`

Landing page TreeBond AI **tidak memperkenalkan palet atau komponen baru** — seluruh token warna, tipografi, dan pola komponen di bawah diambil langsung dari implementasi yang sudah berjalan di `app/page.tsx` (Agriva). Tujuannya supaya TreeBond AI bisa dibangun sebagai *re-skin* (copy & data berbeda, sistem visual sama persis), bukan desain dari nol.

### 2.1 Color Tokens

| Token | Hex | Dipakai untuk |
| --- | --- | --- |
| `bg-app` | `#FAFAF7` | Background utama halaman |
| `bg-white` | `#FFFFFF` | Card, navbar solid, FAQ container |
| `bg-panel` | `#F3F5F1` | Section alternate background, metric/inventory panel |
| `bg-badge-green` | `#DDEEE3` | Background icon badge & status pill hijau |
| `bg-badge-blue` | `#e7ebfc` | Background icon badge varian blockchain |
| `bg-hero-badge` | `#eff7f1` | Background eyebrow badge di Hero |
| `bg-dark` | `#163D2A` | Section gelap (Passport, Final CTA), hover state tombol primary |
| `bg-footer` | `#122e20` | Background footer |
| `text-primary` | `#18201B` | Body text default, heading di background terang |
| `text-heading` | `#163D2A` | Heading besar, wordmark logo |
| `text-muted` | `#667069` | Subheading, body paragraph, label |
| `text-subtle` | `#929A94` | Label kecil (nomor step, small print) |
| `text-footer-body` | `#c8d7cc` | Body text di atas background gelap |
| `text-footer-muted` | `#91a999` | Label kolom footer, copyright |
| `text-footer-trust` | `#b5c9ba` | Trust line di Final CTA/footer |
| `accent-green` | `#246B45` | Primary action, icon, link verified |
| `accent-green-deep` | `#163D2A` | Hover state tombol primary |
| `accent-amber` | `#B7791F` | Eyebrow label di background terang, border-left callout |
| `accent-amber-dark` | `#D9A441` | Eyebrow label di background gelap, connector, focus ring di footer |
| `accent-blue` | `#3154D5` | Penanda khusus "on-chain / blockchain" (FlowItem step terakhir, "Powered by Arbitrum") |
| `border-default` | `#e2e7e2` | Border card & section standar |
| `border-divider` | `#d9e2da` | Divider tipis, border tombol secondary |
| `border-hero-badge` | `#cfe2d4` | Border badge eyebrow Hero |
| `border-hover` | `#9ec6aa` | Border card saat hover |
| `border-dashed` | `#a8b4aa` / `#bfd0c2` | Connector vertikal dashed antar step/timeline |

Aturan semantik warna (berlaku juga untuk TreeBond, jangan ditukar):

```
Hijau (#246B45 / #DDEEE3)   → verified, trust, primary action
Biru (#3154D5 / #e7ebfc)    → khusus penanda "on-chain" / blockchain
Amber (#B7791F / #D9A441)   → eyebrow, highlight, callout — bukan status
```

### 2.2 Status Pill — 3 state kesehatan pohon

`app/page.tsx` saat ini hanya punya 1 status pill ("VERIFIED", hijau). TreeBond butuh 3 state (Healthy / Monitoring / Dead) mengikuti Tree Lifecycle di `PRD.md` Section 21. Dua state pertama memakai token yang sudah ada di atas; state ketiga adalah **satu-satunya token baru** di seluruh dokumen ini (ditandai jelas, tidak ada di `app/page.tsx` sekarang):

```
🟢 Healthy      bg-[#DDEEE3]  text-[#246B45]   (token sudah ada)
🟡 Monitoring   bg-[#FBEFD9]  text-[#B7791F]   (turunan accent-amber yang sudah ada)
🔴 Dead/Risk    bg-[#F7E1DE]  text-[#B3402F]   (BARU — belum ada di app/page.tsx)
```

### 2.3 Typography

```
Font sans     next/font default (Geist) — sudah terpasang
Font mono     var(--font-geist-mono), class: font-[family-name:var(--font-geist-mono)]
              dipakai untuk: Tree ID, wallet address, token ID, skor data

H1 (Hero)         text-5xl sm:text-6xl lg:text-7xl · font-extrabold · leading-[.98] · tracking-[-.065em]
H2 (Section)      text-4xl sm:text-5xl · font-extrabold · leading-[1.08] · tracking-[-.055em]
H3 (Card title)   text-xl · font-extrabold · tracking-[-.04em]
Eyebrow           text-xs · font-extrabold · tracking-[0.16em]/[.14em] · accent-amber
Body              text-base sm:text-lg · leading-7/8 · text-muted
Data/mono value   text-xs/text-sm · font-mono
```

### 2.4 Spacing, Radius & Elevation

```
Container        mx-auto max-w-[1280px] px-5 lg:px-8
Section rhythm    py-24 sm:py-32  (section besar: sm:py-36)
Header height     h-[72px], sticky, transparan → solid+border saat scroll > 12px
Touch target      min-h-11 (44px) untuk semua tombol/link interaktif

Radius            rounded-xl   → tombol, icon badge
                  rounded-2xl  → card, panel
                  rounded-full → pill/badge, nomor bulat

Shadow            shadow-[0_20px_50px_rgba(22,61,42,.1)]  → khusus Tree Passport card
```

### 2.5 Component Patterns (reuse langsung dari `app/page.tsx`)

```
Logo
  size-7 rounded-lg bg-[#246B45] text-white (icon square)
  + wordmark text-lg font-extrabold tracking-[-.06em] text-[#163D2A]

Button — primary
  bg-[#246B45] text-white hover:bg-[#163D2A]
  rounded-xl px-5 min-h-11 font-bold text-sm
  + ArrowRight icon, translate-x saat hover

Button — secondary
  border border-[#d9e2da] bg-white text-[#163D2A]
  hover:border-[#246B45]

SectionIntro
  Eyebrow (accent-amber, tracked caps) + H2 (tight tracking) + body (text-muted)

Card
  rounded-2xl border border-[#e2e7e2] bg-white p-6
  hover:-translate-y-0.5 hover:border-[#9ec6aa]

Icon badge
  grid size-11 place-items-center rounded-xl
  bg-[#DDEEE3] text-[#246B45]   (varian blockchain: bg-[#e7ebfc] text-[#3154D5])

Status pill
  inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold
  (lihat token 2.2)

Dark section (Passport, Final CTA)
  bg-[#163D2A] text-white, eyebrow text-[#D9A441], body text-[#c8d7cc]

Footer
  bg-[#122e20] text-[#c8d7cc], column label text-[#91a999], focus ring #D9A441

Divider
  border-t border-[#e2e7e2]   (dark section: border-white/10)

Flow connector (RWA explainer, 2 langkah beda warna)
  step 1→2: h-9 w-px bg-[#D9A441]
  step 2→3: h-9 w-px bg-[#3154D5]   (menandakan masuk ke "on-chain")
```

### 2.6 Component Reuse Map

Komponen di `app/page.tsx` bisa dipakai ulang langsung untuk section Blueprint ini — copy diganti, struktur & styling tetap:

| Komponen di `app/page.tsx` | Dipakai untuk section Blueprint |
| --- | --- |
| `Logo` | Navbar |
| `Button` | Semua CTA |
| `SectionIntro` | Heading tiap section (Problem, How It Works, Why Blockchain, AI Verification, RWA, Provenance, Ecosystem, Technology, FAQ) |
| `PassportCard` (+ `dark` prop) | Hero Tree Passport card & Tree Passport Preview |
| `DataRow` | Baris data di dalam Passport card |
| `FlowItem` | Flow panel di Tree RWA Explainer |
| `FooterColumn` | Footer |
| pola array `process` | 4 kartu How It Works |
| pola array `timeline` | Provenance timeline |
| pola array `faqs` | FAQ accordion |

`Inventory` (before/after redemption) **tidak dipakai** — TreeBond tidak punya alur redemption seperti Agriva.

### 2.7 Icon Mapping (lucide-react — sudah terpasang)

Prioritaskan icon yang **sudah diimpor** di `app/page.tsx` sebelum menambah icon baru (tetap dari paket yang sama, tidak menambah dependency baru):

```
Sudah dipakai di app/page.tsx, reuse langsung:
  Logo / Register        Sprout
  Verify                  BadgeCheck
  Tokenize / blockchain    Blocks
  Monitor                   RefreshCw
  GPS / lokasi               MapPin
  Traceable                   Route
  Verifiable                   ShieldCheck
  Efficient / score             Gauge
  Sponsor role                   Handshake
  Operator role                    ClipboardList
  CTA arrow                         ArrowRight / ArrowUpRight
  Konfirmasi                          Check
  FAQ chevron                          ChevronDown
  Mobile menu                           Menu / X

Baru (belum diimpor, tetap lucide-react):
  AI Verification         Cpu
  Human verifier             Users
  Admin role                    Landmark
```

---

## 3. Compliance Guardrails (wajib dipatuhi seluruh copy)

```
TIDAK BOLEH menjanjikan imbal hasil finansial ("guaranteed return", "profit")
TIDAK BOLEH mengklaim kepemilikan lahan legal ("you own this land")
TIDAK BOLEH menyebut carbon credit tanpa label "estimate" / belum tersertifikasi
SELALU beri disclaimer: AI membantu verifikasi, bukan penentu tunggal
SELALU beri label jelas: Estimated vs Verified vs Certified
```

Guardrail ini turunan langsung dari `PRD.md` Section 20, 34, 89 — setiap copy final di bawah sudah ditulis untuk patuh terhadap batasan ini.

---

## 4. Navbar

**Purpose** — Navigasi cepat + reinforce branding + 1 conversion CTA yang selalu terlihat.

**Layout** — Sticky, transparan di top, solid + border-bottom setelah scroll. Mobile: hamburger → full-width dropdown.

**Copy**

```
Logo wordmark:     TreeBond  [AI]
Logo aria-label:   "TreeBond AI home"

Nav links:
  How It Works     → #how-it-works
  Tree Explorer    → #explore-preview
  Ecosystem        → #ecosystem
  Technology       → #technology
  FAQ              → #faq

CTA (desktop, always visible):  Explore Trees   → /explore
CTA (mobile drawer, bottom):    Register Project → /operator/projects
```

---

## 5. Hero

**Purpose** — Sampaikan positioning utama dalam 3 detik pertama, tanpa perlu scroll.

**Layout** — Dua kolom (desktop): copy kiri, Tree Passport card kanan. Mobile: stack, card di bawah copy.

**Copy**

```
Eyebrow badge:  Arbitrum Sepolia Testnet

H1:
Making Living Assets Verifiable On-Chain.

Subhead:
TreeBond AI turns real trees into continuously monitored,
independently verified digital assets — connecting sponsors,
field operators, and verifiers around one living record of proof.

CTA Primary:    Explore Trees     → /explore
CTA Secondary:  Register Project  → /operator/projects

Trust line:
Field Evidence · AI Verification · On-chain Proof
```

**Hero visual — Tree Passport card (full copy)**

```
Header label:        TREE RWA #192
Status badge:        ✓ VERIFIED

Species (large):     Sengon
Location:             Central Java

Metric panel:
  Health Score        94 / 100

Data rows:
  Tree ID             TREE-JTG-000192
  Planted             01 Sep 2026
  Sponsor             0x71...92A
  Verifier            0x42B...991
  Field Evidence      Available ↗

Network rows:
  Network             Arbitrum Sepolia
  Contract            0x9F1...204
  Token ID            192

Card CTA:             View Tree Passport ↗   → /trees/192
```

---

## 6. Problem Statement

**Purpose** — Bangun urgensi: tunjukkan celah kepercayaan yang ada hari ini, sebelum menjelaskan solusi.

**Layout** — Dua kolom: teks masalah kiri, panel "4 pertanyaan tanpa jawaban independen" kanan (mirip numbered list dengan dashed connector).

**Copy**

```
Eyebrow:   THE PROBLEM

Title:
Living assets are real.
Proof of their condition is not.

Body:
A single tree can stand for years between the moment it's
planted and the moment someone actually checks on it. In that
gap, a photo can be reused, a location can be faked, and a
growth claim can go completely unchecked — until the person
who sponsored it has no way to know if the tree is even still
alive.

Callout (border-left):
Blockchain can't verify a tree by itself.
TreeBond AI connects it to the real world first.
```

**Side panel — "What sponsors currently can't verify"**

```
Panel eyebrow:  WHAT SPONSORS CURRENTLY CAN'T VERIFY

01  Existence
    Is the tree actually planted where it's claimed to be?

02  Condition
    Is it healthy, growing, or already dead?

03  History
    Has anyone actually checked on it since planting?

04  Ownership
    Whose record decides any of this — and can it be
    changed quietly?

Panel footer:
Four questions. Zero independent answers — until now.
```

---

## 7. How It Works

**Purpose** — Jelaskan loop utama produk secara visual, 4 langkah, non-teknis.

**Layout** — 4 kartu grid (2×2 mobile, 1×4 desktop), masing-masing: icon, nomor, label, judul, deskripsi, baris data mono.

**Copy**

```
Eyebrow:   FROM SEEDLING TO ON-CHAIN PROOF
Title:     One tree. One continuously verified journey.
```

```
01  REGISTER
    Plant the record, not just the tree.
    Field operators register each tree with species, GPS
    coordinates, and an initial photo — creating a permanent
    identity before anything is claimed.
    Data: TREE-JTG-000192 registered

02  VERIFY
    Confirm what AI sees before anything counts.
    AI analyzes every submitted photo for tree detection,
    health, and growth signals. A human verifier reviews the
    result before it goes anywhere near the blockchain.
    Data: AI confidence 98% · Verifier approved

03  TOKENIZE
    Put the verified tree on-chain.
    Only verified trees can be minted. Once approved, the tree
    becomes a traceable Tree RWA — an ERC-721 token on
    Arbitrum Sepolia.
    Data: Token #192 minted

04  MONITOR
    Keep proving it, not just once.
    Every monitoring cycle adds a new evidence record — new
    photo, new AI analysis, new verification — so a tree's
    status is never more than one cycle out of date.
    Data: 5 verification records
```

---

## 8. Why Blockchain

**Purpose** — Jawab pertanyaan skeptis "kenapa harus blockchain?" dengan klaim yang presisi, bukan hype.

**Layout** — Dua kolom: teks kiri, panel kontras "Before / After" kanan.

**Copy**

```
Eyebrow:   WHY BLOCKCHAIN

Title:
Not proof of life. Proof the record wasn't changed.

Body:
TreeBond AI doesn't ask you to trust a blockchain to know a
tree is alive — it asks field evidence, AI, and human
verifiers to establish that first. What the blockchain
guarantees is narrower and more honest: once a verification
is recorded, nobody — including TreeBond — can quietly edit it.

Capability list:
  Immutable ownership record
  Transparent verification history
  Auditable evidence trail (CID + hash)
  Programmable settlement
```

**Side panel — Before / After**

```
Panel eyebrow:  BEFORE vs AFTER

WITHOUT TREEBOND
A screenshot of a photo. A number in someone's spreadsheet.
Trust required.

WITH TREEBOND
Hash-anchored evidence. Verifier-approved record.
Trust optional.
```

---

## 9. AI Verification

**Purpose** — Tunjukkan AI sebagai assistant yang kredibel, bukan black box dan bukan otoritas tunggal.

**Layout** — Pipeline horizontal (Photo → AI → Scores → Human → On-chain) + kartu hasil AI di sisi kanan/bawah.

**Copy**

```
Eyebrow:   AI VERIFICATION

Title:
AI reads the photo. A human still signs off.

Body:
Every monitoring photo runs through TreeBond's AI pipeline
before a verifier ever sees it — flagging tree detection
confidence, health score, growth score, and anomaly risk
automatically, so verifiers spend their time reviewing, not
guessing.

Pipeline labels:
Photo → AI Analysis → Health · Growth · Anomaly → Human
Verification → On-chain Record
```

**AI result card**

```
Card label:     AI ANALYSIS · TREE-JTG-000192

Health Score     94 / 100
Growth Score     87 / 100
Anomaly Risk      4%
Status            Healthy

Explanation:
The submitted image is visually consistent with previous
evidence. No major health anomaly was detected.
```

```
Disclaimer (always visible under this section):
AI assists verification. It never has sole authority to
approve a tree on-chain — every result is reviewed by a
human verifier first.
```

---

## 10. Tree RWA Explainer

**Purpose** — Jelaskan dengan tepat apa yang dimiliki sponsor — mencegah kesalahpahaman legal.

**Layout** — Dua kolom: teks + callout kiri, flow panel (Physical → Verification → Blockchain) kanan.

**Copy**

```
Eyebrow:   REAL-WORLD ASSETS

Title:
Physical tree.
Digital representation.

Body:
A Tree RWA connects something that exists in the physical
world — a verified, GPS-located, continuously monitored tree
— with a digital record that can be tracked, held, and
checked by anyone, at any time.

Callout (border-left, bold):
1 Tree RWA = a verified sponsorship record for 1 real,
monitored tree.

Small print:
The exact rights a token carries depend on the project and
its sponsorship terms. TreeBond AI represents verified
sponsorship and monitoring history — not legal ownership of
land.
```

**Flow panel**

```
PHYSICAL WORLD
1 Sengon Tree · Central Java
Planted 01 Sep 2026 · TREE-JTG-000192

VERIFICATION
Health · Growth · Location confirmed
Reviewed by an independent verifier

BLOCKCHAIN
TREE RWA #192
1 token · Arbitrum Sepolia
```

---

## 11. Featured Trees

**Purpose** — Social proof + preview nyata dari `/explore`.

**Layout** — Grid 3–4 kartu tree, format identik dengan yang dipakai di `/explore` supaya reusable.

**Copy**

```
Eyebrow:   EXPLORE TREES

Title:
A few trees, already being watched.

Body:
Every tree below has its own identity, GPS location, and
verification history — and every one of them is one photo
away from its next update.
```

**Tree cards**

```
Card 1
  TREE-JTG-000192 · Sengon · Central Java
  🟢 Healthy
  Health        94/100
  Verification  5
  Rp100.000
  [ View Tree ]

Card 2
  TREE-JTG-000205 · Mahogany · East Java
  🟢 Healthy
  Health        89/100
  Verification  3
  Rp150.000
  [ View Tree ]

Card 3
  TREE-JTG-000241 · Teak · Central Java
  🟡 Monitoring
  Health        76/100
  Verification  2
  Rp120.000
  [ View Tree ]
```

Warna status pill mengikuti token 2.2 (Healthy = hijau, Monitoring = amber, Dead/Risk = merah baru).

```
Section CTA:  View All Trees   → /explore
```

---

## 12. Provenance / Monitoring Timeline

**Purpose** — Tunjukkan bahwa setiap Tree RWA punya riwayat yang bisa ditelusuri, bukan snapshot sekali jadi.

**Layout** — Dua kolom: teks + CTA kiri, vertical timeline kanan (dashed connector antar item, mengikuti pola visual yang sama dengan How It Works).

**Copy**

```
Eyebrow:   PROVENANCE

Title:
Know the story behind every tree.

Body:
TreeBond links every Tree RWA back to its full monitoring
history — so anyone holding or checking one can trace it from
the day it was planted to its most recent verification.

CTA:  View Monitoring History   → /trees/192#history
```

**Timeline**

```
Tree Registered          Wonosobo, Central Java
Sengon Planted            01 Sep 2026
Initial Photo Verified    GPS matched
Growth Monitoring Logged  5 records
AI Health Check           Score 94/100
Tree RWA Minted           Arbitrum Sepolia
```

---

## 13. Tree Passport Preview

**Purpose** — Perlihatkan "produk akhir" secara penuh — halaman showcase utama produk (`PRD.md` Section 108).

**Layout** — Dark section (kontras dari section lain), dua kolom: headline kiri, full passport card kanan.

**Copy**

```
Eyebrow:   TREE PASSPORT

Title:
Every tree has a story.
Every story has proof.

Body:
Each TreeBond RWA carries a digital passport linking its
physical identity, AI analysis, verification history, and
on-chain record — in one place, open to anyone who wants to
check it.
```

**Passport card (full)**

```
TREE-JTG-000192
🌳 Sengon · Central Java

PHYSICAL
  Age               8 months
  Height             1.82 m
  Status             Healthy

AI ANALYSIS
  Health             94/100
  Growth             87/100
  Anomaly Risk        4%

VERIFICATION
  Initial planting   ✓
  GPS                ✓
  Photo              ✓
  AI analysis        ✓
  Human verifier     ✓
  On-chain           ✓

BLOCKCHAIN
  Network            Arbitrum Sepolia
  Token ID           192
  Owner              0x71...92A

[ View Full Tree Passport ]   → /trees/192
[ View IPFS Evidence ]        → ipfs gateway link
```

---

## 14. Ecosystem (Who It's For)

**Purpose** — Tunjukkan TreeBond sebagai infrastruktur multi-pihak.

**Layout** — Grid 4 kartu (2×2 mobile, 1×4 desktop).

**Copy**

```
Eyebrow:   ECOSYSTEM
Title:     Built for everyone behind the tree.
```

```
Sponsors
Sponsor a real tree, track its growth, and hold a digital
record you can actually check — not just a certificate you
have to trust.

Operators
Register projects and trees, upload monitoring evidence, and
build a verifiable history for every hectare you manage.

Verifiers
Review AI analysis against field evidence and approve or
reject verification before anything reaches the blockchain.

Admins
Oversee projects, operators, and verifiers, and step in when
a dispute needs a human decision.
```

---

## 15. Technology

**Purpose** — Bangun kredibilitas teknis tanpa terasa "terlalu crypto".

**Layout** — Grid 3 kartu + network badge di bawah.

**Copy**

```
Eyebrow:   INFRASTRUCTURE
Title:     Built for transparent, living assets.
```

```
Traceable
Every evidence upload and verification on a Tree RWA is
recorded on-chain and open to independent inspection — not
locked in a private database.

Verifiable
No tree is tokenized without first passing through AI
analysis and human verification. Claims are checked before
they're recorded, not after.

Efficient
TreeBond AI runs on Arbitrum, keeping on-chain verification
fast and inexpensive enough for frequent, real monitoring
cycles — not just one-time minting.
```

```
Network badge:  Powered by Arbitrum Sepolia Testnet
```

---

## 16. FAQ

**Purpose** — Preemptively jawab pertanyaan skeptis sebelum visitor connect wallet.

**Layout** — Accordion, satu kolom, max-width terbatas untuk keterbacaan.

**Copy**

```
Eyebrow:   FAQ
Title:     Questions worth answering before you connect a wallet.
```

**Q1. What exactly does a Tree RWA represent?**
A Tree RWA is a digital record of a verified, physical tree — its species, location, planting date, and ongoing monitoring history. It represents verified sponsorship and provenance, not legal ownership of the land the tree stands on.

**Q2. How is a tree verified before it's tokenized?**
Every tree starts with field evidence — a photo, GPS coordinates, and metadata. AI analyzes that evidence for tree detection, health, and growth signals, and a human verifier reviews the AI result before approving it. Only approved verifications are ever submitted on-chain.

**Q3. What happens if AI detects an anomaly?**
An anomaly flag doesn't reject a tree automatically — it routes the evidence to a verifier for closer review. Anomalies can mean anything from early disease signs to a simple lighting issue in the photo, so a human always makes the final call.

**Q4. Is TreeBond AI a carbon credit platform?**
No. TreeBond AI's current scope is tree registration, monitoring, and verified sponsorship only. Any future carbon impact figures will be clearly labeled as estimates until they go through an independent certification process — TreeBond never represents a Tree RWA as a certified carbon credit.

**Q5. Why Arbitrum Sepolia and not mainnet?**
Arbitrum Sepolia lets TreeBond AI run real verification and minting flows at testnet cost while the contracts, monitoring pipeline, and legal model are still being hardened. Mainnet deployment comes after audit, access-control review, and legal review — not before.

**Q6. Can I track a tree after I sponsor it?**
Yes. Every sponsored tree appears in your dashboard with its full monitoring history, and you'll see new evidence and verification records as soon as they're submitted and approved.

---

## 17. Final CTA

**Purpose** — Konversi terakhir sebelum footer.

**Layout** — Full-width dark band, centered text, dua CTA.

**Copy**

```
Eyebrow:   TREEBOND AI

Title:
Make a Living Asset Verifiable Today.

Body:
Explore a verified tree, or register your reforestation
project and start building a monitoring record that actually
holds up to scrutiny.

CTA Primary:    Explore Trees     → /explore
CTA Secondary:  Register Project  → /operator/projects

Trust line:  Built on Arbitrum Sepolia Testnet
```

---

## 18. Footer

**Copy**

```
Logo:        TreeBond AI
Tagline:     Verified Trees. On-chain Proof.

PRODUCT
  Tree Explorer      → /explore
  How It Works       → #how-it-works
  Tree Passport      → #passport
  Register Project   → /operator/projects

RESOURCES
  Documentation       → /docs
  FAQ                 → #faq
  Smart Contracts     → /docs/contracts
  Verification Process → #ai-verification

NETWORK
  Arbitrum Sepolia     → link
  Block Explorer       → link

LEGAL
  Terms               → /legal/terms
  Privacy             → /legal/privacy
  RWA Disclosure       → /legal/rwa-disclosure

Copyright:   © 2026 TreeBond AI
```

---

## 19. Definition of Done — Landing Page

### Content

- [ ]  Hero menjelaskan positioning dalam 1 layar tanpa scroll
- [ ]  Problem statement tampil sebelum How It Works
- [ ]  How It Works menampilkan 4 langkah (Register → Verify → Tokenize → Monitor)
- [ ]  Why Blockchain menyertakan panel "Before / After"
- [ ]  AI Verification menyertakan disclaimer human-in-the-loop
- [ ]  Tree RWA Explainer menyertakan disclaimer sponsorship vs ownership
- [ ]  Minimal 3 Featured Tree card ditampilkan
- [ ]  Provenance timeline minimal 6 item
- [ ]  Tree Passport preview lengkap (Physical/AI/Verification/Blockchain)
- [ ]  4 ecosystem role card (Sponsor, Operator, Verifier, Admin)
- [ ]  Minimal 6 FAQ item dengan jawaban penuh
- [ ]  Final CTA + Footer lengkap

### Technical

- [ ]  Responsive di desktop, tablet, mobile
- [ ]  LCP < 2.5s (Lighthouse)
- [ ]  Keyboard-navigable penuh, visible focus ring
- [ ]  Semua CTA punya `href` valid
- [ ]  Tidak ada dependency Web3 yang ter-load di landing page

### Compliance

- [ ]  Tidak ada klaim "guaranteed return"
- [ ]  Tidak ada klaim "legal land ownership"
- [ ]  Tidak ada klaim "certified carbon credit" tanpa label "estimate"
- [ ]  Semua angka AI/health/growth dilabeli sebagai hasil AI, bukan scientific certification

---

## 20. Core Principle Recap

```
Physical Tree
      ↓
Evidence
      ↓
AI + Human Verification
      ↓
On-chain Record
      ↓
Tree RWA
      ↓
Continuous Monitoring
```

> **Register → Verify → Tokenize → Sponsor → Monitor → Verify Again.**

Setiap section di landing page harus mendukung alur ini. Jika sebuah section tidak mendukung alur ini, kemungkinan besar section tersebut tidak perlu ada.
