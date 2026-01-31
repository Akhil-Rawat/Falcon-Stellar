/**
 * Falcone API Registration
 * Register your API on the Falcone marketplace
 */

const axios = require('axios');

// Default Falcone API Registry URL
const FALCONE_REGISTRY = process.env.FALCONE_REGISTRY || 'http://localhost:3001';

/**
 * Register an API on the Falcone marketplace
 * 
 * @param {Object} apiConfig - API configuration
 * @param {string} apiConfig.name - API name
 * @param {string} apiConfig.description - API description
 * @param {string} apiConfig.endpoint - Full API endpoint URL
 * @param {string} apiConfig.price - Price per call (e.g., "10")
 * @param {string} apiConfig.asset - Payment asset (e.g., "XLM")
 * @param {string} apiConfig.receiver - Wallet address to receive payments
 * @param {string} [apiConfig.category] - API category (e.g., "AI & ML", "Data", "Finance")
 * @param {string} [apiConfig.owner] - Owner/Provider name
 * @returns {Promise<Object>} Registration result
 * 
 * @example
 * const { registerAPI } = require('falcone-sdk');
 * 
 * await registerAPI({
 *   name: 'My Premium API',
 *   description: 'Amazing API that does cool things',
 *   endpoint: 'https://myapi.com/api/premium',
 *   price: '5',
 *   asset: 'XLM',
 *   receiver: 'GXXXXX...',
 *   category: 'AI & ML',
 *   owner: 'My Company'
 * });
 */
async function registerAPI(apiConfig) {
    // Validate required fields
    const required = ['name', 'description', 'endpoint', 'price', 'asset', 'receiver'];
    for (const field of required) {
        if (!apiConfig[field]) {
            throw new Error(`registerAPI requires '${field}' field`);
        }
    }

    try {
        const response = await axios.post(`${FALCONE_REGISTRY}/api/register`, {
            name: apiConfig.name,
            description: apiConfig.description,
            endpoint: apiConfig.endpoint,
            price: apiConfig.price,
            asset: apiConfig.asset,
            receiver: apiConfig.receiver,
            category: apiConfig.category || 'General',
            owner: apiConfig.owner || 'Anonymous',
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Registration failed: ${error.response.data.error || error.message}`);
        }
        throw new Error(`Registration failed: ${error.message}`);
    }
}

module.exports = { registerAPI };
