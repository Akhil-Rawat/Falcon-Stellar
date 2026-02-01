const express = require("express");
const cors = require("cors");
const { protect } = require("@anshu007/falcone-sdk");

const app = express();
app.use(cors());
app.use(express.json());

// Demo API 1: Weather Data (Pay-per-user)
app.get(
  "/api/weather",
  protect({
    price: { amount: 5, asset: "XLM" },
    receiver: "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ",
    apiName: "Weather Data API",
  }),
  (req, res) => {
    res.json({
      success: true,
      data: {
        location: "New York",
        temperature: "22°C",
        condition: "Sunny",
        humidity: "45%",
        wind: "12 km/h",
        forecast: [
          { day: "Monday", temp: "23°C", condition: "Partly Cloudy" },
          { day: "Tuesday", temp: "21°C", condition: "Rainy" },
          { day: "Wednesday", temp: "24°C", condition: "Sunny" },
        ],
      },
      timestamp: new Date().toISOString(),
    });
  },
);

// Demo API 2: Crypto Prices (Pay-per-user)
app.get(
  "/api/crypto-live",
  protect({
    price: { amount: 3, asset: "XLM" },
    receiver: "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ",
    apiName: "Crypto Prices Live",
  }),
  (req, res) => {
    res.json({
      success: true,
      data: {
        BTC: { price: 45234.56, change: "+2.3%" },
        ETH: { price: 2345.78, change: "+1.8%" },
        XLM: { price: 0.234, change: "+5.2%" },
        USDC: { price: 1.0, change: "0%" },
      },
      timestamp: new Date().toISOString(),
    });
  },
);

// Demo API 3: AI Text Analysis (Pay-per-user)
app.post(
  "/api/analyze-text",
  protect({
    price: { amount: 8, asset: "XLM" },
    receiver: "GALFFRMVCGOPUHSXER3ZZKYHR25F4ISJFTLPEGX3UI4B63MPKUC75BLJ",
    apiName: "AI Text Analyzer",
  }),
  (req, res) => {
    const { text } = req.body;

    res.json({
      success: true,
      analysis: {
        sentiment: "positive",
        confidence: 0.87,
        keywords: ["blockchain", "API", "payment", "stellar"],
        wordCount: text?.split(" ").length || 0,
        language: "English",
        toxicity: "low",
      },
      timestamp: new Date().toISOString(),
    });
  },
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Demo API Server Running" });
});

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║  🚀 Demo API Server Running                   ║
║                                               ║
║  Port: ${PORT}                                    ║
║  Endpoints:                                   ║
║    GET  /api/weather          (5 XLM)        ║
║    GET  /api/crypto-live      (3 XLM)        ║
║    POST /api/analyze-text     (8 XLM)        ║
║                                               ║
║  Protected by Falcone SDK                     ║
╚═══════════════════════════════════════════════╝
    `);
});
