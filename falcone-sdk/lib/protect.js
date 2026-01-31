/**
 * Falcone Protect Middleware
 * Express middleware that requires Stellar payment to access API endpoints
 */

const axios = require('axios');

// Default Falcone API Registry URL
const FALCONE_REGISTRY = process.env.FALCONE_REGISTRY || 'http://localhost:3001';

// In-memory store for used transaction hashes (prevents replay attacks)
const usedTxHashes = new Set();

/**
 * Verify a Stellar payment transaction
 * @param {string} txHash - Transaction hash to verify
 * @param {number} expectedAmount - Expected payment amount
 * @param {string} receiver - Expected receiver address
 * @param {string} asset - Expected asset (XLM, USDC, etc.)
 */
async function verifyPayment(txHash, expectedAmount, receiver, asset = 'XLM') {
    // Check if tx hash was already used
    if (usedTxHashes.has(txHash)) {
        return false;
    }

    try {
        // Fetch transaction from Stellar Horizon
        const response = await axios.get(
            `https://horizon-testnet.stellar.org/transactions/${txHash}/operations`
        );

        const operations = response.data._embedded.records;

        // Find a payment operation matching our requirements
        for (const op of operations) {
            if (op.type === 'payment') {
                const isCorrectReceiver = op.to === receiver;
                const isCorrectAmount = parseFloat(op.amount) >= expectedAmount;
                const isCorrectAsset = asset === 'XLM'
                    ? op.asset_type === 'native'
                    : op.asset_code === asset;

                if (isCorrectReceiver && isCorrectAmount && isCorrectAsset) {
                    // Mark tx hash as used
                    usedTxHashes.add(txHash);
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Payment verification error:', error.message);
        return false;
    }
}

/**
 * Falcone Protect Middleware
 * Wraps an Express endpoint with Stellar payment protection
 * 
 * @param {Object} config - Configuration object
 * @param {Object} config.price - Price configuration { amount: string, asset: string }
 * @param {string} config.receiver - Stellar wallet address to receive payments
 * @param {Function} [config.validateRequest] - Optional request validator function
 * @returns {Function} Express middleware
 * 
 * @example
 * const { protect } = require('falcone-sdk');
 * 
 * app.get('/api/premium', protect({
 *   price: { amount: '10', asset: 'XLM' },
 *   receiver: 'GXXXXX...'
 * }), (req, res) => {
 *   res.json({ data: 'Premium content!' });
 * });
 */
function protect(config) {
    // Validate config
    if (!config || !config.price || !config.price.amount || !config.price.asset) {
        throw new Error('Falcone protect() requires config with price { amount, asset }');
    }
    if (!config.receiver) {
        throw new Error('Falcone protect() requires a receiver wallet address');
    }

    return async function falconeMiddleware(req, res, next) {
        // 1. Optional request validation
        if (typeof config.validateRequest === 'function' && !config.validateRequest(req)) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // 2. Check for payment transaction header
        const txHash = req.header('x-payment-tx');

        if (!txHash) {
            // No payment provided - return 402 with payment details
            res.set('X-Payment-Amount', config.price.amount);
            res.set('X-Payment-Asset', config.price.asset);
            res.set('X-Payment-Receiver', config.receiver);
            return res.status(402).json({
                error: 'Payment required',
                payment: {
                    amount: config.price.amount,
                    asset: config.price.asset,
                    receiver: config.receiver,
                }
            });
        }

        // 3. Verify the payment
        try {
            const isValid = await verifyPayment(
                txHash,
                parseFloat(config.price.amount),
                config.receiver,
                config.price.asset
            );

            if (!isValid) {
                return res.status(400).json({ error: 'Invalid or already used payment' });
            }

            // Payment verified - proceed to API handler
            next();
        } catch (error) {
            console.error('Payment verification error:', error);
            return res.status(500).json({ error: 'Payment verification failed' });
        }
    };
}

module.exports = protect;
