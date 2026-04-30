<img width="1910" height="907" alt="Screenshot 2026-02-01 134009" src="https://github.com/user-attachments/assets/bb5ca431-c9b8-4fcf-b1ef-302e42f086ff" />

Our Escrow Wallet For Escrow SDK , Where User Fund this wallet and Use Our API

---

## Escrow Public Key: GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ

## SDK(To wrap your API) :

npx @anshu007/falcon-api-sdk register \
 --name "API Name" \
 --description "Description" \
 --endpoint "http://localhost:3000/api/..." \
 --price 80 \
 --wallet "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ" \
 --mode escrow # ya pay-per-user

---

# Pay-Per-Request Infrastructure for APIs

This project enables APIs and AI tools to be paid **per request**, instead of forcing users into subscriptions or accounts.

Each API call declares its price and is unlocked only after a verified payment.  
Payments are enforced at the HTTP layer using standard semantics, making the system simple, predictable, and developer-friendly.

The goal is to make payments feel invisible while matching how software is actually used.

---

## Why This Exists

Most APIs today are used per request but paid per month.  
This mismatch creates friction for:

- developers trying new tools,
- users who only need one or two calls,
- AI agents and automated systems that cannot subscribe.

Traditional payment systems are too heavy and expensive for request-level payments.

This project fixes that by bringing value exchange directly to the request layer.

---

## Core Concepts

### Pay-Per-Request

Each API call requires a small payment.  
No payment means no access.

### Escrow-Based Usage

Users can pre-fund an escrow wallet once and then freely use APIs until the balance runs out.  
Each request deducts from the escrow balance.

Both models use the same protocol and SDK.

---

<img width="800" height="728" alt="Screenshot 2026-02-01 092048" src="https://github.com/user-attachments/assets/eb3c61a0-9543-4a5a-944f-53428b197162" />

## What Is the Escrow Wallet?

The escrow wallet is a **pre-funded Stellar account** representing a user’s spending balance.

Instead of paying for every request individually, a user:

1. Deposits funds into the escrow wallet
2. Uses multiple APIs
3. Pays automatically per request from that balance

The escrow wallet is not a smart contract.  
It is a transparent account whose balance is verified on every request.

---

## How It Works (High Level)

1. A request is sent to an API
2. The backend checks for payment or escrow balance
3. If unpaid or insufficient:
   - the API responds with `402 Payment Required`
4. If valid:
   - the request is processed
   - access is granted automatically

All enforcement happens at the HTTP layer.

---

## HTTP-Level Enforcement (x402-style)

APIs communicate payment requirements using standard HTTP responses.

Example:

```http
HTTP/1.1 402 Payment Required
X-Payment-Amount: 0.5
X-Payment-Asset: XLM
X-Payment-Reason: Insufficient balance
```

## MongoDB Atlas Checklist (IP Allowlist)

If MongoDB works on one network but fails on another, your Atlas network access rules are usually the reason.

1. Open Atlas -> Security -> Network Access.
2. Add your current public IP and save.
3. For development across changing networks, use 0.0.0.0/0 temporarily.
4. In production, restrict this to your backend host egress IPs.
5. In Atlas -> Database -> Connect, verify your URI includes a database name.

Backend env in backend/.env:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/falcone?retryWrites=true&w=majority
ESCROW_PUBLIC_KEY=GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ
```

Frontend env in .env:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Deploy For Public Access

Vercel should host the frontend. Host the Express backend separately (Render, Railway, Fly.io, or a VPS), then point the frontend to it.

1. Deploy backend (directory: backend) and set backend env vars:
   1. MONGODB_URI
   2. ESCROW_PUBLIC_KEY
2. Confirm backend health by opening /api/list on the deployed URL.
3. Deploy frontend on Vercel from repo root.
4. Add Vercel env var VITE_API_BASE_URL=https://<your-backend-domain>.
5. Redeploy frontend.

After deploy, the Marketplace and Prepaid pages read data from the deployed backend, which persists to Atlas.

## Architecture

This project uses a split architecture:

1. Frontend (`React + Vite`)
2. Backend (`Express + Node.js`)
3. Data layer (`MongoDB Atlas`)
4. Payment rails (`Stellar testnet`)

### Component View

1. `Frontend (Vercel/local)`
   1. Pages: Marketplace, Prepaid Marketplace, SDK Docs
   2. Calls backend using `VITE_API_BASE_URL`
   3. Handles wallet-driven payment flow using Freighter
2. `Backend API (Render/local)`
   1. Public routes: `/api/list`, `/api/stats`, `/health`
   2. Protected pay-per-call routes: `/api/analyze`, `/api/vision`, etc.
   3. Escrow routes: `/escrow/fund`, `/escrow/balance/:userId`, `/api/prepaid/*`
3. `MongoDB`
   1. Stores API catalog (`models/API.js`)
   2. Stores escrow balances and pending payouts (`backend/models/*`)
4. `Stellar + Freighter`
   1. User signs payment transaction in wallet
   2. Backend verifies tx hash before unlocking access

### Request Sequence (Pay-Per-Call)

1. User clicks `Try API`.
2. Frontend calls API endpoint without payment header.
3. Backend responds `402 Payment Required` with:
   1. `X-Payment-Amount`
   2. `X-Payment-Asset`
   3. `X-Payment-Receiver`
4. Frontend opens payment modal.
5. User pays via Freighter or submits tx hash manually.
6. Frontend retries request with `x-payment-tx` header.
7. Backend verifies transaction and returns API data.

### Request Sequence (Escrow / Prepaid)

1. User funds escrow wallet with XLM.
2. Frontend calls `POST /escrow/fund` with `userId`, `txHash`, `amount`.
3. Backend verifies tx on Stellar and credits user balance in Mongo.
4. User calls prepaid endpoint with `X-User-Id`.
5. Middleware deducts credits from escrow balance.
6. API response includes `remainingBalance`.

### Why This Works

1. HTTP-native enforcement (`402`) keeps integration simple.
2. Blockchain transaction verification prevents fake payments.
3. Mongo persistence removes in-memory data loss issues.
4. Two modes (pay-per-call and prepaid) share the same API marketplace UX.

## SDK Integration (How We Make This Work)

### 1) Install SDK

```bash
npm install @anshu007/falcone-sdk
```

### 2) Protect an API endpoint

```js
const express = require("express");
const { protect } = require("@anshu007/falcone-sdk");

const app = express();

app.get(
  "/api/premium",
  protect({
    price: { amount: "2", asset: "XLM" },
    receiver: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG",
  }),
  (req, res) => {
    res.json({ ok: true, message: "Premium data unlocked" });
  },
);
```

### 3) Register API in marketplace

```bash
npx @anshu007/falcon-api-sdk register \
  --name "My API" \
  --description "Does premium work" \
  --endpoint "https://my-domain.com/api/premium" \
  --price 2 \
  --wallet "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG" \
  --mode pay-per-user
```

### 4) Client flow summary

1. Call endpoint.
2. Receive `402` and payment headers.
3. Pay via Freighter.
4. Retry with `x-payment-tx`.
5. Get response.
