// protect.js
// Simple, reusable Express middleware for Stellar payment protection

// Import the existing verifyPayment function (do not rewrite it)
const verifyPayment = require("./verifyPayment");

/**
 * protect() middleware for Express routes
 * @param {Object} config - Configuration object
 * @param {{ amount: string, asset: 'XLM' }} config.price - Payment price
 * @param {(req: import('express').Request) => boolean} [config.validateRequest] - Optional request validator
 * @returns {import('express').RequestHandler}
 */
function protect(config) {
    // Ensure required config is present
    if (!config || !config.price || !config.price.amount || !config.price.asset) {
        throw new Error("protect() requires a config with price { amount, asset }");
    }

    // Return the actual Express middleware
    return async function (req, res, next) {
        // 1. Optionally validate the request
        if (
            typeof config.validateRequest === "function" &&
            !config.validateRequest(req)
        ) {
            // If validation fails, return HTTP 400
            return res.status(400).json({ error: "Invalid request" });
        }

        // 2. Check for x-payment-tx header
        const txHash = req.header("x-payment-tx");
        if (!txHash) {
            // If missing, return HTTP 402 with x402-style headers
            res.set("X-Payment-Amount", config.price.amount);
            res.set("X-Payment-Asset", config.price.asset);
            // Use config.receiver if provided, otherwise fallback to env or error
            const receiver =
                config.receiver ||
                process.env.STELLAR_RECEIVER ||
                "GCXCAQEURH7OZ323SV65RFTXURU47IDOG4KBC72NXSBQVS3ACEMA7DFW";
            res.set("X-Payment-Receiver", receiver);
            return res.status(402).json({ error: "Payment required" });
        }

        // 3. If header exists, verify payment
        try {
            const receiver =
                config.receiver ||
                process.env.STELLAR_RECEIVER ||
                "GCXCAQEURH7OZ323SV65RFTXURU47IDOG4KBC72NXSBQVS3ACEMA7DFW";

            const valid = await verifyPayment(
                txHash,
                Number(config.price.amount),
                receiver,
                config.price.asset
            );
            if (!valid) {
                // If payment is invalid or reused, return HTTP 400
                return res.status(400).json({ error: "Invalid or reused payment" });
            }
            // If valid, unlock the API
            next();
        } catch (err) {
            // If verification fails (e.g. error thrown), return HTTP 400
            return res.status(400).json({ error: "Payment verification failed" });
        }
    };
}

// Export the middleware
module.exports = protect;
