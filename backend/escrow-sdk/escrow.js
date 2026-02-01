// Main SDK logic for escrow-based prepaid usage
// Exports initEscrow and all required methods

const Ledger = require("./ledger");
const { verifyStellarPayment } = require("./stellarHelpers");

/**
 * Initialize the escrow SDK
 * @param {Object} config
 * @param {string} config.escrowPublicKey - Stellar escrow account public key
 * @param {string} config.asset - Only 'XLM' supported for now
 * @returns {Object} Escrow instance with required methods
 */
function initEscrow({ escrowPublicKey, asset }) {
  if (asset !== "XLM") {
    throw new Error("Only XLM asset supported");
  }
  const ledger = new Ledger();

  return {
    /**
     * Register user prepaid credits by verifying a Stellar payment
     * @param {Object} params
     * @param {string} params.userId
     * @param {string} params.txHash
     * @param {number} params.amount
     * @returns {Promise<number>} Updated user balance
     */
    async recordPrepayment({ userId, txHash, amount }) {
      // Prevent replay: check if txHash already used
      if (ledger.isTxUsed(txHash)) {
        throw new Error("Transaction hash already used");
      }
      // Verify payment on Stellar
      const payment = await verifyStellarPayment({
        txHash,
        escrowPublicKey,
        minAmount: amount,
      });
      // Defensive: check destination and asset
      if (payment.to !== escrowPublicKey) {
        throw new Error("Payment destination mismatch");
      }
      if (payment.asset !== "native") {
        throw new Error("Only native XLM payments supported");
      }
      if (payment.amount < amount) {
        throw new Error("Payment amount less than expected");
      }
      // Credit user in ledger
      return ledger.recordPrepayment(userId, txHash, amount);
    },

    /**
     * Deduct credits for API usage
     * @param {Object} params
     * @param {string} params.userId
     * @param {string} params.apiId
     * @param {string} params.apiOwnerId
     * @param {number} params.amount
     */
    consumeCredit({ userId, apiId, apiOwnerId, amount }) {
      // No blockchain interaction here
      ledger.consumeCredit(userId, apiOwnerId, amount);
    },

    /**
     * Get remaining prepaid balance for a user
     * @param {string} userId
     * @returns {number}
     */
    getUserBalance(userId) {
      return ledger.getUserBalance(userId);
    },

    /**
     * Get aggregated unpaid usage per apiOwnerId
     * @returns {Array<{apiOwnerId: string, amount: number}>}
     */
    getPendingPayouts() {
      return ledger.getPendingPayouts();
    },

    /**
     * Prepare batch settlement instructions for API owners
     * @returns {Array<{apiOwnerId: string, amount: number, payoutInstruction: object}>}
     */
    settleBatch() {
      const payouts = ledger.settleBatch();
      // Prepare payout instructions (do NOT sign or send tx)
      return payouts.map(({ apiOwnerId, amount }) => ({
        apiOwnerId,
        amount,
        payoutInstruction: {
          destination: apiOwnerId, // Assume apiOwnerId is Stellar public key
          asset: "XLM",
          amount,
          // No signature or tx here
        },
      }));
    },
  };
}

module.exports = {
  initEscrow,
};
