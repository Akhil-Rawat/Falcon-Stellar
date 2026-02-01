/**
 * ============================================
 * MY PAID API - Using Falcone SDK
 * ============================================
 * 
 * This is an example of how a developer would use
 * the Falcone SDK to monetize their API.
 * 
 * Users must pay the specified amount in XLM before
 * accessing the protected endpoints.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { protect } = require('@anshu007/falcone-sdk');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors({
    origin: true,
    exposedHeaders: ['X-Payment-Amount', 'X-Payment-Asset', 'X-Payment-Receiver'],
}));
app.use(express.json());

// ============================================
// CONFIGURATION FROM .env FILE
// ============================================
const config = {
    wallet: process.env.STELLAR_WALLET,
    price: process.env.API_PRICE || '5',
    asset: process.env.API_ASSET || 'XLM',
    name: process.env.API_NAME || 'My API',
};

console.log('📦 API Configuration:');
console.log(`   Name: ${config.name}`);
console.log(`   Price: ${config.price} ${config.asset}`);
console.log(`   Wallet: ${config.wallet?.slice(0, 8)}...${config.wallet?.slice(-8)}`);

// ============================================
// FREE ENDPOINTS (No payment required)
// ============================================

// Health check
app.get('/', (req, res) => {
    res.json({
        name: config.name,
        status: 'running',
        pricing: `${config.price} ${config.asset} per call`,
        endpoints: {
            free: ['GET /', 'GET /api/info'],
            paid: ['GET /api/summarize', 'POST /api/summarize'],
        },
    });
});

// API info (free)
app.get('/api/info', (req, res) => {
    res.json({
        name: config.name,
        description: process.env.API_DESCRIPTION,
        price: config.price,
        asset: config.asset,
        owner: process.env.OWNER_NAME,
        payTo: config.wallet,
    });
});

// ============================================
// PAID ENDPOINTS (Protected by Falcone SDK)
// ============================================

// Protection configuration
const paymentProtection = protect({
    price: {
        amount: config.price,
        asset: config.asset,
    },
    receiver: config.wallet,
});

// GET /api/summarize - Paid endpoint
app.get('/api/summarize', paymentProtection, (req, res) => {
    // This code only runs AFTER payment is verified
    res.json({
        success: true,
        message: 'Payment verified! Here is your premium content.',
        summary: 'This is a demo summary. In a real API, you would process the user\'s request here.',
        credits: 1,
        timestamp: new Date().toISOString(),
    });
});

// POST /api/summarize - Paid endpoint with body
app.post('/api/summarize', paymentProtection, (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Please provide text to summarize' });
    }

    // Simulate AI summarization
    const words = text.split(' ');
    const summary = words.length > 20 
        ? words.slice(0, 20).join(' ') + '...' 
        : text;

    res.json({
        success: true,
        original_length: text.length,
        summary: summary,
        summary_length: summary.length,
        compression_ratio: ((1 - summary.length / text.length) * 100).toFixed(1) + '%',
        timestamp: new Date().toISOString(),
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ═══════════════════════════════════════════');
    console.log(`   ${config.name} is running!`);
    console.log('   ═══════════════════════════════════════════');
    console.log(`   🌐 Server: http://localhost:${PORT}`);
    console.log(`   💰 Price: ${config.price} ${config.asset} per call`);
    console.log(`   📬 Payments go to: ${config.wallet?.slice(0, 12)}...`);
    console.log('   ═══════════════════════════════════════════');
    console.log('');
    console.log('   Free endpoints:');
    console.log(`   • GET  http://localhost:${PORT}/`);
    console.log(`   • GET  http://localhost:${PORT}/api/info`);
    console.log('');
    console.log('   Paid endpoints (requires Stellar payment):');
    console.log(`   • GET  http://localhost:${PORT}/api/summarize`);
    console.log(`   • POST http://localhost:${PORT}/api/summarize`);
    console.log('');
});
