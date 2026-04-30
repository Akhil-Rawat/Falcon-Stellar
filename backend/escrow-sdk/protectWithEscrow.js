// Express middleware to enforce escrow-based prepaid API usage
// Layer 2: Wraps routes, enforces payment, returns HTTP 402 if insufficient balance

/**
 * Returns Express middleware that enforces prepaid escrow credits per API call.
 * @param {Object} opts
 * @param {Object} opts.escrowInstance - Instance of the escrow SDK
 * @param {string} opts.apiId - Unique API identifier
 * @param {string} opts.apiOwnerId - API owner's Stellar public key
 * @param {number} opts.pricePerCall - Credits required per call
 * @param {function} opts.getUserId - Function (req) => userId
 * @returns {function} Express middleware
 */
function protectWithEscrow({
  escrowInstance,
  apiId,
  apiOwnerId,
  pricePerCall,
  getUserId,
}) {
  // Return standard Express middleware
  return async function (req, res, next) {
    const userId = getUserId(req);
    if (!userId) {
      // If userId cannot be determined, treat as unpaid
      return res.status(402).json({
        error: "User ID required",
        pricePerCall,
        remainingBalance: 0,
      });
    }
    const balance = await escrowInstance.getUserBalance(userId);
    if (balance < pricePerCall) {
      // Not enough prepaid credits: HTTP 402 Payment Required
      return res.status(402).json({
        error: "Insufficient prepaid balance",
        pricePerCall,
        remainingBalance: balance,
      });
    }
    // Deduct credits for this call
    try {
      await escrowInstance.consumeCredit({
        userId,
        apiId,
        apiOwnerId,
        amount: pricePerCall,
      });
    } catch (err) {
      // Defensive: handle deduction errors
      return res.status(402).json({
        error: "Failed to deduct credits",
        details: err.message,
        pricePerCall,
        remainingBalance: balance,
      });
    }
    // Allow request to proceed
    next();
  };
}

module.exports = { protectWithEscrow };
