<img width="1910" height="907" alt="Screenshot 2026-02-01 134009" src="https://github.com/user-attachments/assets/bb5ca431-c9b8-4fcf-b1ef-302e42f086ff" />


Our Escrow Wallet For Escrow SDK , Where User Fund this wallet and Use Our API
Escrow Public Key: GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ
SDK(To wrap your API) : 
npx @anshu007/falcon-api-sdk register \
  --name "API Name" \
  --description "Description" \
  --endpoint "http://localhost:3000/api/..." \
  --price 80 \
  --wallet "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ" \
  --mode escrow  # ya pay-per-user 
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
