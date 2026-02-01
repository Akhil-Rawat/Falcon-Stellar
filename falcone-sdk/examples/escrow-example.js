/**
 * Example: Using Falcone SDK with Prepaid Escrow Mode
 *
 * Run this example:
 * 1. Start escrow server: node backend/server.js
 * 2. Start this API: node examples/escrow-example.js
 * 3. Fund escrow wallet via frontend
 * 4. Call API with user ID
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { protectWithEscrow } = require("../index");

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

// ============================================
// YOUR CONFIGURATION
// ============================================
const MY_WALLET =
  process.env.STELLAR_WALLET ||
  "GCXCAQEURH7OZ323SV65RFTXURU47IDOG4KBC72NXSBQVS3ACEMA7DFW";
const ESCROW_SERVER = process.env.ESCROW_SERVER || "http://localhost:3001";

console.log("🦅 Falcone SDK - Prepaid Escrow Example");
console.log("💰 Your wallet:", MY_WALLET);
console.log("🏦 Escrow server:", ESCROW_SERVER);

// ============================================
// FREE ENDPOINTS
// ============================================

app.get("/", (req, res) => {
  res.json({
    name: "Falcone Prepaid API Example",
    mode: "Prepaid Escrow",
    endpoints: {
      free: ["GET /"],
      paid: [
        "GET /api/weather (2 XLM per call)",
        "GET /api/translate (1 XLM per call)",
        "GET /api/analyze (5 XLM per call)",
      ],
    },
    usage: "Add x-user-id header or ?userId=YOUR_WALLET query param",
  });
});

// ============================================
// PREPAID PROTECTED ENDPOINTS
// ============================================

// Weather API - 2 XLM per call
app.get(
  "/api/weather",
  protectWithEscrow({
    apiId: "weather-api",
    apiOwnerId: MY_WALLET,
    pricePerCall: 2,
    escrowServer: ESCROW_SERVER,
  }),
  (req, res) => {
    res.json({
      success: true,
      data: {
        location: "Mumbai, India",
        temperature: "28°C",
        conditions: "Sunny",
        forecast: "5-day forecast available",
      },
      remainingBalance: res.locals.escrowBalance,
      timestamp: new Date().toISOString(),
    });
  },
);

// Translation API - 1 XLM per call
app.get(
  "/api/translate",
  protectWithEscrow({
    apiId: "translate-api",
    apiOwnerId: MY_WALLET,
    pricePerCall: 1,
    escrowServer: ESCROW_SERVER,
  }),
  (req, res) => {
    const text = req.query.text || "Hello World";
    res.json({
      success: true,
      data: {
        original: text,
        translated: "नमस्ते दुनिया",
        language: "Hindi",
      },
      remainingBalance: res.locals.escrowBalance,
      timestamp: new Date().toISOString(),
    });
  },
);

// AI Analysis API - 5 XLM per call
app.get(
  "/api/analyze",
  protectWithEscrow({
    apiId: "analyze-api",
    apiOwnerId: MY_WALLET,
    pricePerCall: 5,
    escrowServer: ESCROW_SERVER,
  }),
  (req, res) => {
    res.json({
      success: true,
      data: {
        sentiment: "positive",
        keywords: ["AI", "blockchain", "stellar"],
        confidence: 0.95,
        summary: "Text analysis complete",
      },
      remainingBalance: res.locals.escrowBalance,
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
  console.log(`   Prepaid API Server Running!`);
  console.log("   ═══════════════════════════════════════════");
  console.log(`   🌐 Server: http://localhost:${PORT}`);
  console.log(`   💰 Your wallet: ${MY_WALLET.slice(0, 12)}...`);
  console.log(`   🏦 Escrow: ${ESCROW_SERVER}`);
  console.log("   ═══════════════════════════════════════════");
  console.log("");
  console.log("   📝 How to use:");
  console.log("   1. Fund escrow wallet via frontend");
  console.log("   2. Call APIs with your user ID:");
  console.log(
    `      curl "http://localhost:${PORT}/api/weather?userId=YOUR_WALLET"`,
  );
  console.log("   OR");
  console.log(
    `      curl -H "x-user-id: YOUR_WALLET" http://localhost:${PORT}/api/weather`,
  );
  console.log("");
});
