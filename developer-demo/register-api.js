/**
 * ============================================
 * REGISTER API TO FALCONE MARKETPLACE
 * ============================================
 * 
 * Run this script to register your API on the
 * Falcone Marketplace so users can discover and pay for it.
 * 
 * Usage: npm run register
 */

require('dotenv').config();
const { registerAPI } = require('@anshu007/falcone-sdk');

async function register() {
    console.log('');
    console.log('📝 Registering API to Falcone Marketplace...');
    console.log('');

    const apiDetails = {
        name: process.env.API_NAME,
        description: process.env.API_DESCRIPTION,
        endpoint: `http://localhost:${process.env.PORT || 4000}/api/summarize`,
        price: process.env.API_PRICE,
        asset: process.env.API_ASSET || 'XLM',
        receiver: process.env.STELLAR_WALLET,
        category: process.env.API_CATEGORY || 'General',
        owner: process.env.OWNER_NAME || 'Anonymous',
    };

    console.log('API Details:');
    console.log('────────────────────────────────────────');
    console.log(`  Name:        ${apiDetails.name}`);
    console.log(`  Description: ${apiDetails.description}`);
    console.log(`  Endpoint:    ${apiDetails.endpoint}`);
    console.log(`  Price:       ${apiDetails.price} ${apiDetails.asset}`);
    console.log(`  Category:    ${apiDetails.category}`);
    console.log(`  Owner:       ${apiDetails.owner}`);
    console.log(`  Wallet:      ${apiDetails.receiver.slice(0, 12)}...`);
    console.log('────────────────────────────────────────');
    console.log('');

    try {
        const result = await registerAPI(apiDetails, {
            registryUrl: process.env.FALCONE_REGISTRY || 'http://localhost:3001',
        });

        console.log('✅ SUCCESS! API registered to marketplace!');
        console.log('');
        console.log('🎉 Your API is now live on the Falcone Marketplace!');
        console.log('   Users can discover it at: http://localhost:3000/marketplace');
        console.log('');
        console.log('📊 API ID:', result.api?.id);
        console.log('');
    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        console.log('');
        console.log('Troubleshooting:');
        console.log('  1. Make sure the Falcone backend is running (localhost:3001)');
        console.log('  2. Check your .env file has all required fields');
        console.log('  3. Ensure your wallet address is valid');
    }
}

register();
