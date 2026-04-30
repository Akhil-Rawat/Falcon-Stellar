require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const protect = require("./protect");
const API = require("./models/API");
const { seedDatabase } = require("./seed");
const { initEscrow } = require("./escrow-sdk");
const { protectWithEscrow } = require("./escrow-sdk/protectWithEscrow");

const app = express();
const PORT = 3001;

const DEMO_RECEIVER =
  "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG";

// ============================================
// ESCROW CONFIGURATION
// ============================================
const ESCROW_PUBLIC_KEY =
  process.env.ESCROW_PUBLIC_KEY ||
  "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ";
const escrow = initEscrow({
  escrowPublicKey: ESCROW_PUBLIC_KEY,
  asset: "XLM",
});

console.log("💰 Escrow wallet:", ESCROW_PUBLIC_KEY);

// Enable CORS for frontend with exposed custom headers
app.use(
  cors({
    origin: true,
    exposedHeaders: [
      "X-Payment-Amount",
      "X-Payment-Asset",
      "X-Payment-Receiver",
    ],
  }),
);
app.use(express.json());

// ============================================
// MONGODB CONNECTION
// ============================================
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/falcone";

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    // Seed database with dummy data on first run
    await seedDatabase();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️  Escrow and marketplace persistence require MongoDB");
  });

// Generate unique ID
function generateId() {
  return "api-" + Math.random().toString(36).substr(2, 9);
}

// ============================================
// HEALTH & STATUS ENDPOINTS
// ============================================

// GET /health - Health check (for deployment monitoring)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    version: "1.0.0",
  });
});

// ============================================
// API REGISTRATION ENDPOINTS
// ============================================

// POST /api/register - Register a new API
app.post("/api/register", async (req, res) => {
  const {
    name,
    description,
    endpoint,
    price,
    asset,
    receiver,
    category,
    owner,
  } = req.body;

  // Validate required fields
  if (!name || !endpoint || !price || !receiver) {
    return res.status(400).json({
      error: "Missing required fields: name, endpoint, price, receiver",
    });
  }

  try {
    // Check if API with same endpoint already exists
    const exists = await API.findOne({ endpoint });
    if (exists) {
      return res
        .status(400)
        .json({ error: "API with this endpoint already registered" });
    }

    const newAPI = new API({
      id: generateId(),
      name,
      description: description || `${name} API`,
      endpoint,
      price: String(price),
      asset: asset || "XLM",
      receiver,
      category: category || "General",
      owner: owner || "Anonymous",
    });

    await newAPI.save();
    console.log(`✅ New API registered: ${name} (${endpoint})`);

    res.json({
      success: true,
      message: "API registered successfully!",
      api: newAPI,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register API" });
  }
});

// GET /api/list - List all registered APIs
app.get("/api/list", async (req, res) => {
  try {
    const apis = await API.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({
      apis,
      total: apis.length,
    });
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ error: "Failed to fetch APIs" });
  }
});

// GET /api/:id - Get single API details
app.get("/api/details/:id", async (req, res) => {
  try {
    const api = await API.findOne({ id: req.params.id });
    if (!api) {
      return res.status(404).json({ error: "API not found" });
    }
    res.json({ api });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch API" });
  }
});

// DELETE /api/:id - Delete an API
app.delete("/api/:id", async (req, res) => {
  try {
    const result = await API.findOneAndDelete({ id: req.params.id });
    if (!result) {
      return res.status(404).json({ error: "API not found" });
    }
    res.json({ success: true, message: "API deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete API" });
  }
});

// ============================================
// PROTECTED DEMO APIS (Mock endpoints)
// ============================================

// Helper to create protected route configs
function createProtection(amount, receiver) {
  return {
    price: { amount, asset: "XLM" },
    receiver,
  };
}

// 1. Falcone Analyzer - 10 XLM
app.get(
  "/api/analyze",
  protect(
    createProtection(
      "10",
      DEMO_RECEIVER,
    ),
  ),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "falcone-analyze" },
        { $inc: { totalCalls: 1, totalRevenue: 10 } },
      );
    } catch (err) {}
    res.json({
      result: "Success! Text analysis complete.",
      sentiment: "positive",
      keywords: ["AI", "blockchain", "stellar"],
      timestamp: new Date().toISOString(),
    });
  },
);

// 2. Image Recognition - 5 XLM
app.get(
  "/api/vision",
  protect(
    createProtection(
      "5",
      DEMO_RECEIVER,
    ),
  ),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "image-recognition" },
        { $inc: { totalCalls: 1, totalRevenue: 5 } },
      );
    } catch (err) {}
    res.json({
      result: "Image analyzed successfully!",
      objects: ["person", "laptop", "coffee cup"],
      confidence: 0.95,
      timestamp: new Date().toISOString(),
    });
  },
);

// 3. Weather Pro - 2 XLM
app.get(
  "/api/weather",
  protect(
    createProtection(
      "2",
      DEMO_RECEIVER,
    ),
  ),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "weather-premium" },
        { $inc: { totalCalls: 1, totalRevenue: 2 } },
      );
    } catch (err) {}
    res.json({
      result: "Weather data retrieved!",
      location: "Mumbai, India",
      temperature: "28°C",
      conditions: "Partly cloudy",
      forecast: "15-day forecast available",
      timestamp: new Date().toISOString(),
    });
  },
);

