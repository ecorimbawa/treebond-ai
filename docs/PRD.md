# PRD TreeBond AI

Berikut PRD yang bisa dijadikan **source of truth** untuk pengembangan TreeBond AI ke depannya. Saya sengaja memisahkan **MVP hackathon**, arsitektur teknis, smart contract, database, AI/MRV, IPFS, dan roadmap agar project bisa langsung dipecah menjadi backlog development.

# TreeBond AI

## Product Requirements Document — PRD

**Version:** 1.0

**Status:** Development Blueprint

**Platform:** Web Application

**Target:** Hackathon MVP → extensible RWA infrastructure

**Primary Network:** Arbitrum Sepolia Testnet

**Primary Asset:** Living Tree / Forestry Asset

**Core Concept:** Verifiable Real-World Asset (RWA) for living assets

---

# 1. Executive Summary

## 1.1 Product Name

**TreeBond AI**

## 1.2 Tagline

> **Making Living Assets Verifiable On-Chain.**
> 

Alternative:

> **What if a Real-World Asset could prove that it is alive?**
> 

## 1.3 Product Definition

TreeBond AI adalah platform Web3 berbasis web yang memungkinkan pohon fisik di dunia nyata diregistrasikan sebagai **digital RWA**, dimonitor secara berkala menggunakan foto/GPS/data lapangan, dianalisis menggunakan AI, dan hasil verifikasinya dicatat secara on-chain.

TreeBond AI bukan sekadar NFT marketplace.

Siklus utamanya adalah:

```
Physical Tree
      ↓
Registration
      ↓
Evidence Collection
      ↓
AI Analysis
      ↓
Verification
      ↓
Oracle
      ↓
Blockchain
      ↓
Tree RWA
      ↓
Continuous Monitoring
```

Dengan demikian, Tree RWA memiliki **lifecycle** dan bukan hanya metadata statis.

---

# 2. Problem Statement

## 2.1 Masalah Utama

Investasi dan sponsorship terhadap aset lingkungan seperti pohon menghadapi beberapa masalah:

1. Sponsor sulit mengetahui apakah aset fisik benar-benar ada.
2. Sponsor sulit memantau perkembangan aset setelah pembayaran.
3. Data pertumbuhan biasanya tersimpan secara terpusat.
4. Bukti foto dapat diubah atau dihapus.
5. Tidak terdapat identity layer yang konsisten untuk setiap pohon.
6. Data monitoring tidak memiliki hubungan yang kuat dengan ownership record.
7. Klaim environmental impact sulit ditelusuri.
8. Aset fisik tidak memiliki lifecycle digital yang transparan.

---

# 3. Proposed Solution

TreeBond AI membuat setiap pohon memiliki:

```
Tree ID
+
Physical Metadata
+
Evidence
+
AI Analysis
+
Verification History
+
Blockchain Identity
+
Ownership / Sponsorship Record
```

Contoh:

```
TREE-JTG-000192

Species:
Sengon

Location:
Central Java

Planted:
2026-09-01

Status:
Healthy

Health Score:
94

Growth Score:
87

NFT:
Token #192

Verification:
5 records

Evidence:
IPFS CID

Owner:
0x71...92A
```

---

# 4. Product Vision

Dalam jangka panjang TreeBond AI ingin menjadi:

> **Infrastructure layer for verifiable living RWAs.**
> 

Bukan hanya pohon.

Arsitektur dapat diperluas ke:

- forestry
- agricultural assets
- plantations
- bamboo
- mangrove
- reforestation projects
- solar infrastructure
- agricultural equipment
- environmental assets

Tetapi **MVP hanya fokus pada tree/forestry asset**.

---

# 5. Product Principles

## 5.1 Physical-first

Setiap RWA harus berasal dari physical asset yang memiliki evidence.

## 5.2 Evidence-first

Blockchain tidak dianggap sebagai bukti bahwa pohon benar-benar ada.

Blockchain hanya mencatat:

- ownership
- verification record
- evidence hash/CID
- timestamps
- state changes

Physical truth harus berasal dari:

- field evidence
- GPS
- image
- AI
- human verification
- future IoT/oracle

---

## 5.3 AI-assisted, not AI-trusted

AI berfungsi sebagai:

> **verification assistant**
> 

bukan sebagai satu-satunya authority.

Contoh:

```
AI:
Tree detected = 98%

Human verifier:
Approved

Oracle:
Submit verification

Blockchain:
Record verification
```

---

## 5.4 On-chain minimalism

Jangan menyimpan data besar di blockchain.

Blockchain hanya menyimpan data yang memang membutuhkan:

- immutability
- ownership
- auditability
- verification
- settlement

---

## 5.5 Privacy by default

Data sensitif seperti:

- private documents
- personal information
- phone number
- email
- internal operator information

tidak boleh dimasukkan ke public blockchain atau public IPFS.

