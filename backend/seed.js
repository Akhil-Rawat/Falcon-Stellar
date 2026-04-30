const mongoose = require('mongoose');
const API = require('./models/API');

const DEMO_RECEIVER = 'GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG';

// Dummy APIs data - all pointing to local mock endpoints
const dummyAPIs = [
    {
        id: 'falcone-analyze',
        name: 'Falcone Analyzer',
        description: 'Premium text analysis powered by AI. Returns insights, sentiment, and structured data from any text input.',
        endpoint: 'http://localhost:3001/api/analyze',
        price: '10',
        asset: 'XLM',
        receiver: DEMO_RECEIVER,
        category: 'AI & ML',
        owner: 'Falcone Labs',
    },
    {
        id: 'image-recognition',
        name: 'Image Recognition API',
        description: 'Advanced computer vision API that identifies objects, faces, and scenes in images with high accuracy.',
        endpoint: 'http://localhost:3001/api/vision',
        price: '5',
        asset: 'XLM',
        receiver: DEMO_RECEIVER,
        category: 'AI & ML',
        owner: 'VisionAI Labs',
    },
    {
        id: 'weather-premium',
        name: 'Weather Pro API',
        description: 'Real-time weather data with 15-day forecasts, historical data, and severe weather alerts worldwide.',
        endpoint: 'http://localhost:3001/api/weather',
        price: '2',
        asset: 'XLM',
        receiver: DEMO_RECEIVER,
        category: 'Data',
        owner: 'WeatherStack',
    },
    {
        id: 'crypto-prices',
        name: 'Crypto Price Feed',
        description: 'Real-time cryptocurrency prices for 5000+ coins with historical data and market cap rankings.',
        endpoint: 'http://localhost:3001/api/crypto',
        price: '3',
        asset: 'XLM',
        receiver: DEMO_RECEIVER,
        category: 'Finance',
        owner: 'CryptoData Inc',
    },
    {
        id: 'translation-api',
        name: 'Neural Translate',
        description: 'AI-powered translation supporting 100+ languages with context-aware translations and language detection.',
        endpoint: 'http://localhost:3001/api/translate',
        price: '1',
        asset: 'XLM',
        receiver: DEMO_RECEIVER,
        category: 'AI & ML',
        owner: 'LinguaTech',
    },
    {
        id: 'email-validator',
        name: 'Email Verification API',
        description: 'Validate email addresses in real-time. Check deliverability, syntax, and detect disposable emails.',
        endpoint: 'http://localhost:3001/api/email-check',
        price: '0.5',
        asset: 'XLM',
        receiver: DEMO_RECEIVER,
        category: 'Utilities',
        owner: 'MailGuard',
    },
];

async function seedDatabase() {
    try {
        // Clear and reseed
        await API.deleteMany({});
        await API.insertMany(dummyAPIs);
        console.log(`✅ Seeded database with ${dummyAPIs.length} dummy APIs`);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
    }
}

module.exports = { seedDatabase, dummyAPIs };