// 4. Crypto Prices - 3 XLM
app.get(
  "/api/crypto",
  protect(
    createProtection(
      "3",
      DEMO_RECEIVER,
    ),
  ),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "crypto-prices" },
        { $inc: { totalCalls: 1, totalRevenue: 3 } },
      );
    } catch (err) {}
    res.json({
      result: "Crypto prices fetched!",
      prices: {
        BTC: "$95,420.50",
        ETH: "$3,245.80",
        XLM: "$0.42",
      },
      marketCap: "$3.2T",
      timestamp: new Date().toISOString(),
    });
  },
);

// 5. Neural Translate - 1 XLM
app.get(
  "/api/translate",
  protect(
    createProtection(
      "1",
      DEMO_RECEIVER,
    ),
  ),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "translation-api" },
        { $inc: { totalCalls: 1, totalRevenue: 1 } },
      );
    } catch (err) {}
    res.json({
      result: "Translation complete!",
      originalText: "Hello, World!",
      translatedText: "नमस्ते, दुनिया!",
      targetLanguage: "Hindi",
      timestamp: new Date().toISOString(),
    });
  },
);

// 6. Email Verification - 0.5 XLM
app.get(
  "/api/email-check",
  protect(
    createProtection(
      "0.5",
      DEMO_RECEIVER,
    ),
  ),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "email-validator" },
        { $inc: { totalCalls: 1, totalRevenue: 0.5 } },
      );
    } catch (err) {}
    res.json({
      result: "Email verified!",
      email: "user@example.com",
      isValid: true,
      isDisposable: false,
      deliverability: "high",
      timestamp: new Date().toISOString(),
    });
  },
);

// ============================================
// STATS ENDPOINTS
// ============================================

// GET /api/stats - Get marketplace statistics
app.get("/api/stats", async (req, res) => {
  try {
    const totalApis = await API.countDocuments({ isActive: true });
    const stats = await API.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: "$totalCalls" },
          totalRevenue: { $sum: "$totalRevenue" },
        },
      },
    ]);

    res.json({
      totalApis,
      totalCalls: stats[0]?.totalCalls || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ============================================
// ESCROW PREPAID API ENDPOINTS
// ============================================

// Helper to get userId from request (from header or query)
function getUserId(req) {
  return req.headers["x-user-id"] || req.query.userId;
}

// POST /escrow/fund - Fund user's prepaid balance
app.post("/escrow/fund", async (req, res) => {
  try {
    const { userId, txHash, amount } = req.body;

    if (!userId || !txHash || !amount) {
      return res.status(400).json({
        error: "Missing required fields: userId, txHash, amount",
      });
    }

    const balance = await escrow.recordPrepayment({
      userId,
      txHash,
      amount: parseFloat(amount),
    });

    res.json({
      success: true,
      message: "Prepayment recorded successfully",
      newBalance: balance,
      userId,
      amount: parseFloat(amount),
    });
  } catch (error) {
    console.error("Funding error:", error);
    res.status(400).json({
      error: error.message || "Failed to record prepayment",
    });
  }
});

// GET /escrow/balance/:userId - Get user's prepaid balance
app.get("/escrow/balance/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const balance = await escrow.getUserBalance(userId);

    res.json({
      success: true,
      userId,
      balance,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get balance" });
  }
});

// GET /escrow/payouts - Get pending payouts for API owners
app.get("/escrow/payouts", async (req, res) => {
  try {
    const payouts = await escrow.getPendingPayouts();
    res.json({
      success: true,
      payouts,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get payouts" });
  }
});

// POST /escrow/consume - Consume credits (used by SDK)
app.post("/escrow/consume", async (req, res) => {
  try {
    const { userId, apiId, apiOwnerId, amount } = req.body;

    if (!userId || !apiId || !apiOwnerId || !amount) {
      return res.status(400).json({
        error: "Missing required fields: userId, apiId, apiOwnerId, amount",
      });
    }

    await escrow.consumeCredit({
      userId,
      apiId,
      apiOwnerId,
      amount: parseFloat(amount),
    });

    const balance = await escrow.getUserBalance(userId);

    res.json({
      success: true,
      message: "Credits consumed successfully",
      remainingBalance: balance,
    });
  } catch (error) {
    res.status(402).json({
      error: error.message || "Failed to consume credits",
      remainingBalance: 0,
    });
  }
});

// POST /escrow/settle - Settle batch payouts
app.post("/escrow/settle", async (req, res) => {
  try {
    const settlements = await escrow.settleBatch();
    res.json({
      success: true,
      message: "Batch settlement prepared",
      settlements,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to settle batch" });
  }
});

// GET /escrow/info - Get escrow configuration info
app.get("/escrow/info", (req, res) => {
  res.json({
    success: true,
    escrowPublicKey: ESCROW_PUBLIC_KEY,
    asset: "XLM",
    network: "testnet",
  });
});

// ============================================
// PREPAID PROTECTED DEMO APIS
// ============================================

// 1. Prepaid Analyzer - 10 XLM
app.get(
  "/api/prepaid/analyze",
  protectWithEscrow({
    escrowInstance: escrow,
    apiId: "falcone-analyze",
    apiOwnerId: DEMO_RECEIVER,
    pricePerCall: 10,
    getUserId,
  }),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "falcone-analyze" },
        { $inc: { totalCalls: 1, totalRevenue: 10 } },
      );
    } catch (err) {}

    const userId = getUserId(req);
    const balance = await escrow.getUserBalance(userId);

    res.json({
      result: "Success! Text analysis complete (Prepaid).",
      sentiment: "positive",
      keywords: ["AI", "blockchain", "stellar"],
      timestamp: new Date().toISOString(),
      remainingBalance: balance,
    });
  },
);

// 2. Prepaid Image Recognition - 5 XLM
app.get(
  "/api/prepaid/vision",
  protectWithEscrow({
    escrowInstance: escrow,
    apiId: "image-recognition",
    apiOwnerId: DEMO_RECEIVER,
    pricePerCall: 5,
    getUserId,
  }),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "image-recognition" },
        { $inc: { totalCalls: 1, totalRevenue: 5 } },
      );
    } catch (err) {}

    const userId = getUserId(req);
    const balance = await escrow.getUserBalance(userId);

    res.json({
      result: "Image analyzed successfully! (Prepaid)",
      objects: ["person", "laptop", "coffee cup"],
      confidence: 0.95,
      timestamp: new Date().toISOString(),
      remainingBalance: balance,
    });
  },
);

