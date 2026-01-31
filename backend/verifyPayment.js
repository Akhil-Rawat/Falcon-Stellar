// verifyPayment.js
// Verifies a Stellar testnet payment by tx hash
// - checks success
// - checks destination
// - checks amount (XLM or other asset)
// - replay protection

const { Horizon } = require("stellar-sdk");

// ---- CONFIG (change only these if needed) ----
const HORIZON_URL = "https://horizon-testnet.stellar.org";
// --------------------------------------------

const server = new Horizon.Server(HORIZON_URL);

// Simple in-memory replay protection
const usedTxHashes = new Set();

/**
 * verifyPayment
 * @param {string} txHash
 * @param {number} expectedAmount
 * @param {string} expectedReceiver
 * @param {string} [expectedAsset='native'] - 'native' or 'CODE:ISSUER' (though currently only native logic is fully implemented below for simplicity, can be expanded)
 * @returns {Promise<boolean>} true if valid and unused, else false
 */
async function verifyPayment(
    txHash,
    expectedAmount,
    expectedReceiver,
    expectedAsset = "native"
) {
    try {
        // 1) Replay protection
        if (usedTxHashes.has(txHash)) {
            console.log(`Payment failed: Tx ${txHash} already used.`);
            return false;
        }

        // 2) Fetch transaction
        const tx = await server.transactions().transaction(txHash).call();
        if (!tx.successful) {
            console.log(`Payment failed: Tx ${txHash} was not successful.`);
            return false;
        }

        // 3) Fetch operations in this transaction
        const ops = await server.operations().forTransaction(txHash).call();

        // 4) Find a valid payment to RECEIVER with enough amount
        let valid = false;
        for (const op of ops.records) {
            // Basic check for native (XLM) payment
            // TODO: Add support for custom assets if needed (check asset_code/asset_issuer)
            if (
                op.type === "payment" &&
                op.asset_type === "native" && // currently strictly checking native for this version
                op.to === expectedReceiver &&
                Number(op.amount) >= expectedAmount
            ) {
                valid = true;
                break;
            }
        }

        if (!valid) {
            console.log(
                `Payment failed: No valid payment op found for ${expectedAmount} XLM to ${expectedReceiver}`
            );
            return false;
        }

        // 5) Mark tx as used (prevent reuse)
        usedTxHashes.add(txHash);
        return true;
    } catch (err) {
        console.error("verifyPayment error:", err.message);
        return false;
    }
}

module.exports = verifyPayment;
