# Falcone SDK

> 💰 Monetize your APIs with Stellar payments

Falcone SDK allows developers to wrap their Express.js API endpoints with pay-per-call protection using Stellar blockchain payments.

## Installation

```bash
npm install falcone-sdk
```

## Quick Start

### 1. Wrap Your API

```javascript
const express = require('express');
const { protect } = require('falcone-sdk');

const app = express();

// Protect your API endpoint
app.get('/api/premium', protect({
  price: { amount: '10', asset: 'XLM' },
  receiver: 'GXXXXX...' // Your Stellar wallet address
}), (req, res) => {
  res.json({ data: 'Premium content!' });
});

app.listen(3000);
```

### 2. Register on Marketplace

```bash
npx falcone register \
  --name "My Premium API" \
  --description "Amazing API that does cool things" \
  --endpoint "https://myapi.com/api/premium" \
  --price 10 \
  --wallet "GXXXXX..."
```

### 3. Done! 🎉

Your API is now live on the Falcone Marketplace. Users can discover and pay for your API.

## How It Works

1. User calls your protected API
2. API returns `402 Payment Required` with payment details
3. User pays via Stellar (Freighter wallet or direct transfer)
4. User retries API call with `x-payment-tx` header
5. SDK verifies payment on Stellar blockchain
6. API returns the premium content

## API Reference

### `protect(config)`

Express middleware that protects your API endpoint.

```javascript
protect({
  price: {
    amount: '10',    // Price per call
    asset: 'XLM'      // Payment asset (XLM, USDC, etc.)
  },
  receiver: 'GXXX...', // Your Stellar wallet address
  validateRequest: (req) => true // Optional: custom validation
})
```

### `registerAPI(config)`

Programmatically register your API on the marketplace.

```javascript
const { registerAPI } = require('falcone-sdk');

await registerAPI({
  name: 'My API',
  description: 'Amazing API',
  endpoint: 'https://myapi.com/api/endpoint',
  price: '10',
  asset: 'XLM',
  receiver: 'GXXX...',
  category: 'AI & ML',
  owner: 'My Company'
});
```

## CLI Commands

```bash
# Register an API
npx falcone register --name "..." --endpoint "..." --price 10 --wallet "..."

# List all registered APIs
npx falcone list

# Show setup instructions
npx falcone init

# Help
npx falcone help
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FALCONE_REGISTRY` | Override registry URL | `http://localhost:3001` |

## License

MIT © Falcone Labs
