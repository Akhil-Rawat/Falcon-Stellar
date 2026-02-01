/**
 * Falcone Escrow Middleware
 * Prepaid escrow-based API protection
 * Users prepay to escrow wallet, then consume credits on API calls
 */

const axios = require("axios");

// Default Falcone Escrow Server URL
const ESCROW_SERVER =
  process.env.FALCONE_ESCROW_SERVER || "http://localhost:3001";

/**
 * Get user ID from request (developer can override this)
 * @param {Object} req - Express request object
 * @returns {string|null} User ID
 */
function defaultGetUserId(req) {
  return req.headers["x-user-id"] || req.query.userId || null;
}

/**
 * Falcone Escrow Protect Middleware
 * Deducts prepaid credits from user's escrow balance
 *
 * @param {Object} config - Configuration object
 * @param {string} config.apiId - Unique API identifier
 * @param {string} config.apiOwnerId - API owner's Stellar wallet address
 * @param {number} config.pricePerCall - Credits required per call
 * @param {string} [config.escrowServer] - Escrow server URL (optional)
 * @param {Function} [config.getUserId] - Function to extract user ID from request
 * @returns {Function} Express middleware
 *
 * @example
 * const { protectWithEscrow } = require('falcone-sdk');
 *
 * app.get('/api/premium', protectWithEscrow({
 *   apiId: 'my-api',
 *   apiOwnerId: 'GXXXXX...',
 *   pricePerCall: 5,
 * }), (req, res) => {
 *   res.json({ data: 'Premium content!' });
 * });
 */
function protectWithEscrow(config) {
  // Validate config
  if (!config || !config.apiId) {
    throw new Error("Falcone protectWithEscrow() requires config.apiId");
  }
  if (!config.apiOwnerId) {
    throw new Error(
      "Falcone protectWithEscrow() requires config.apiOwnerId (your Stellar wallet)",
    );
  }
  if (typeof config.pricePerCall !== "number" || config.pricePerCall <= 0) {
    throw new Error(
      "Falcone protectWithEscrow() requires config.pricePerCall (number > 0)",
    );
  }

  const escrowServer = config.escrowServer || ESCROW_SERVER;
  const getUserId = config.getUserId || defaultGetUserId;

  return async function falconeEscrowMiddleware(req, res, next) {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(402).json({
        error: "User ID required",
        message:
          "Please provide user ID via x-user-id header or userId query param",
        pricePerCall: config.pricePerCall,
        remainingBalance: 0,
      });
    }

    try {
      // Check user balance
      const balanceResponse = await axios.get(
        `${escrowServer}/escrow/balance/${userId}`,
      );

      const balance = balanceResponse.data.balance || 0;

      if (balance < config.pricePerCall) {
        return res.status(402).json({
          error: "Insufficient prepaid balance",
          message: `You need ${config.pricePerCall} XLM but have ${balance} XLM. Please fund your escrow wallet.`,
          pricePerCall: config.pricePerCall,
          remainingBalance: balance,
          escrowInfo: `${escrowServer}/escrow/info`,
        });
      }

      // Deduct credits (consume)
      await axios.post(`${escrowServer}/escrow/consume`, {
        userId,
        apiId: config.apiId,
        apiOwnerId: config.apiOwnerId,
        amount: config.pricePerCall,
      });

      // Attach updated balance to response
      const newBalance = balance - config.pricePerCall;
      res.locals.escrowBalance = newBalance;

      // Proceed to API handler
      next();
    } catch (error) {
      console.error("Escrow verification error:", error.message);

      // If it's a 402 from the escrow server, pass it through
      if (error.response && error.response.status === 402) {
        return res.status(402).json(error.response.data);
      }

      return res.status(500).json({
        error: "Escrow verification failed",
        details: error.message,
      });
    }
  };
}

module.exports = protectWithEscrow;
