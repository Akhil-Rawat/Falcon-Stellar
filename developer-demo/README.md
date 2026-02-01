# 🚀 My Paid API - Powered by Falcone SDK

This is a demo project showing how developers can monetize their APIs using the **Falcone SDK** with Stellar payments.

## 📦 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Your API
Edit the `.env` file with your details:

```env
# Your Stellar wallet (where payments go)
STELLAR_WALLET=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# API details
API_NAME=My Amazing API
API_DESCRIPTION=Description of what your API does
API_PRICE=5
API_ASSET=XLM
API_CATEGORY=AI & ML

# Your name/company
OWNER_NAME=Your Company
```

### 3. Start Your API Server
```bash
npm start
```

Your API will run at `http://localhost:4000`

### 4. Register on Falcone Marketplace
```bash
npm run register
```

This adds your API to the marketplace so users can discover it!

---

## 🔒 How It Works

### Free Endpoints
These are accessible to everyone:
- `GET /` - Health check
- `GET /api/info` - API information

### Paid Endpoints (Protected)
These require payment before access:
- `GET /api/summarize` - Returns premium content
- `POST /api/summarize` - Processes user data

When a user calls a paid endpoint without payment:
```json
HTTP 402 Payment Required
{
  "error": "Payment required",
  "amount": "5",
  "asset": "XLM",
  "payTo": "GXXX..."
}
```

After they pay and include the transaction hash:
```json
HTTP 200 OK
{
  "success": true,
  "summary": "Your processed data...",
  "timestamp": "2024-01-31T..."
}
```

---

## 💻 Code Example

```javascript
const express = require('express');
const { protect } = require('@anshu007/falcone-sdk');

const app = express();

// Public endpoint - FREE
app.get('/api/free', (req, res) => {
  res.json({ message: 'This is free!' });
});

// Protected endpoint - PAID (5 XLM)
app.get('/api/premium', protect({
  price: { amount: '5', asset: 'XLM' },
  receiver: 'YOUR_STELLAR_WALLET'
}), (req, res) => {
  res.json({ message: 'Payment verified! Premium content here.' });
});

app.listen(4000);
```

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the API server |
| `npm run register` | Register API on Falcone Marketplace |

---

## 🌟 Falcone SDK Features

- ✅ Pay-per-call API protection
- ✅ Stellar blockchain payments
- ✅ Automatic payment verification
- ✅ Replay attack prevention
- ✅ Easy marketplace registration
- ✅ CLI tools for developers

---

## 📚 Documentation

- [Falcone SDK on npm](https://www.npmjs.com/package/@anshu007/falcone-sdk)
- [Stellar Network](https://stellar.org)

---

Made with ❤️ using Falcone SDK