IPFS content pada dasarnya dapat diakses melalui jaringan/gateway jika CID diketahui, sehingga data privat tidak boleh dipublish mentah. ([IPFS Docs](https://docs.ipfs.tech/quickstart/pin/?utm_source=chatgpt.com))

---

# 6. Target Users

## 6.1 Tree Sponsor

Orang yang ingin:

- mensponsori pohon
- memiliki digital representation
- melihat perkembangan pohon
- melihat verification history
- melihat impact metrics

---

## 6.2 Project Operator

Organisasi/petani/NGO yang:

- mendaftarkan proyek
- mendaftarkan pohon
- melakukan monitoring
- upload evidence
- melakukan maintenance

---

## 6.3 Verifier

Pihak yang:

- memeriksa evidence
- memvalidasi hasil AI
- melakukan approval/rejection

---

## 6.4 Admin

Platform operator yang:

- mengelola proyek
- mengelola operator
- mengelola verifier
- mengawasi trees
- menangani dispute

---

# 7. User Roles

| Role | Permissions |
| --- | --- |
| Visitor | Browse public trees/projects |
| Sponsor | Purchase/sponsor tree, view owned trees |
| Operator | Create project, register trees, upload monitoring evidence |
| Verifier | Review evidence, approve/reject |
| Admin | Full platform management |
| Oracle | Submit verified data on-chain |

---

# 8. Core User Journey

## 8.1 Sponsor Journey

```
Landing Page
    ↓
Explore Trees
    ↓
Select Tree
    ↓
View Tree Passport
    ↓
Connect Wallet
    ↓
Sponsor Tree
    ↓
Receive Tree RWA
    ↓
View Dashboard
    ↓
Receive Monitoring Updates
```

---

# 9. Operator Journey

```
Login
 ↓
Create Project
 ↓
Register Tree
 ↓
Upload Initial Photo
 ↓
Capture GPS
 ↓
AI Analysis
 ↓
Submit Verification
 ↓
Verifier Approval
 ↓
Mint Tree RWA
 ↓
Monitor Periodically
```

---

# 10. Verifier Journey

```
Verification Queue
 ↓
Open Tree
 ↓
View Previous Evidence
 ↓
View Current Evidence
 ↓
View AI Analysis
 ↓
Compare GPS
 ↓
Approve / Reject
 ↓
Verification Record Created
 ↓
Oracle Submission
```

---

# 11. Core Product Modules

TreeBond AI MVP terdiri dari:

1. Landing Page
2. Tree Explorer
3. Tree Detail / Tree Passport
4. Wallet Connection
5. Sponsor Flow
6. User Dashboard
7. Operator Dashboard
8. Project Management
9. Tree Registration
10. Evidence Upload
11. AI Verification
12. Verification Queue
13. On-chain Verification
14. Blockchain Explorer Integration
15. Admin Dashboard

---

# 12. Landing Page

## Objective

Menjelaskan konsep TreeBond AI dalam kurang dari 30 detik.

## Sections

### Hero

```
Making Living Assets
Verifiable On-Chain.

Sponsor real trees.
Track their growth.
Verify their existence.
Own their digital RWA.

[ Explore Trees ]
[ Register Project ]
```

### How It Works

```
01
Register

02
Verify

03
Tokenize

04
Monitor
```

### Why Blockchain

Menjelaskan:

- immutable ownership
- verification history
- transparent records
- programmable settlement

### AI Verification

Menampilkan:

```
Photo
 ↓
AI
 ↓
Health
 ↓
Growth
 ↓
Verification
```

### Featured Trees

Menampilkan beberapa tree RWA.

---

# 13. Tree Explorer

Route:

```
/explore
```

Features:

- search
- filter by species
- filter by location
- filter by status
- filter by project
- sort by age
- sort by health
- sort by price

Tree card:

```
┌────────────────────────────┐
│         TREE IMAGE         │
│                            │
│ TREE-JTG-00192             │
│ Sengon                     │
│ Central Java               │
│                            │
│ 🟢 Healthy                 │
│                            │
│ Health       94/100        │
│ Verification 5            │
│                            │
│ Rp100.000                  │
│                            │
│ [ View Tree ]              │
└────────────────────────────┘
```

---

# 14. Tree Detail / Tree Passport

Route:

```
/trees/[treeId]
```

## Required information

### Identity

- Tree ID
- token ID
- species
- project
- planted date

### Location

- region
- latitude/longitude
- map

### Physical status

- age
- height
- health
- status

### Verification

- verification count
- latest verification
- verifier
- evidence

### Blockchain

- network
- contract address
- token ID
- owner
- transaction hash

### Evidence

- initial photo
- latest photo
- monitoring history

---

# 15. Tree Passport Example

```
TREE-JTG-000192

🌳 Sengon

Central Java

────────────────────────────

PHYSICAL

Age              8 months
Height            1.82 m
Status            Healthy

────────────────────────────

AI ANALYSIS

Health            94/100
Growth            87/100
Anomaly Risk       4%

────────────────────────────

VERIFICATION

Initial planting  ✓
GPS               ✓
Photo             ✓
AI analysis       ✓
Human verifier    ✓
On-chain          ✓

────────────────────────────

BLOCKCHAIN

Network:
Arbitrum Sepolia

Token ID:
192

Owner:
0x71...92A

────────────────────────────

[ View Transaction ]
[ View IPFS Evidence ]
```

---

# 16. Wallet Connection

Primary library:

- wagmi
- viem
- compatible wallet connector

Supported initial wallet:

- MetaMask
- injected wallets
- WalletConnect if required

Network:

```
Arbitrum Sepolia
```

Arbitrum's current documentation lists Arbitrum Sepolia as the testnet with:

```
Chain ID: 421614
Currency: SepoliaETH
RPC:
https://sepolia-rollup.arbitrum.io/rpc
```

([Arbitrum Docs](https://docs.arbitrum.io/arbitrum-bridge/quickstart?utm_source=chatgpt.com))

The application must detect incorrect networks and provide:

```
Wrong Network

Please switch to Arbitrum Sepolia.

[ Switch Network ]
```

---

# 17. Authentication

Use two concepts separately:

## Web Application Identity

NextAuth (Auth.js v5), Credentials provider.

Supported (MVP):

- email/password

Future (NextAuth supports both without changing the session model):

- magic link
- optional social login

Session uses the JWT strategy — no separate sessions collection. The token carries the minimum needed to authorize requests: `id` and `role`. Passwords are hashed with bcrypt and stored on the `User` document with `select: false`, so they're never returned by a normal query.

## Blockchain Identity

Wallet address.

Example:

```
User (MongoDB)
      │
      └── Wallet.userId
             ↓
          0xABC...
```

A user can have multiple wallets in the future — `Wallet` is a separate collection referencing `User`, not an embedded field.

---

# 18. Wallet Verification

For sensitive wallet actions:

```
Connect Wallet
      ↓
Sign Message
      ↓
Verify Signature
      ↓
Link Wallet
```

Never treat:

```
wallet_address = logged-in user
```

as sufficient authentication.

---

# 19. Sponsor Flow

## Step 1

User selects tree.

## Step 2

Tree must have:

```
status = AVAILABLE
```

## Step 3

Frontend calls smart contract.

Example:

```
sponsorTree(treeId)
```

## Step 4

Wallet confirms transaction.

## Step 5

Transaction is mined.

## Step 6

Backend indexes transaction.

## Step 7

Tree ownership is reflected in UI.

---

# 20. Important RWA Legal Model

For MVP, TreeBond should use the concept:

> **Tree Sponsorship / Digital RWA Representation**
> 

rather than claiming:

> “The NFT legally represents ownership of the land.”
> 

The exact legal rights attached to a token must be defined separately through project/legal agreements.

The technical MVP therefore focuses on:

- digital representation
- sponsorship
- verification
- ownership record
- impact tracking

---

# 21. Tree Lifecycle

Every tree has a state.

```
DRAFT
  ↓
REGISTERED
  ↓
PENDING_VERIFICATION
  ↓
VERIFIED
  ↓
AVAILABLE
  ↓
SPONSORED
  ↓
MONITORING
  ↓
MATURE
```

Exceptional states:

```
REJECTED
DEAD
REMOVED
REPLACED
DISPUTED
```

---

# 22. Tree State Machine

```
                 ┌────────────┐
                 │   DRAFT    │
                 └─────┬──────┘
                       ↓
                 ┌────────────┐
                 │ REGISTERED │
                 └─────┬──────┘
                       ↓
             ┌────────────────────┐
             │ PENDING_VERIFICATION│
             └─────────┬──────────┘
                       ↓
                  ┌──────────┐
                  │ VERIFIED │
                  └────┬─────┘
                       ↓
                 ┌───────────┐
                 │ AVAILABLE │
                 └─────┬─────┘
                       ↓
                 ┌───────────┐
                 │ SPONSORED │
                 └─────┬─────┘
                       ↓
                 ┌───────────┐
                 │ MONITORING│
                 └─────┬─────┘
                       ↓
                 ┌───────────┐
                 │  MATURE   │
                 └───────────┘

Exceptional:

MONITORING → DEAD
DEAD → REPLACED
ANY → DISPUTED
```

---

# 23. Project Management

Route:

```
/operator/projects
```

Operator can create:

```
Project Name
Description
Country
Province
Regency
Village
Latitude
Longitude
Area
Tree Target
Tree Species
Start Date
Project Image
```

Example:

```
Central Java Reforestation #001

Location:
Wonosobo, Central Java

Area:
5 hectares

Target:
5,000 trees

Species:
Sengon
```

---

# 24. Tree Registration

Route:

```
/operator/projects/[projectId]/trees/new
```

Fields:

```
Tree ID
Species
Latitude
Longitude
Planted At
Initial Height
Initial Diameter
Initial Photo
Notes
```

System automatically creates:

```
tree_code
```

Example:

```
TREE-JTG-000192
```

---

# 25. Evidence Model

Evidence types:

```
INITIAL_PLANTING
MONITORING
HEALTH_CHECK
GROWTH_CHECK
GPS_CHECK
DEATH_REPORT
REPLACEMENT
```

Each evidence record:

```
Evidence ID
Tree ID
Photo CID
Metadata CID
GPS
Timestamp
AI Result
Submitted By
Verification Status
```

---

# 26. IPFS Architecture

IPFS digunakan untuk:

- tree images
- evidence images
- NFT metadata
- verification evidence bundles
- project documents yang memang bersifat publik

IPFS menggunakan **content identifiers (CID)** yang berasal dari content addressing, sehingga perubahan konten menghasilkan CID berbeda. ([IPFS Docs](https://docs.ipfs.tech/concepts/content-addressing/?utm_source=chatgpt.com))

---

# 27. IPFS Data Strategy

## On-chain

Simpan:

```
metadataCID
evidenceCID
evidenceHash
```

## MongoDB

Simpan:

```
CID
gateway URL
upload metadata
ownership relation
AI result
```

## IPFS

Simpan:

```
image
metadata JSON
evidence bundle
```

---

# 28. IPFS Metadata Example

```json
{
  "name": "TreeBond Tree #192",
  "description": "Verified living tree RWA",
  "image": "ipfs://bafy...",
  "attributes": [
    {
      "trait_type": "Species",
      "value": "Sengon"
    },
    {
      "trait_type": "Location",
      "value": "Central Java"
    },
    {
      "trait_type": "Status",
      "value": "Healthy"
    },
    {
      "trait_type": "Tree ID",
      "value": "TREE-JTG-000192"
    }
  ]
}
```

---

# 29. IPFS Pinning

Semua production-relevant CIDs harus dipin.

IPFS sendiri bukan storage provider; pinning digunakan agar node/provider mempertahankan content sehingga tidak hilang akibat garbage collection. ([IPFS Docs](https://docs.ipfs.tech/concepts/what-is-ipfs/?utm_source=chatgpt.com))

Untuk MVP:

```
Browser
 ↓
Next.js API
 ↓
IPFS Pinning Provider
 ↓
CID
```

Jangan expose secret pinning API key ke browser.

---

# 30. Recommended IPFS Flow

```
User
 │
 │ upload image
 ▼
Next.js API Route
 │
 │ validate
 ▼
IPFS Pinning Service
 │
 ▼
CID
 │
 ├──────────→ MongoDB
 │
 └──────────→ Smart Contract
```

---

# 31. AI Verification

AI merupakan komponen off-chain.

Input:

```
Current photo
Previous photo
Tree metadata
GPS
Timestamp
```

Output:

```json
{
  "treeDetected": true,
  "treeConfidence": 0.98,
  "healthScore": 94,
  "growthScore": 87,
  "anomalyRisk": 0.04,
  "possibleDisease": false
}
```

---

# 32. AI Verification Rules

AI harus menghasilkan:

### Detection

```
treeDetected
```

### Confidence

```
0.00 - 1.00
```

### Health score

```
0 - 100
```

### Growth score

```
0 - 100
```

### Anomaly

```
LOW
MEDIUM
HIGH
```

### Explanation

Human-readable explanation.

Contoh:

```
The submitted image appears visually consistent
with previous evidence. No major visible health
anomaly was detected.
```

---

# 33. AI Verification Pipeline

```
Upload Photo
      ↓
Image Validation
      ↓
Image Storage
      ↓
AI Vision Analysis
      ↓
Compare Previous Evidence
      ↓
Generate AI Result
      ↓
Save Result in MongoDB
      ↓
Human Review
      ↓
Approved?
   /       \
 NO         YES
 ↓           ↓
Reject     Oracle
              ↓
          Blockchain
```

---

# 34. AI Does NOT Directly Mint Verification

Important security rule:

```
AI
 ↓
❌ direct blockchain write
```

Instead:

```
AI
 ↓
AI Result
 ↓
Human / Verification Policy
 ↓
Oracle
 ↓
Blockchain
```

Untuk hackathon, human approval dapat disederhanakan menjadi operator/admin approval.

---

# 35. Verification Scoring

Contoh:

```
AI confidence       98
GPS consistency     100
Timestamp validity  100
Photo quality        92
Previous match       96
────────────────────────
Verification Score   97
```

Namun score ini adalah **platform score**, bukan scientific certification.

---

# 36. GPS Verification

Sistem membandingkan:

```
Registered GPS
vs
Evidence GPS
```

Formula sederhana:

```
distance <= allowedRadius
```

Misalnya MVP:

```
Allowed radius:
50 meters
```

Jika:

```
distance = 12m
```

hasil:

```
GPS MATCH ✓
```

Jika:

```
distance = 3.2km
```

hasil:

```
GPS MISMATCH ⚠️
```

---

# 37. Anti-Fraud Layer

MVP:

1. GPS consistency
2. timestamp
3. previous image comparison
4. AI image analysis
5. human verification
6. evidence hash
7. immutable verification record

Future:

- satellite imagery
- drone
- IoT sensor
- device attestation
- geofencing
- multiple independent verifiers

---

# 38. Smart Contract Architecture

Gunakan Solidity + OpenZeppelin.

Recommended contracts:

```
TreeRegistry
TreeNFT
TreeBond
VerificationRegistry
```

---

# 39. TreeRegistry

Responsibilities:

- create tree
- update tree status
- link project
- link metadata

Example:

```solidity
struct Tree {
    uint256 id;
    uint256 projectId;
    string treeCode;
    string metadataURI;
    uint64 plantedAt;
    TreeStatus status;
}
```

---

# 40. TreeNFT

Standard:

```
ERC-721
```

Responsibilities:

- mint
- ownership
- transfer
- token URI

Use OpenZeppelin implementation rather than implementing ERC-721 manually.

---

# 41. TreeBond

Responsibilities:

- sponsorship purchase
- payment
- tree allocation
- platform fee
- optional revenue logic in future

MVP:

```
sponsorTree(treeId)
```

---

# 42. VerificationRegistry

Responsibilities:

```
submitVerification()
getVerification()
getLatestVerification()
```

Data:

```solidity
struct Verification {
    uint256 treeId;
    uint256 timestamp;
    uint16 healthScore;
    uint16 growthScore;
    bytes32 evidenceHash;
    string evidenceCID;
}
```

---

# 43. Oracle Role

Use role-based access control.

Example:

```
DEFAULT_ADMIN_ROLE
ORACLE_ROLE
VERIFIER_ROLE
OPERATOR_ROLE
```

Only authorized oracle can execute:

```
submitVerification()
```

---

# 44. Smart Contract Events

Events are critical for indexing.

```solidity
event TreeRegistered(
    uint256 indexed treeId,
    uint256 indexed projectId
);

event TreeMinted(
    uint256 indexed treeId,
    uint256 indexed tokenId,
    address owner
);

event TreeSponsored(
    uint256 indexed treeId,
    address indexed sponsor
);

event VerificationSubmitted(
    uint256 indexed treeId,
    uint256 timestamp,
    bytes32 evidenceHash
);

event TreeStatusChanged(
    uint256 indexed treeId,
    TreeStatus status
);
```

---

# 45. Blockchain Data Strategy

Do not use blockchain as the primary query database.

Use:

```
Blockchain
    ↓
Ownership / immutable state

MongoDB
    ↓
Application query / analytics

IPFS
    ↓
Evidence / metadata
```

---

# 46. MongoDB Database

Core collections (Mongoose models, `models/*.ts`):

```
User
Wallet
Project
Tree
TreeEvidence
AiAnalysis
Verification
BlockchainTransaction
Notification
```

MongoDB has no schema-enforced foreign keys — every `*Id` field below is an `ObjectId` reference (`ref: '<Model>'`) resolved at query time with `.populate()`, not a database-level constraint. Referential integrity is the application's responsibility.

---

# 47. User

```
_id ObjectId PK
email           String, unique, lowercase
password        String, select: false (bcrypt hash, never returned by default)
fullName        String
avatarUrl       String?
role            String
createdAt       Date
updatedAt       Date
```

Roles:

```
sponsor
operator
verifier
admin
```

Self-registration (`POST /api/auth/register`) always creates `role: sponsor`. Operator/verifier/admin accounts are provisioned separately — never selectable from a public form.

---

# 48. Wallet

```
_id ObjectId PK
userId        ObjectId FK → User
address       String, lowercase
chainId       Number
isPrimary     Boolean
verifiedAt    Date?
createdAt     Date
```

Constraint:

```
unique(address, chainId)
```

---

# 49. Project

```
_id ObjectId PK
name
slug             unique, lowercase
description
country
province
regency
village
latitude
longitude
areaHectares
targetTreeCount
status
coverImageCid    String?
createdBy        ObjectId FK → User
createdAt
updatedAt
```

---

# 50. Tree

```
_id ObjectId PK
projectId          ObjectId FK → Project
treeCode           String, unique
species
latitude
longitude
plantedAt
initialHeightCm
currentHeightCm
status
tokenId            Number?
contractAddress    String?
metadataCid        String?
ownerWallet        String?, lowercase
createdAt
updatedAt
```

---

# 51. TreeEvidence

```
_id ObjectId PK
treeId         ObjectId FK → Tree
type
imageCid
metadataCid    String?
latitude
longitude
capturedAt
submittedBy    ObjectId FK → User
status
createdAt
```

Types:

```
INITIAL_PLANTING
MONITORING
HEALTH_CHECK
GROWTH_CHECK
GPS_CHECK
DEATH_REPORT
REPLACEMENT
```

Status:

```
pending
approved
rejected
```

---

# 52. AiAnalysis

```
_id ObjectId PK
evidenceId        ObjectId FK → TreeEvidence
treeDetected      Boolean
treeConfidence    Number (0.00 - 1.00)
healthScore       Number (0 - 100)
growthScore       Number (0 - 100)
anomalyRisk       String (LOW | MEDIUM | HIGH)
diseaseDetected   Boolean
explanation       String
modelName         String
modelVersion      String
createdAt
```

Always store:

```
modelName
modelVersion
```

agar hasil AI dapat diaudit.

---

# 53. Verification

```
_id ObjectId PK
treeId               ObjectId FK → Tree
evidenceId           ObjectId FK → TreeEvidence
aiAnalysisId         ObjectId FK → AiAnalysis
verifierId           ObjectId FK → User
status
verificationScore
decision             String (approved | rejected)
reason
txHash               String?
blockNumber          Number?
onChainTimestamp     Date?
createdAt
updatedAt
```

Status:

```
PENDING
APPROVED
REJECTED
ON_CHAIN
```

---

# 54. BlockchainTransaction

```
_id ObjectId PK
txHash              String, unique, lowercase
chainId
contractAddress     String, lowercase
functionName
fromAddress         String, lowercase
toAddress           String, lowercase
blockNumber
status              String (pending | success | failed)
gasUsed
createdAt
```

---

## Notification

```
_id ObjectId PK
userId             ObjectId FK → User
type
title
message
treeId             ObjectId FK → Tree, optional
verificationId     ObjectId FK → Verification, optional
read               Boolean
createdAt
```

Type (matches §71):

```
tree_sponsored
verification_approved
verification_rejected
monitoring_update
health_warning
status_changed
```

---

# 55. Authorization & Access Control

MongoDB has no built-in row-level security — there is no database-enforced policy layer like Postgres RLS. Every check below must happen in the application layer: inside API Route Handlers / Server Actions, before any read or write touches Mongoose.

Pattern per Next.js's own auth guide: read the NextAuth session, check `session.user.role`, then query. Never trust a client-supplied `userId` or `role` — always derive it from the verified session.

```
Request
  ↓
auth() → session (JWT, server-side only)
  ↓
session?.user.role check
  ↓
Mongoose query, scoped to session.user.id where ownership applies
```

Contoh:

### Sponsor

Boleh melihat:

```
public projects
public trees
own ownership
own transactions
```

### Operator

Boleh:

```
manage own projects
manage own trees
upload own evidence
```

### Verifier

Boleh:

```
view verification queue
approve/reject evidence
```

### Admin

Full access melalui server-side privileged access — not a special database role, just `role === 'admin'` checked before the query runs.

---

# 56. Frontend Stack

## Framework

```
Next.js
```

Recommended:

```
Next.js App Router
TypeScript
```

## UI

```
Tailwind CSS
```

## Web3

```
wagmi
viem
```

## Backend

```
Next.js Route Handlers / Server Actions
```

## Database

```
MongoDB Atlas (Mongoose)
```

## Auth

```
NextAuth (Auth.js v5)
```

## Storage

```
IPFS
```

## Blockchain

```
Arbitrum Sepolia
```

---

# 57. Suggested Supporting Stack

Walaupun stack utama yang ditentukan adalah:

```
Next.js
MongoDB (Mongoose)
Tailwind
wagmi
IPFS
Arbitrum L2
```

tambahkan:

```
TypeScript
viem
Solidity
OpenZeppelin
Foundry
NextAuth (Auth.js)
bcryptjs
Zod
React Hook Form
TanStack Query
```

TanStack Query bersifat opsional karena wagmi sudah menyediakan mekanisme query untuk banyak blockchain interactions.

---

# 58. Frontend Folder Structure

```
src/
├── app/
│   ├── page.tsx
│   ├── explore/
│   │   └── page.tsx
│   ├── trees/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── operator/
│   │   ├── page.tsx
│   │   ├── projects/
│   │   └── trees/
│   ├── verifier/
│   │   └── page.tsx
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/
│       │   └── register/
│       ├── ipfs/
│       ├── ai/
│       └── oracle/
│
├── components/
│   ├── ui/
│   ├── tree/
│   ├── project/
│   ├── wallet/
│   ├── verification/
│   └── dashboard/
│
├── models/
│   ├── User.ts
│   ├── Wallet.ts
│   ├── Project.ts
│   ├── Tree.ts
│   ├── TreeEvidence.ts
│   ├── AiAnalysis.ts
│   ├── Verification.ts
│   ├── BlockchainTransaction.ts
│   └── Notification.ts
│
├── lib/
│   ├── db/
│   ├── web3/
│   ├── ipfs/
│   ├── ai/
│   └── utils/
│
├── contracts/
│   ├── abis/
│   └── addresses.ts
│
├── hooks/
│   ├── useTree.ts
│   ├── useSponsorTree.ts
│   └── useVerification.ts
│
└── types/
    ├── tree.ts
    ├── project.ts
    └── blockchain.ts

auth.ts   ← Auth.js v5 config, project root (sibling of src/ or app/)
```

---

# 59. Environment Variables

Example:

```
MONGODB_URI=

AUTH_SECRET=

NEXT_PUBLIC_CHAIN_ID=421614
NEXT_PUBLIC_RPC_URL=

NEXT_PUBLIC_TREE_NFT_ADDRESS=
NEXT_PUBLIC_TREE_REGISTRY_ADDRESS=
NEXT_PUBLIC_TREE_BOND_ADDRESS=
NEXT_PUBLIC_VERIFICATION_REGISTRY_ADDRESS=

IPFS_API_URL=
IPFS_API_KEY=
IPFS_API_SECRET=

AI_API_KEY=

ORACLE_PRIVATE_KEY=
```

Important:

```
ORACLE_PRIVATE_KEY
```

must NEVER be exposed as:

```
NEXT_PUBLIC_ORACLE_PRIVATE_KEY
```

It must only exist server-side.

---

# 60. Network Configuration

Development network:

```
Arbitrum Sepolia

Chain ID:
421614

Currency:
SepoliaETH
```

Official Arbitrum documentation currently lists the Arbitrum Sepolia RPC as:

```
https://sepolia-rollup.arbitrum.io/rpc
```

([Arbitrum Docs](https://docs.arbitrum.io/arbitrum-bridge/quickstart?utm_source=chatgpt.com))

Use environment configuration rather than hardcoding RPC URLs throughout the application.

---

# 61. Web3 Interaction Architecture

Frontend:

```
React Component
      ↓
Custom Hook
      ↓
wagmi
      ↓
viem
      ↓
Wallet
      ↓
Arbitrum Sepolia
```

Example conceptual flow:

```
useWriteContract()
      ↓
wallet confirmation
      ↓
transaction hash
      ↓
waitForTransactionReceipt()
      ↓
update MongoDB
```

---

# 62. Sponsorship Transaction

```
User clicks Sponsor
       ↓
Frontend validates tree
       ↓
Read contract
       ↓
Write contract
       ↓
Wallet confirmation
       ↓
Transaction submitted
       ↓
Wait receipt
       ↓
Save transaction
       ↓
Refresh tree ownership
```

---

# 63. Verification Transaction

```
Operator uploads photo
       ↓
IPFS CID
       ↓
AI analysis
       ↓
Verifier approval
       ↓
Generate evidence hash
       ↓
Oracle signs transaction
       ↓
VerificationRegistry
       ↓
Blockchain event
       ↓
MongoDB index
```

---

# 64. Evidence Hash

Canonical evidence object:

```json
{
  "treeId": "TREE-JTG-000192",
  "evidenceCID": "bafy...",
  "capturedAt": "2026-12-01T08:00:00Z",
  "latitude": -7.123,
  "longitude": 110.456,
  "aiAnalysisId": "uuid",
  "verificationVersion": 1
}
```

Generate deterministic hash:

```
keccak256(canonical JSON)
```

Store:

```
evidenceHash
```

on-chain.

---

# 65. Why Store CID + Hash?

CID:

```
points to evidence
```

Hash:

```
provides compact immutable reference
```

Example:

```
IPFS:
ipfs://bafy...

Blockchain:
0x91abc...
```

If evidence changes, its content-addressed identifier changes. IPFS CIDs are derived from content and associated encoding information rather than being ordinary location URLs. ([IPFS Docs](https://docs.ipfs.tech/concepts/content-addressing/?utm_source=chatgpt.com))

---

# 66. API Design

## Public

```
GET /api/projects
GET /api/projects/:id
GET /api/trees
GET /api/trees/:id
GET /api/trees/:id/verifications
```

## Sponsor

```
GET /api/me/trees
POST /api/wallets/link
```

## Operator

```
POST /api/projects
POST /api/projects/:id/trees
POST /api/trees/:id/evidence
```

## AI

```
POST /api/ai/analyze-tree
```

## Verification

```
GET /api/verifications/pending
POST /api/verifications/:id/approve
POST /api/verifications/:id/reject
```

## Oracle

```
POST /api/oracle/submit
```

Oracle endpoint must require strong server-side authentication.

---

# 67. API Validation

Use:

```
Zod
```

Example:

```
TreeCreateSchema

Project ID
Species
Latitude
Longitude
Planted At
Initial Height
```

Reject:

```
invalid coordinates
invalid date
negative height
unsupported species
missing project
```

---

# 68. Security Requirements

## Wallet

- never store private keys
- never request seed phrase
- verify signatures
- validate chain ID

## Smart contracts

- OpenZeppelin
- access control
- pause mechanism
- reentrancy protection where relevant
- input validation

## Oracle

- private key server-side
- role-based contract permission
- nonce protection
- replay protection
- transaction monitoring

## MongoDB

- MONGODB_URI and AUTH_SECRET never exposed to the client (no `NEXT_PUBLIC_` prefix)
- authorization enforced in API routes/Server Actions, not at the database layer (see §55 — MongoDB has no RLS)
- passwords hashed with bcrypt; `password` field is `select: false` by default
- validate ownership before any write

## IPFS

- don't publish PII
- pin important content
- validate MIME type
- file size limits
- image sanitization

---

# 69. Upload Security

Allowed:

```
image/jpeg
image/png
image/webp
```

Maximum MVP:

```
10 MB
```

Pipeline:

```
Upload
 ↓
MIME validation
 ↓
Size validation
 ↓
Image processing
 ↓
IPFS
```

---

# 70. Fraud Prevention

MVP fraud controls:

```
GPS
+
Timestamp
+
Image
+
AI
+
Human verifier
+
CID
+
On-chain hash
```

Future:

```
Satellite
+
Drone
+
IoT
+
Device attestation
+
Multiple verifiers
```

---

# 71. Notifications

MVP notifications:

```
Tree sponsored
Verification approved
Verification rejected
New monitoring update
Tree health warning
Tree status changed
```

Future:

- email
- push
- Telegram
- Discord

---

# 72. Dashboard

Sponsor dashboard:

```
My Trees
────────────────

Total Trees       12

Healthy           10
Warning            1
Dead               1

Total Verified     42

Estimated Impact
XXX

Recent Activity
```

---

# 73. Operator Dashboard

```
Projects             3
Trees                 2,450
Pending Verification    42
Healthy Trees         2,320
Warnings                85
Dead Trees              45

Recent Evidence
```

---

# 74. Verifier Dashboard

```
Pending Verification

TREE-JTG-00192
AI Score: 97
GPS: Match
Previous Match: 96%

[ Review ]

TREE-JTG-00193
AI Score: 81
GPS: Match
Anomaly: HIGH

[ Review ]
```

---

# 75. Admin Dashboard

Metrics:

```
Users
Projects
Trees
Sponsored Trees
Verification count
On-chain transactions
Failed transactions
AI analyses
IPFS uploads
```

---

# 76. Analytics

Track:

```
trees_registered
trees_verified
trees_sponsored
verification_success_rate
average_health_score
average_growth_score
ai_anomaly_rate
transaction_success_rate
```

---

# 77. Non-Functional Requirements

## Performance

Target:

```
Landing page:
< 2.5s LCP target

API:
< 500ms for normal queries

Tree detail:
< 2s excluding blockchain/IPFS latency
```

## Availability

Hackathon MVP:

```
best effort
```

Future:

```
99.9%
```

---

# 78. Accessibility

Minimum:

- keyboard navigation
- sufficient contrast
- semantic HTML
- alt text
- visible focus
- accessible wallet states

---

# 79. Responsive Design

Primary:

```
Desktop
```

But support:

```
Tablet
Mobile
```

because field operators may upload evidence from mobile browsers.

---

# 80. UI Design Direction

Style:

```
Clean
Modern
Minimal
Nature + Web3
Professional
```

Avoid:

```
overly crypto-looking
neon
excessive gradients
casino aesthetic
```

Suggested visual language:

```
Green
Earth
White
Dark text
Soft cards
Map
Tree photography
Data visualization
```

---

# 81. Core Screens

Minimum screens:

```
1. Landing
2. Explore Trees
3. Tree Detail
4. Connect Wallet
5. Sponsor Confirmation
6. Sponsor Dashboard
7. Operator Dashboard
8. Project Detail
9. Create Tree
10. Upload Evidence
11. AI Analysis
12. Verification Queue
13. Verification Detail
14. Transaction Result
15. Admin
```

---

# 82. MVP Scope

## Must Have

### Web

- Next.js
- Tailwind
- responsive UI

### Authentication

- NextAuth (Credentials provider)
- wallet connection

### RWA

- tree registration
- Tree NFT
- sponsorship

### Evidence

- photo upload
- IPFS
- CID

### AI

- image analysis
- health score
- growth/anomaly result

### Verification

- verifier approval
- oracle
- on-chain verification

### Blockchain

- Arbitrum Sepolia
- ERC-721
- Verification Registry

---

# 83. Should Have

- map
- Tree Passport
- verification timeline
- transaction explorer links
- project dashboard
- notifications
- analytics

---

# 84. Could Have

- satellite data
- weather
- carbon estimation
- AI chatbot
- tree replacement protocol
- QR code Tree Passport
- public API

---

# 85. Won't Have in MVP

Do NOT build initially:

- real carbon credit issuance
- real investment yield
- real securities offering
- real legal fractional land ownership
- production IoT network
- satellite ML model
- DAO
- governance token
- cross-chain
- lending
- secondary marketplace
- mainnet deployment

These can become future roadmap items.

---

# 86. Carbon Architecture — Future

Carbon is a separate layer.

```
Tree RWA
    ↓
Monitoring
    ↓
Carbon Estimation
    ↓
Methodology
    ↓
MRV
    ↓
Independent Verification
    ↓
Certified Carbon Asset
```

The product must never represent:

```
Tree NFT = Carbon Credit
```

automatically.

---

# 87. Carbon Dashboard

Future:

```
Estimated Carbon Impact

18.4 kg CO₂e

Status:
ESTIMATE

Not certified.

────────────────────

Methodology:
XYZ

Last measurement:
2027-01-01

Verification:
Pending
```

Once certified:

```
Certified Carbon Asset

Status:
VERIFIED

Registry:
...

Credit ID:
...
```

---

# 88. Economic Model

MVP should preferably use:

```
Tree Sponsorship
```

rather than promising financial returns.

Example:

```
Tree Sponsorship:
Rp100,000
```

Value proposition:

- tree sponsorship
- RWA representation
- monitoring
- verification
- digital passport
- impact information

Future economic model can support:

```
timber revenue
carbon revenue
project revenue
marketplace fees
enterprise subscriptions
```

---

# 89. Important Product Disclaimer

UI must clearly distinguish:

```
Estimated
```

from:

```
Verified
```

and:

```
Certified
```

Example:

```
Estimated Carbon Impact
18.4 kg CO₂e

This is an estimate and does not represent
a certified carbon credit.
```

---

# 90. Smart Contract MVP Specification

## TreeNFT

Functions:

```
mint()
tokenURI()
ownerOf()
transferFrom()
```

Roles:

```
MINTER_ROLE
ADMIN_ROLE
```

---

## TreeRegistry

Functions:

```
registerTree()
updateTreeStatus()
getTree()
```

---

## TreeBond

Functions:

```
sponsorTree()
getTreePrice()
```

---

## VerificationRegistry

Functions:

```
submitVerification()
getVerification()
getLatestVerification()
```

Events:

```
TreeRegistered
TreeSponsored
VerificationSubmitted
TreeStatusChanged
```

---

# 91. Contract Relationships

```
                 TreeRegistry
                      │
                      │ treeId
                      ▼
                   TreeNFT
                      │
                      │ tokenId
                      ▼
                  TreeBond
                      │
                      │
                      ▼
             VerificationRegistry
                      │
                      ▼
                   Oracle
```

---

# 92. Deployment Environments

## Local

```
Anvil
```

## Testnet

```
Arbitrum Sepolia
```

## Production future

```
Arbitrum One
```

Do not deploy production contracts until:

- audit
- testing
- access control review
- upgrade strategy
- legal review

are completed.

---

# 93. Testing Strategy

## Smart Contract

Use:

```
Foundry
```

Test:

```
mint
ownership
sponsor
verification
role permissions
invalid tree
duplicate verification
unauthorized oracle
```

---

# 94. Frontend Testing

Test:

```
wallet connect
wrong network
transaction rejected
transaction pending
transaction failed
transaction success
IPFS upload failure
AI failure
MongoDB failure
invalid credentials (login)
duplicate email (register)
```

---

# 95. Integration Testing

Scenario:

```
Create Tree
 ↓
Upload Evidence
 ↓
IPFS
 ↓
AI
 ↓
Approve
 ↓
Oracle
 ↓
Blockchain
 ↓
Read verification
 ↓
Dashboard
```

Entire flow must work end-to-end.

---

# 96. Demo Data Strategy

For hackathon, create:

```
Project #001

Trees:
20

Species:
Sengon
Mahogany
Teak

Verified:
15

Available:
8

Sponsored:
7
```

Each tree has:

- photo
- GPS
- metadata
- AI result
- verification history

This makes the application look alive during demo.

---

# 97. Hackathon Demo Narrative

## 0:00 — Problem

```
Physical assets are difficult to verify.
```

## 0:30 — Solution

```
TreeBond turns a living tree
into a continuously verifiable RWA.
```

## 1:00 — Browse

Show tree explorer.

## 1:30 — Sponsor

Connect wallet and sponsor.

## 2:00 — Passport

Show blockchain ownership.

## 2:30 — Monitoring

Upload new tree image.

## 3:00 — AI

Show:

```
Health 94
Growth 87
Anomaly LOW
```

## 3:30 — Verification

Verifier approves.

## 4:00 — Blockchain

Show transaction.

## 4:30 — Final

Show Tree Passport:

```
Physical Tree
      ↓
AI
      ↓
Verification
      ↓
RWA
      ↓
On-chain Proof
```

---

# 98. Success Metrics — Hackathon MVP

Primary:

```
1 complete tree lifecycle
```

From:

```
registration
→ verification
→ mint
→ sponsorship
→ monitoring
→ AI
→ on-chain verification
```

Secondary:

```
20 demo trees
10 sponsored trees
20 verification records
100% demo flow success
```

---

# 99. Product Success Metrics — Future

Track:

```
Number of registered trees
Number of verified trees
Verification frequency
Number of sponsors
Tree survival rate
Evidence coverage
Verification latency
AI anomaly detection rate
Number of projects
```

---

# 100. Development Phases

## Phase 0 — Foundation

```
Next.js
MongoDB (Mongoose)
NextAuth
Tailwind
wagmi
viem
Foundry
Arbitrum Sepolia
```

Deliverable:

```
Running web app
+
Wallet connection
+
MongoDB connection
+
Login / Create Account
```

---

# 101. Phase 1 — Tree Registry

Build:

```
Projects
Trees
Tree Explorer
Tree Detail
```

Deliverable:

```
Admin creates project
Operator creates tree
Public views tree
```

---

# 102. Phase 2 — IPFS

Implement:

```
Image upload
Metadata generation
IPFS upload
CID persistence
```

Deliverable:

```
Tree → IPFS evidence
```

---

# 103. Phase 3 — Smart Contracts

Deploy:

```
TreeRegistry
TreeNFT
TreeBond
VerificationRegistry
```

Deliverable:

```
Tree → NFT
```

---

# 104. Phase 4 — Sponsor Flow

Implement:

```
Explore
→ Tree
→ Connect Wallet
→ Sponsor
→ Transaction
→ Ownership
```

---

# 105. Phase 5 — AI

Implement:

```
Upload
→ AI
→ Analysis
→ Result
```

Initial AI:

```
Tree detection
Health
Growth
Anomaly
```

---

# 106. Phase 6 — Verification

Implement:

```
Verification Queue
Review
Approve
Reject
```

---

# 107. Phase 7 — Oracle

Implement:

```
Approved verification
→ Oracle
→ Smart Contract
```

---

# 108. Phase 8 — Tree Passport

Combine:

```
MongoDB
+
IPFS
+
Blockchain
+
AI
```

into one page.

This page should be the **main product showcase**.

---

# 109. Phase 9 — Polish

Add:

- animations
- loading states
- transaction status
- error handling
- empty states
- mobile UI
- responsive dashboard
- explorer links

---

# 110. Phase 10 — Demo Hardening

Before presentation:

```
Reset demo database
Seed 20 trees
Deploy fresh contracts
Verify contracts
Fund wallets
Prepare test ETH
Test all transactions
Test IPFS
Test AI
Test fallback data
```

Have fallback demo data in case AI/IPFS/RPC becomes unavailable.

---

# 111. Definition of Done — MVP

TreeBond MVP dianggap selesai jika:

### Tree

- [ ]  Project can be created
- [ ]  Tree can be registered
- [ ]  Tree has unique ID
- [ ]  Tree has metadata
- [ ]  Tree has image

### IPFS

- [ ]  Image uploaded
- [ ]  CID generated
- [ ]  CID persisted
- [ ]  Metadata stored

### Blockchain

- [ ]  Contract deployed
- [ ]  Tree NFT minted
- [ ]  Ownership visible
- [ ]  Sponsor transaction works
- [ ]  Verification transaction works

### AI

- [ ]  Image analyzed
- [ ]  Health score generated
- [ ]  Growth score generated
- [ ]  Anomaly generated

### Verification

- [ ]  Evidence review works
- [ ]  Approve works
- [ ]  Reject works
- [ ]  On-chain verification works

### UI

- [ ]  Landing
- [ ]  Explorer
- [ ]  Tree Passport
- [ ]  Dashboard
- [ ]  Operator
- [ ]  Verifier

---

# 112. Critical Architecture Decision

The project should follow this rule:

```
                 MONGODB
              Application DB
                    │
          ┌─────────┴─────────┐
          │                   │
        AI/MRV              Users
          │                   │
          └─────────┬─────────┘
                    │
                  IPFS
                    │
               Evidence
                    │
                    ▼
                 ORACLE
                    │
                    ▼
              BLOCKCHAIN
                    │
          ┌─────────┴─────────┐
          │                   │
       Ownership          Verification
          │                   │
          └─────────┬─────────┘
                    ▼
                TREE RWA
```

---

# 113. Source of Truth Matrix

| Data | Primary Source |
| --- | --- |
| User profile | MongoDB |
| Application data | MongoDB |
| Tree metadata | MongoDB + IPFS |
| Tree image | IPFS |
| NFT metadata | IPFS |
| Ownership | Blockchain |
| Sponsorship | Blockchain |
| Verification record | Blockchain + MongoDB |
| AI result | MongoDB |
| Evidence | IPFS |
| Evidence integrity | CID/hash |
| Transaction | Blockchain |
| Analytics | MongoDB |
| Session / auth | NextAuth (JWT, stateless) |

---

# 114. Core Design Principle

TreeBond harus menghindari:

```
Blockchain
    ↓
Database
```

Sebagai gantinya:

```
Physical World
      ↓
Evidence
      ↓
AI / Human Verification
      ↓
IPFS
      ↓
Oracle
      ↓
Blockchain
      ↓
MongoDB Index
      ↓
Frontend
```

---

# 115. Long-Term Architecture

Setelah MVP:

```
                    TREEBOND PROTOCOL
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
     Forestry           Agriculture        Energy
        │                  │                  │
        ▼                  ▼                  ▼
      Tree RWA          Farm RWA          Solar RWA
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    Verification Layer
                           │
                ┌──────────┼──────────┐
                ▼          ▼          ▼
               AI         IoT      Satellite
                │          │          │
                └──────────┼──────────┘
                           ▼
                         Oracle
                           │
                           ▼
                       Blockchain
                           │
                ┌──────────┼──────────┐
                ▼          ▼          ▼
             Ownership   Impact     Finance
```

---

# 116. Future Features

## V2

- tree replacement
- satellite verification
- weather API
- map visualization
- QR Tree Passport
- automated notifications
- enterprise dashboard

## V3

- IoT
- drone imagery
- decentralized verifier network
- multi-project RWA marketplace
- secondary trading
- carbon methodology integration

## V4

- multiple RWA categories
- permissionless verification protocol
- cross-chain
- institutional API
- real-world financing

---

# 117. Final Product Definition

TreeBond AI bukan:

```
❌ NFT marketplace
❌ carbon credit generator
❌ investment guarantee platform
❌ simple tree donation app
```

TreeBond AI adalah:

```
┌──────────────────────────────────────────┐
│              TREEBOND AI                 │
│                                          │
│       VERIFIABLE LIVING RWA              │
│                                          │
│  Physical Tree                           │
│       ↓                                  │
│  Digital Identity                        │
│       ↓                                  │
│  Evidence                                │
│       ↓                                  │
│  AI / MRV                                │
│       ↓                                  │
│  Human Verification                     │
│       ↓                                  │
│  Oracle                                  │
│       ↓                                  │
│  Blockchain                              │
│       ↓                                  │
│  Ownership + Impact + History            │
│                                          │
└──────────────────────────────────────────┘
```

## One-line pitch

> **TreeBond AI transforms living trees into continuously verifiable Real-World Assets by combining AI-powered monitoring, IPFS evidence, oracle verification, and on-chain ownership.**
> 

## Core technical thesis

> **The NFT represents the asset; IPFS stores the evidence; AI interprets the evidence; humans validate it; the oracle brings the verified state on-chain; and the blockchain provides an immutable ownership and verification history.**
> 

## Core MVP thesis

> **Register → Verify → Tokenize → Sponsor → Monitor → Verify Again.**
> 

Itulah loop utama yang harus selalu menjadi pusat pengembangan TreeBond AI.

### Catatan implementasi penting

Untuk stack yang kamu pilih, saya akan menjadikan **Arbitrum Sepolia + Solidity/OpenZeppelin + Foundry + wagmi/viem** sebagai blockchain layer, sedangkan **MongoDB (Mongoose) sebagai application database dan NextAuth (Auth.js v5) untuk authentication**, bukan sebagai pengganti blockchain. IPFS digunakan untuk evidence dan metadata; data penting perlu dipin karena IPFS sendiri tidak menjamin persistence hanya karena sebuah CID sudah ada. ([IPFS Docs](https://docs.ipfs.tech/quickstart/pin/?utm_source=chatgpt.com))

MongoDB tidak punya Row Level Security seperti Postgres/Supabase — setiap authorization check (role, ownership) harus dilakukan secara eksplisit di API route/Server Action sebelum query dijalankan (lihat §55).

Untuk **MVP hackathon**, saya juga sangat menyarankan jangan langsung mengimplementasikan carbon credit atau financial yield. Bangun dulu satu loop yang benar-benar solid:

**`Tree → Evidence → AI → Human Verification → IPFS → Oracle → Arbitrum → Tree Passport`**

Kalau loop ini sudah berjalan, fitur carbon, IoT, satellite, timber revenue, dan marketplace bisa ditambahkan sebagai layer berikutnya tanpa mengubah fondasi arsitekturnya.
