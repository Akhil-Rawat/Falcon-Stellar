#!/usr/bin/env node

/**
 * Falcone CLI
 * Command-line tool for managing Falcone SDK
 * 
 * Usage:
 *   npx falcone register --name "My API" --endpoint "http://..." --price 10 --wallet "GXXX..."
 *   npx falcone init
 *   npx falcone list
 */

const axios = require('axios');

const FALCONE_REGISTRY = process.env.FALCONE_REGISTRY || 'http://localhost:3001';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Helper to parse flags
function getFlag(name) {
    const index = args.indexOf(`--${name}`);
    if (index !== -1 && args[index + 1]) {
        return args[index + 1];
    }
    return null;
}

// Print banner
function printBanner() {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   ███████╗ █████╗ ██╗      ██████╗ ██████╗   ║
  ║   ██╔════╝██╔══██╗██║     ██╔════╝██╔═══██╗  ║
  ║   █████╗  ███████║██║     ██║     ██║   ██║  ║
  ║   ██╔══╝  ██╔══██║██║     ██║     ██║   ██║  ║
  ║   ██║     ██║  ██║███████╗╚██████╗╚██████╔╝  ║
  ║   ╚═╝     ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝   ║
  ║                                               ║
  ║   Monetize your APIs with Stellar payments   ║
  ╚═══════════════════════════════════════════════╝
  `);
}

// Commands
async function registerAPI() {
    const name = getFlag('name');
    const description = getFlag('description') || getFlag('desc');
    const endpoint = getFlag('endpoint');
    const price = getFlag('price');
    const asset = getFlag('asset') || 'XLM';
    const wallet = getFlag('wallet') || getFlag('receiver');
    const category = getFlag('category') || 'General';
    const owner = getFlag('owner') || 'Anonymous';

    if (!name || !endpoint || !price || !wallet) {
        console.error('❌ Missing required flags.');
        console.log(`
Usage:
  npx falcone register \\
    --name "My API" \\
    --description "Amazing API" \\
    --endpoint "https://myapi.com/api/endpoint" \\
    --price 10 \\
    --wallet "GXXXXXXX..." \\
    --category "AI & ML" \\
    --owner "My Company"

Required: --name, --endpoint, --price, --wallet
Optional: --description, --category, --owner, --asset (default: XLM)
    `);
        process.exit(1);
    }

    console.log('📡 Registering API on Falcone Marketplace...\n');

    try {
        const response = await axios.post(`${FALCONE_REGISTRY}/api/register`, {
            name,
            description: description || `${name} API`,
            endpoint,
            price,
            asset,
            receiver: wallet,
            category,
            owner,
        });

        console.log('✅ API Registered Successfully!\n');
        console.log(`   Name:     ${name}`);
        console.log(`   Endpoint: ${endpoint}`);
        console.log(`   Price:    ${price} ${asset}`);
        console.log(`   Wallet:   ${wallet.slice(0, 8)}...${wallet.slice(-4)}`);
        console.log(`   Category: ${category}`);
        console.log('\n🎉 Your API is now live on the Falcone Marketplace!');
        console.log(`   View it at: ${FALCONE_REGISTRY.replace(':3001', ':3000')}/marketplace\n`);
    } catch (error) {
        console.error('❌ Registration failed:', error.response?.data?.error || error.message);
        process.exit(1);
    }
}

async function listAPIs() {
    console.log('📋 Fetching registered APIs...\n');

    try {
        const response = await axios.get(`${FALCONE_REGISTRY}/api/list`);
        const apis = response.data.apis;

        if (apis.length === 0) {
            console.log('   No APIs registered yet.\n');
            return;
        }

        console.log(`   Found ${apis.length} API(s):\n`);
        apis.forEach((api, index) => {
            console.log(`   ${index + 1}. ${api.name}`);
            console.log(`      Price: ${api.price} ${api.asset}`);
            console.log(`      Endpoint: ${api.endpoint}`);
            console.log(`      Category: ${api.category}`);
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to fetch APIs:', error.message);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
Usage: npx falcone <command> [options]

Commands:
  register    Register a new API on the Falcone Marketplace
  list        List all registered APIs
  init        Initialize Falcone SDK in your project
  help        Show this help message

Examples:
  npx falcone register --name "AI Summary" --endpoint "https://api.example.com/summarize" --price 5 --wallet "GXXX..."
  npx falcone list

Environment Variables:
  FALCONE_REGISTRY    Override the default registry URL (default: http://localhost:3001)
  `);
}

function init() {
    console.log(`
📦 Falcone SDK Setup

1. Install the SDK:
   npm install falcone-sdk

2. Wrap your API endpoint:
   
   const express = require('express');
   const { protect } = require('falcone-sdk');
   
   const app = express();
   
   app.get('/api/my-endpoint', protect({
     price: { amount: '10', asset: 'XLM' },
     receiver: 'YOUR_STELLAR_WALLET_ADDRESS'
   }), (req, res) => {
     res.json({ data: 'Premium content!' });
   });

3. Register your API:
   npx falcone register --name "My API" --endpoint "http://..." --price 10 --wallet "GXXX..."

4. Your API is now live on the Falcone Marketplace! 🚀
  `);
}

// Main
printBanner();

switch (command) {
    case 'register':
        registerAPI();
        break;
    case 'list':
        listAPIs();
        break;
    case 'init':
        init();
        break;
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;
    default:
        showHelp();
}
