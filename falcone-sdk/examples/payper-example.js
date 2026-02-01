/**
 * Example: Using Falcone SDK with Pay-per-call Mode
 *
 * Run this example:
 * 1. Start this API: node examples/payper-example.js
 * 2. Call API without payment → get 402
 * 3. Send Stellar payment
 * 4. Call API with transaction hash → get data
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { protect } = require("../index");

const app = express();
const PORT = 4002;

app.use(cors());
app.use(express.json());

// ============================================
// YOUR CONFIGURATION
// ============================================
const MY_WALLET =
  process.env.STELLAR_WALLET ||
  "GCXCAQEURH7OZ323SV65RFTXURU47IDOG4KBC72NXSBQVS3ACEMA7DFW";

console.log("🦅 Falcone SDK - Pay-per-call Example");
console.log("💰 Your wallet:", MY_WALLET);

// ============================================
// FREE ENDPOINTS
// ============================================

app.get("/", (req, res) => {
  res.json({
    name: "Falcone Pay-per-call API Example",
    mode: "Direct Payment",
    endpoints: {
      free: ["GET /"],
      paid: [
        "GET /api/premium (5 XLM per call)",
        "GET /api/data (3 XLM per call)",
      ],
    },
    usage: "Add x-payment-tx header with Stellar transaction hash",
  });
});

// ============================================
// PAY-PER-CALL PROTECTED ENDPOINTS
// ============================================

// Premium API - 5 XLM per call
app.get(
  "/api/premium",
  protect({
    price: { amount: "5", asset: "XLM" },
    receiver: MY_WALLET,
  }),
  (req, res) => {
    res.json({
      success: true,
      message: "Payment verified! Here is your premium content.",
      data: {
        content: "This is exclusive premium data",
        accessLevel: "Premium",
        validUntil: new Date(Date.now() + 86400000).toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  },
);

// Data API - 3 XLM per call
app.get(
  "/api/data",
  protect({
    price: { amount: "3", asset: "XLM" },
    receiver: MY_WALLET,
  }),
  (req, res) => {
    res.json({
      success: true,
      data: {
        records: [
          { id: 1, name: "Record 1", value: 100 },
          { id: 2, name: "Record 2", value: 200 },
          { id: 3, name: "Record 3", value: 300 },
        ],
        total: 3,
      },
      timestamp: new Date().toISOString(),
    });
  },
);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log("");
  console.log("🚀 ═══════════════════════════════════════════");
  console.log(`   Pay-per-call API Server Running!`);
  console.log("   ═══════════════════════════════════════════");
  console.log(`   🌐 Server: http://localhost:${PORT}`);
  console.log(`   💰 Payments to: ${MY_WALLET.slice(0, 12)}...`);
  console.log("   ═══════════════════════════════════════════");
  console.log("");
  console.log("   📝 How to use:");
  console.log("   1. Try API without payment:");
  console.log(`      curl http://localhost:${PORT}/api/premium`);
  console.log("   → Returns 402 with payment details");
  console.log("");
  console.log("   2. Send Stellar payment to:");
  console.log(`      ${MY_WALLET}`);
  console.log("");
  console.log("   3. Call API with transaction hash:");
  console.log(
    `      curl -H "x-payment-tx: TX_HASH" http://localhost:${PORT}/api/premium`,
  );
  console.log("");
});
