# 🦅 Falcone SDK

**Monetize your APIs with Stellar blockchain payments**

Falcone SDK provides two powerful payment modes for API monetization:

1. **💳 Pay-per-call**: Users pay directly for each API call
2. **💰 Prepaid Escrow**: Users prepay to an escrow wallet, then consume credits

---

## 📦 Installation

```bash
npm install @anshu007/falcone-sdk
```

---

## 🚀 Quick Start

### Mode 1: Pay-per-call (Direct Payment)

Users must send a Stellar payment for **each API call**.

```javascript
const express = require("express");
const { protect } = require("@anshu007/falcone-sdk");

const app = express();

// Protect your API endpoint
app.get(
  "/api/premium-data",
  protect({
    price: {
      amount: "5", // 5 XLM per call
      asset: "XLM",
    },
    receiver: "GXXXXX...", // Your Stellar wallet
  }),
  (req, res) => {
    res.json({ data: "Premium content!" });
  },
);

app.listen(3000);
```

**How it works:**

1. User calls API without payment → gets **402 Payment Required**
2. User sends Stellar payment with transaction hash
3. SDK verifies payment on-chain
4. API returns data

---

### Mode 2: Prepaid Escrow (Credit System)

Users **prepay once** to an escrow wallet, then make **multiple API calls** until balance runs out.

```javascript
const express = require("express");
const { protectWithEscrow } = require("@anshu007/falcone-sdk");

const app = express();

// Protect with escrow (requires escrow server running)
app.get(
  "/api/premium-data",
  protectWithEscrow({
    apiId: "premium-data-api",
    apiOwnerId: "GXXXXX...", // Your Stellar wallet
    pricePerCall: 2, // 2 XLM per call
    escrowServer: "http://localhost:3001", // Optional
  }),
  (req, res) => {
    res.json({
      data: "Premium content!",
      remainingBalance: res.locals.escrowBalance,
    });
  },
);

app.listen(4000);
```

**How it works:**

1. User funds escrow wallet once (e.g., 100 XLM)
2. User calls API with their user ID
3. SDK deducts credits from balance (2 XLM per call)
4. User can make 50 calls before balance runs out
5. Returns **402** when balance is insufficient

---

## 📖 API Reference

### `protect(config)` - Pay-per-call Mode

| Parameter      | Type   | Required | Description                 |
| -------------- | ------ | -------- | --------------------------- |
| `price.amount` | string | ✅       | Payment amount (e.g., '5')  |
| `price.asset`  | string | ✅       | Asset type (e.g., 'XLM')    |
| `receiver`     | string | ✅       | Your Stellar wallet address |

**Request Headers:**

- `x-payment-tx`: Stellar transaction hash

**Response (402):**

```json
{
  "error": "Payment required",
  "payment": {
    "amount": "5",
    "asset": "XLM",
    "receiver": "GXXXXX..."
  }
}
```

---

### `protectWithEscrow(config)` - Prepaid Escrow Mode

| Parameter      | Type     | Required | Description                                 |
| -------------- | -------- | -------- | ------------------------------------------- |
| `apiId`        | string   | ✅       | Unique API identifier                       |
| `apiOwnerId`   | string   | ✅       | Your Stellar wallet address                 |
| `pricePerCall` | number   | ✅       | Credits per call (e.g., 2)                  |
| `escrowServer` | string   | ❌       | Escrow server URL (default: localhost:3001) |
| `getUserId`    | function | ❌       | Custom user ID extractor                    |

**Request Headers/Query:**

- `x-user-id` header OR `?userId=...` query param

**Response (402):**

```json
{
  "error": "Insufficient prepaid balance",
  "pricePerCall": 2,
  "remainingBalance": 0.5,
  "escrowInfo": "http://localhost:3001/escrow/info"
}
```

---

## 🏗️ Setup Escrow Server

To use **Prepaid Escrow mode**, you need to run the Falcone Escrow Server:

```bash
# Clone the escrow server
git clone https://github.com/anshuthecoder/-The-Falcons
cd cosmos-style-interchain-ui/backend

# Install dependencies
npm install

# Set environment variables
echo "ESCROW_PUBLIC_KEY=GXXXXX..." >> .env
echo "MONGODB_URI=mongodb://localhost:27017/falcone" >> .env

# Start server
node server.js
```

Escrow server provides these endpoints:

- `POST /escrow/fund` - Fund user balance
- `GET /escrow/balance/:userId` - Check balance
- `POST /escrow/consume` - Deduct credits (used by SDK)
- `GET /escrow/info` - Get escrow wallet info

---

## 🎯 Which Mode Should I Use?

| Feature               | Pay-per-call    | Prepaid Escrow           |
| --------------------- | --------------- | ------------------------ |
| **Best for**          | High-value APIs | High-frequency APIs      |
| **User experience**   | Pay each time   | Pay once, use many times |
| **Transaction fees**  | Per call        | One-time funding         |
| **Setup complexity**  | Simple ✅       | Requires escrow server   |
| **Replay protection** | Built-in        | Built-in                 |

---

## 🔒 Security Features

- ✅ **Replay attack prevention**: Transaction hashes tracked
- ✅ **On-chain verification**: Payments verified on Stellar network
- ✅ **Amount validation**: Ensures correct payment amount
- ✅ **Asset validation**: Ensures correct asset type
- ✅ **Balance tracking**: Real-time balance updates (escrow mode)

---

## 🌟 Examples

### Custom User ID Extraction (Escrow Mode)

```javascript
app.get(
  "/api/data",
  protectWithEscrow({
    apiId: "my-api",
    apiOwnerId: "GXXXXX...",
    pricePerCall: 1,
    getUserId: (req) => {
      // Extract from JWT token
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, SECRET);
      return decoded.walletAddress;
    },
  }),
  (req, res) => {
    res.json({ data: "Authenticated content!" });
  },
);
```

### Environment Configuration

```javascript
// .env file
FALCONE_ESCROW_SERVER=https://escrow.yourapp.com
STELLAR_WALLET=GXXXXX...
```

```javascript
// Your API
const { protectWithEscrow } = require("@anshu007/falcone-sdk");

app.get(
  "/api/data",
  protectWithEscrow({
    apiId: process.env.API_ID,
    apiOwnerId: process.env.STELLAR_WALLET,
    pricePerCall: 3,
  }),
  handler,
);
```

---

## 📚 Full Example Apps

See the `/developer-demo` folder for complete working examples:

- Pay-per-call example
- Prepaid escrow example
- Frontend integration with Freighter wallet

---

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/anshuthecoder/-The-Falcons/issues)
- **Docs**: [Full Documentation](https://falcone.dev)

---

## 📜 License

MIT © Falcone Labs

---

**Made with ❤️ for the Stellar ecosystem**