// 3. Prepaid Weather Pro - 2 XLM
app.get(
  "/api/prepaid/weather",
  protectWithEscrow({
    escrowInstance: escrow,
    apiId: "weather-premium",
    apiOwnerId: DEMO_RECEIVER,
    pricePerCall: 2,
    getUserId,
  }),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "weather-premium" },
        { $inc: { totalCalls: 1, totalRevenue: 2 } },
      );
    } catch (err) {}

    const userId = getUserId(req);
    const balance = await escrow.getUserBalance(userId);

    res.json({
      result: "Weather data retrieved! (Prepaid)",
      location: "Mumbai, India",
      temperature: "28°C",
      conditions: "Partly cloudy",
      forecast: "15-day forecast available",
      timestamp: new Date().toISOString(),
      remainingBalance: balance,
    });
  },
);

// 4. Prepaid Crypto Prices - 3 XLM
app.get(
  "/api/prepaid/crypto",
  protectWithEscrow({
    escrowInstance: escrow,
    apiId: "crypto-prices",
    apiOwnerId: DEMO_RECEIVER,
    pricePerCall: 3,
    getUserId,
  }),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "crypto-prices" },
        { $inc: { totalCalls: 1, totalRevenue: 3 } },
      );
    } catch (err) {}

    const userId = getUserId(req);
    const balance = await escrow.getUserBalance(userId);

    res.json({
      result: "Crypto prices fetched! (Prepaid)",
      prices: {
        BTC: "$95,420.50",
        ETH: "$3,245.80",
        XLM: "$0.42",
      },
      marketCap: "$3.2T",
      timestamp: new Date().toISOString(),
      remainingBalance: balance,
    });
  },
);

// 5. Prepaid Neural Translate - 1 XLM
app.get(
  "/api/prepaid/translate",
  protectWithEscrow({
    escrowInstance: escrow,
    apiId: "translation-api",
    apiOwnerId: DEMO_RECEIVER,
    pricePerCall: 1,
    getUserId,
  }),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "translation-api" },
        { $inc: { totalCalls: 1, totalRevenue: 1 } },
      );
    } catch (err) {}

    const userId = getUserId(req);
    const balance = await escrow.getUserBalance(userId);

    res.json({
      result: "Translation complete! (Prepaid)",
      originalText: "Hello, World!",
      translatedText: "नमस्ते, दुनिया!",
      targetLanguage: "Hindi",
      timestamp: new Date().toISOString(),
      remainingBalance: balance,
    });
  },
);

// 6. Prepaid Email Verification - 0.5 XLM
app.get(
  "/api/prepaid/email-check",
  protectWithEscrow({
    escrowInstance: escrow,
    apiId: "email-validator",
    apiOwnerId: DEMO_RECEIVER,
    pricePerCall: 0.5,
    getUserId,
  }),
  async (req, res) => {
    try {
      await API.findOneAndUpdate(
        { id: "email-validator" },
        { $inc: { totalCalls: 1, totalRevenue: 0.5 } },
      );
    } catch (err) {}

    const userId = getUserId(req);
    const balance = await escrow.getUserBalance(userId);

    res.json({
      result: "Email verified! (Prepaid)",
      email: "user@example.com",
      isValid: true,
      isDisposable: false,
      deliverability: "high",
      timestamp: new Date().toISOString(),
      remainingBalance: balance,
    });
  },
);

app.listen(PORT, () => {
  console.log(`🚀 Falcone SDK Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
